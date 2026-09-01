const { Op } = require("sequelize");
const { Room, Contract, Tenant, Invoice, Issue, Building } = require("../models");
const { monthStr } = require("../utils/dates");
const { getAccessibleBuildingIds, roomAccessCondition } = require("../utils/buildingAccess");
const { getAccessibleTenantIds } = require("../utils/tenantScope");

exports.getStats = async (req, res, next) => {
    try {
        const landlordId = req.user.id;
        const accIds = await getAccessibleBuildingIds(landlordId);
        const buildingId = req.query.buildingId ? Number(req.query.buildingId) : null;
        const roomWhere = { ...roomAccessCondition(landlordId, accIds) };
        if (buildingId && accIds.includes(buildingId)) roomWhere.buildingId = buildingId;

        const rooms = await Room.findAll({ where: roomWhere });
        const total = rooms.length;
        const empty = rooms.filter(r => r.status === 'empty').length;
        const rented = rooms.filter(r => r.status === 'rented').length;

        const activeContracts = await Contract.findAll({
            where: { status: 'active' },
            include: [{ model: Room, as: "room", where: roomWhere, attributes: [] }]
        });
        const currentTenants = activeContracts.length;

        const cMonth = monthStr(new Date());
        const paidInvoices = await Invoice.findAll({
            where: { status: 'paid', month: cMonth },
            include: [{ model: Contract, as: "contract", required: true, include: [{ model: Room, as: "room", where: roomWhere, required: true, attributes: [] }] }]
        });
        const monthlyRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

        const unpaidInvoices = await Invoice.findAll({
            where: { status: { [Op.in]: ['pending', 'submitted'] } },
            include: [{ model: Contract, as: "contract", required: true, include: [{ model: Room, as: "room", where: roomWhere, required: true, attributes: [] }] }]
        });
        const totalDebt = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

        const unpaidThisMonth = await Invoice.findAll({
            where: { status: 'pending', month: cMonth },
            include: [{ model: Contract, as: "contract", required: true, include: [{ model: Room, as: "room", where: roomWhere, required: true, attributes: [] }] }]
        });
        const unpaidTenants = unpaidThisMonth.length;

        res.json({ totalRooms: total, emptyRooms: empty, rentedRooms: rented, currentTenants, monthlyRevenue, totalDebt, unpaidTenants, unpaidMonth: cMonth });
    } catch (error) {
        next(error);
    }
};

exports.getMonthlyRevenue = async (req, res, next) => {
    try {
        const landlordId = req.user.id;
        const accIds = await getAccessibleBuildingIds(landlordId);
        const buildingId = req.query.buildingId ? Number(req.query.buildingId) : null;
        const roomWhere = { ...roomAccessCondition(landlordId, accIds) };
        if (buildingId && accIds.includes(buildingId)) roomWhere.buildingId = buildingId;

        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            months.push(monthStr(new Date(now.getFullYear(), now.getMonth() - i, 1)));
        }

        const paidInvoices = await Invoice.findAll({
            where: { status: 'paid', month: { [Op.in]: months } },
            attributes: ['month', 'total'],
            include: [{ model: Contract, as: "contract", required: true, include: [{ model: Room, as: "room", where: roomWhere, required: true, attributes: [] }] }]
        });

        const revenueByMonth = {};
        months.forEach((m) => (revenueByMonth[m] = 0));
        paidInvoices.forEach((inv) => {
            if (revenueByMonth[inv.month] !== undefined) revenueByMonth[inv.month] += Number(inv.total);
        });

        const chartData = months.map((m) => ({ month: m, revenue: revenueByMonth[m] }));
        res.json({ chartData });
    } catch (error) {
        next(error);
    }
};

exports.getNotifications = async (req, res, next) => {
    try {
        const landlordId = req.user.id;
        const accIds = await getAccessibleBuildingIds(landlordId);

        const unpaidInvoices = await Invoice.findAll({
            where: { status: { [Op.in]: ['pending', 'submitted'] } },
            attributes: ['id', 'month'],
            include: [{ model: Contract, as: "contract", required: true, include: [{ model: Room, as: "room", where: roomAccessCondition(landlordId, accIds), required: true, attributes: ['room_number'] }] }]
        });
        const pendingIssues = await Issue.count({
            where: { status: 'pending' },
            include: [{ model: Room, as: "room", required: true, where: roomAccessCondition(landlordId, accIds) }]
        });

        // Người thuê chưa có phòng (chưa có hợp đồng active) - đồng bộ với trang /landlord/tenants.
        // Chỉ xét khách thuê thuộc nhà mình sở hữu / được chia sẻ, không quét toàn bộ bảng tenants.
        const accessibleTenantIds = await getAccessibleTenantIds(landlordId, accIds);
        let pendingTenants = [];
        if (accessibleTenantIds.length) {
            const scopedTenants = await Tenant.findAll({
                where: { id: { [Op.in]: accessibleTenantIds } },
                attributes: ['id', 'name', 'phone']
            });
            const activeTenantIds = new Set((await Contract.findAll({
                where: { status: 'active', tenantId: { [Op.in]: accessibleTenantIds } },
                attributes: ['tenantId']
            })).map((c) => c.tenantId));
            pendingTenants = scopedTenants.filter((t) => !activeTenantIds.has(t.id));
        }

        const items = [];
        for (const inv of unpaidInvoices) {
            const [mm, yyyy] = String(inv.month).split("/");
            items.push({
                kind: 'invoice',
                title: 'Hóa đơn cần xử lý',
                message: `Có phòng ${inv.contract?.room?.room_number || "?"} gửi tiền nhà tháng ${mm} năm ${yyyy} chờ xác nhận`,
                count: 1,
                link: '/landlord/invoices'
            });
        }
        if (pendingIssues > 0) {
            items.push({ kind: 'issue', title: 'Báo hỏng cần xem', message: `Có ${pendingIssues} báo hỏng đang chờ xử lý`, count: pendingIssues, link: '/landlord/issues' });
        }
        for (const t of pendingTenants) {
            items.push({
                kind: 'tenant_no_room',
                title: `${t.name} — ${t.phone}`,
                message: 'Chưa có phòng, vui lòng lập hợp đồng',
                count: 1,
                link: '/landlord/tenants',
                tenantId: t.id
            });
        }

        res.json({ unreadCount: unpaidInvoices.length + pendingIssues + pendingTenants.length, items });
    } catch (error) {
        next(error);
    }
};

exports.getExpiringContracts = async (req, res, next) => {
    try {
        const landlordId = req.user.id;
        const accIds = await getAccessibleBuildingIds(landlordId);
        const buildingId = req.query.buildingId ? Number(req.query.buildingId) : null;
        const roomWhere = { ...roomAccessCondition(landlordId, accIds) };
        if (buildingId && accIds.includes(buildingId)) roomWhere.buildingId = buildingId;

        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

        const contracts = await Contract.findAll({
            where: {
                status: 'active',
                endDate: { [Op.lte]: thirtyDaysLater }
            },
            include: [
                { model: Tenant, as: "tenant", attributes: ["name", "phone"] },
                { model: Room, as: "room", where: roomWhere, attributes: ["room_number"] }
            ],
            order: [['endDate', 'ASC']]
        });

        res.json({ contracts });
    } catch (error) {
        next(error);
    }
};

exports.getUtilityUsage = async (req, res, next) => {
    try {
        const landlordId = req.user.id;
        const accIds = await getAccessibleBuildingIds(landlordId);
        const buildingId = req.query.buildingId ? Number(req.query.buildingId) : null;
        const now = new Date();
        const defaultMonth = `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
        const month = /^\d{2}\/\d{4}$/.test(String(req.query.month || "")) ? String(req.query.month) : defaultMonth;

        const roomWhere = { ...roomAccessCondition(landlordId, accIds) };
        if (buildingId) roomWhere.buildingId = buildingId;

        const rooms = await Room.findAll({
            where: roomWhere,
            attributes: ["id", "room_number", "buildingId"],
            include: [{ model: Building, as: "building", attributes: ["name"] }],
            order: [["room_number", "ASC"]]
        });

        const invoices = await Invoice.findAll({
            where: { month },
            attributes: ["contractId", "month", "electricityOld", "electricityNew", "waterOld", "waterNew"],
            include: [{ model: Contract, as: "contract", attributes: ["roomId"], where: { status: "active" } }]
        });

        const roomMap = new Map(rooms.map((r) => [r.id, r]));
        const latestByRoom = new Map();
        for (const inv of invoices) {
            const roomId = inv.contract?.roomId;
            if (!roomId || !roomMap.has(roomId)) continue;
            const prev = latestByRoom.get(roomId);
            if (!prev || inv.month > prev.month) latestByRoom.set(roomId, inv);
        }

        const chartData = [];
        for (const roomId of roomMap.keys()) {
            const room = roomMap.get(roomId);
            const inv = latestByRoom.get(roomId);
            chartData.push({
                roomId,
                room: room.room_number,
                building: room.building?.name || "—",
                electricity: inv ? Math.max(0, Number(inv.electricityNew) - Number(inv.electricityOld)) : 0,
                water: inv ? Math.max(0, Number(inv.waterNew) - Number(inv.waterOld)) : 0,
                month: inv?.month || null,
            });
        }

        res.json({ chartData });
    } catch (error) {
        next(error);
    }
};
