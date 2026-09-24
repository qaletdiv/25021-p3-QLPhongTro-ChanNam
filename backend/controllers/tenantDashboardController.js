const { Op } = require("sequelize");
const { Tenant, Contract, Room, Building, ContractFurniture, Furniture, Notification, Invoice, Companion } = require("../models");
const { findTenantByUser, findActiveContract, findActiveContracts, resolveContract } = require("../utils/tenantHelpers");
const { monthStr } = require("../utils/dates");

// Lightweight check used by tenant pages (invoices, issues) to decide whether
// the tenant has been assigned a room/active contract.
exports.getActiveContract = async (req, res, next) => {
  try {
    const tenant = await findTenantByUser(req.user.id);
    if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });
    const contract = await findActiveContract(tenant.id);
    res.json({ contract: contract || null });
  } catch (err) {
    next(err);
  }
};

const buildingInclude = { model: Building, as: "building", attributes: ["id", "name", "address"] };

exports.getDashboard = async (req, res, next) => {
    try {
        let tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });

        const furnituresInclude = {
            model: ContractFurniture, as: "contractFurnitures",
            include: [{ model: Furniture, as: "furniture" }]
        };

        const invoiceInclude = { model: Invoice, as: "invoices", required: false, order: [['createdAt', 'DESC']] };

        const contractInclude = [
            { model: Room, as: "room", include: [buildingInclude] },
            furnituresInclude,
            invoiceInclude
        ];

        let contracts = await findActiveContracts(tenant.id, contractInclude);

        if (!contracts || contracts.length === 0) {
            contracts = await Contract.findAll({
                where: { status: 'active' },
                include: [{
                    model: Room, as: "room", include: [buildingInclude]
                }, {
                    model: Tenant, as: "tenant",
                    where: { name: req.user.name, phone: req.user.phone }
                }, furnituresInclude, invoiceInclude]
            });
            if (contracts.length > 0) {
                tenant = contracts[0].tenant;
                // Ensure the tenant's linked user info is consistent
            }
        }

        // Khách có thể thuê NHIỀU PHÒNG cùng lúc / nối tiếp nhau. Các hợp đồng luôn
        // sắp xếp theo startDate giảm dần để phòng mới nhất là hợp đồng mặc định
        // (trước đây lấy contracts[0] = hợp đồng cũ nhất -> vào phòng mới vẫn thấy
        // thông báo của phòng cũ).
        contracts.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
        const contract = contracts[0] || null;

        // Gom roomId theo landlord của TẤT CẢ hợp đồng active để thông báo
        // 'all' của landlord nào cũng chỉ hiện với khách đang có phòng ở đó,
        // và mỗi notification mang matchedRoomIds để UI lọc đúng theo phòng đang chọn.
        const roomIdsByLandlord = {};
        for (const c of contracts) {
            const lid = c.room?.landlordId;
            if (lid == null || c.roomId == null) continue;
            (roomIdsByLandlord[lid] ??= new Set()).add(String(c.roomId));
        }
        const landlordIds = Object.keys(roomIdsByLandlord).map(Number);

        let notifications = [];
        let companions = [];
        if (landlordIds.length > 0) {
            const sent = await Notification.findAll({
                where: { landlordId: { [Op.in]: landlordIds }, status: 'sent' },
                order: [['createdAt', 'DESC']],
                limit: 50
            });
            notifications = sent
                .map(n => {
                    const mine = roomIdsByLandlord[n.landlordId] || new Set();
                    let targets = null;
                    try { targets = n.targetRoomIds ? JSON.parse(n.targetRoomIds) : null; } catch { /* coi như broadcast */ }
                    const matched = !Array.isArray(targets) || targets.length === 0
                        ? [...mine].map(Number)
                        : targets.filter(r => mine.has(String(r))).map(Number);
                    return { ...n.toJSON(), matchedRoomIds: matched };
                });
        }
        if (contract) {
            companions = await Companion.findAll({
                where: { tenantId: contract.tenantId, status: 'active' },
                order: [["createdAt", "ASC"]]
            });
        }

        res.json({ tenant, contract, contracts, notifications, companions });
    } catch (error) {
        next(error);
    }
};

exports.getUtilityUsage = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });

        const contract = await resolveContract(tenant.id, req.query.contractId, [{ model: Room, as: "room", include: [buildingInclude] }]);
        if (!contract) return res.json({ year: null, chartData: [] });

        const start = new Date(contract.startDate);
        const startYear = start.getFullYear();
        const startMonth = start.getMonth(); // 0-based

        const invoices = await Invoice.findAll({
            where: { contractId: contract.id },
            attributes: ["month", "electricityNew", "electricityOld", "waterNew", "waterOld"]
        });

        const moveInKey = monthStr(start);

        const byMonth = {};
        invoices.forEach((inv) => {
            byMonth[inv.month] = {
                electricity: Math.max(0, Number(inv.electricityNew) - Number(inv.electricityOld)),
                water: Math.max(0, Number(inv.waterNew) - Number(inv.waterOld)),
            };
        });
        // Chỉ số ban đầu (tháng vào) không tính là tiêu thụ, chỉ số cũ = 0 là baseline
        if (byMonth[moveInKey]) {
            byMonth[moveInKey] = { electricity: 0, water: 0 };
        }

        const chartData = [];
        for (let i = 0; i < 12; i++) {
            const d = new Date(startYear, startMonth + i, 1);
            const key = monthStr(d);
            const entry = byMonth[key] || { electricity: 0, water: 0 };
            chartData.push({
                month: key,
                label: `T${i + 1}`,
                monthLabel: `${d.getMonth() + 1}/${d.getFullYear()}`,
                electricity: entry.electricity,
                water: entry.water,
            });
        }

        res.json({ year: startYear, chartData });
    } catch (error) {
        next(error);
    }
};
