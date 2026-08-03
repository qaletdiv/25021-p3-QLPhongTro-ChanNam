const { Op } = require("sequelize");
const { Tenant, Contract, Room, Building, ContractFurniture, Furniture, Notification, Invoice } = require("../models");
const { findTenantByUser, findActiveContract } = require("../utils/tenantHelpers");

exports.getDashboard = async (req, res, next) => {
    try {
        let tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });

        const furnituresInclude = {
            model: ContractFurniture, as: "contractFurnitures",
            include: [{ model: Furniture, as: "furniture" }]
        };

        const buildingInclude = { model: Building, as: "building", attributes: ["id", "name", "address"] };

        const invoiceInclude = { model: Invoice, as: "invoices", required: false, order: [['createdAt', 'DESC']] };

        const contractInclude = [
            { model: Room, as: "room", include: [buildingInclude] },
            furnituresInclude,
            invoiceInclude
        ];

        let contract = await findActiveContract(tenant.id, contractInclude);

        if (!contract) {
            contract = await Contract.findOne({
                where: { status: 'active' },
                include: [{
                    model: Room, as: "room", include: [buildingInclude]
                }, {
                    model: Tenant, as: "tenant",
                    where: { name: req.user.name, phone: req.user.phone }
                }, furnituresInclude, invoiceInclude]
            });
            if (contract) tenant = contract.tenant;
        }

        let notifications = [];
        if (contract) {
            notifications = await Notification.findAll({
                where: {
                    landlordId: contract.room.landlordId,
                    status: 'sent',
                    [Op.or]: [
                        { targetType: 'all' },
                        { targetType: 'specific_rooms', targetRoomIds: { [Op.like]: `%"${contract.roomId}"%` } }
                    ]
                },
                order: [['createdAt', 'DESC']],
                limit: 20
            });
        }

        res.json({ tenant, contract, notifications });
    } catch (error) {
        next(error);
    }
};

exports.getUtilityUsage = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });

        const contract = await findActiveContract(tenant.id);
        if (!contract) return res.json({ year: null, chartData: [] });

        const year = new Date(contract.startDate).getFullYear();

        const invoices = await Invoice.findAll({
            where: { contractId: contract.id },
            attributes: ["month", "electricityNew", "electricityOld", "waterNew", "waterOld"]
        });

        const byMonth = {};
        invoices.forEach((inv) => {
            byMonth[inv.month] = {
                electricity: Math.max(0, Number(inv.electricityNew) - Number(inv.electricityOld)),
                water: Math.max(0, Number(inv.waterNew) - Number(inv.waterOld)),
            };
        });

        const chartData = [];
        for (let m = 1; m <= 12; m++) {
            const key = `${String(m).padStart(2, "0")}/${year}`;
            const d = byMonth[key] || { electricity: 0, water: 0 };
            chartData.push({ month: key, label: `T${m}`, electricity: d.electricity, water: d.water });
        }

        res.json({ year, chartData });
    } catch (error) {
        next(error);
    }
};
