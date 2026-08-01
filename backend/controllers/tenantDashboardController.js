const { Op } = require("sequelize");
const { Tenant, Contract, Room, Building, ContractFurniture, Furniture, Notification, Invoice } = require("../models");

exports.getDashboard = async (req, res, next) => {
    try {
        let tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const furnituresInclude = {
            model: ContractFurniture, as: "contractFurnitures",
            include: [{ model: Furniture, as: "furniture" }]
        };

        const buildingInclude = { model: Building, as: "building", attributes: ["id", "name", "address"] };

        const contractInclude = [
            { model: Room, as: "room", include: [buildingInclude] },
            furnituresInclude,
            { model: Invoice, as: "invoices", required: false, order: [['createdAt', 'DESC']] }
        ];

        let contract = await Contract.findOne({
            where: { tenantId: tenant.id, status: 'active' },
            include: contractInclude
        });

        if (!contract) {
            contract = await Contract.findOne({
                where: { status: 'active' },
                include: [{
                    model: Room, as: "room", include: [buildingInclude]
                }, {
                    model: Tenant, as: "tenant",
                    where: { name: req.user.name, phone: req.user.phone }
                }, furnituresInclude, { model: Invoice, as: "invoices", required: false, order: [['createdAt', 'DESC']] }]
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
