const { Op } = require("sequelize");
const { Tenant, Contract, Room, ContractFurniture, Notification } = require("../models");

exports.getDashboard = async (req, res, next) => {
    try {
        let tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        let contract = await Contract.findOne({
            where: { tenantId: tenant.id, status: 'active' },
            include: [
                { model: Room, as: "room" },
                { model: ContractFurniture, as: "contractFurnitures" }
            ]
        });

        if (!contract) {
            contract = await Contract.findOne({
                where: { status: 'active' },
                include: [{
                    model: Room, as: "room"
                }, {
                    model: Tenant, as: "tenant",
                    where: { name: req.user.name, phone: req.user.phone }
                }, {
                    model: ContractFurniture, as: "contractFurnitures"
                }]
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
