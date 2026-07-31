const { Op } = require("sequelize");
const { Notification, Room, Contract, Tenant } = require("../models");

exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.findAll({
            where: { landlordId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ notifications });
    } catch (error) {
        next(error);
    }
};

exports.createNotification = async (req, res, next) => {
    try {
        const { title, content, targetType, targetRoomIds } = req.body;

        let recipientCount = 0;
        if (targetType === 'all') {
            const activeContracts = await Contract.findAll({
                where: { status: 'active' },
                include: [{ model: Room, as: "room", where: { landlordId: req.user.id }, required: true }]
            });
            recipientCount = activeContracts.length;
        } else if (targetType === 'specific_rooms' && targetRoomIds && targetRoomIds.length > 0) {
            const activeContracts = await Contract.findAll({
                where: { status: 'active' },
                include: [{
                    model: Room, as: "room",
                    where: { id: { [Op.in]: targetRoomIds }, landlordId: req.user.id },
                    required: true
                }]
            });
            recipientCount = activeContracts.length;
        }

        const notification = await Notification.create({
            title, content, targetType,
            targetRoomIds: targetRoomIds ? JSON.stringify(targetRoomIds) : null,
            sentAt: new Date(),
            recipientCount,
            status: 'sent',
            landlordId: req.user.id
        });

        res.status(201).json({ message: "Tao thong bao thanh cong", notification });
    } catch (error) {
        next(error);
    }
};
