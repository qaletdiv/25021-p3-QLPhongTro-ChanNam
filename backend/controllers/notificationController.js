const { Op } = require("sequelize");
const { Notification, Room, Contract, Tenant } = require("../models");
const telegram = require("../utils/telegram");

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

        let activeContracts = [];
        if (targetType === 'all') {
            activeContracts = await Contract.findAll({
                where: { status: 'active' },
                include: [
                    { model: Room, as: "room", where: { landlordId: req.user.id }, required: true },
                    { model: Tenant, as: "tenant", required: true }
                ]
            });
        } else if (targetType === 'specific_rooms' && targetRoomIds && targetRoomIds.length > 0) {
            activeContracts = await Contract.findAll({
                where: { status: 'active' },
                include: [
                    {
                        model: Room, as: "room",
                        where: { id: { [Op.in]: targetRoomIds }, landlordId: req.user.id },
                        required: true
                    },
                    { model: Tenant, as: "tenant", required: true }
                ]
            });
        }

        const notification = await Notification.create({
            title, content, targetType,
            targetRoomIds: targetRoomIds ? JSON.stringify(targetRoomIds) : null,
            sentAt: new Date(),
            recipientCount: activeContracts.length,
            status: 'sent',
            landlordId: req.user.id
        });

        let delivered = 0;
        for (const contract of activeContracts) {
            const chatId = contract.tenant ? contract.tenant.telegramChatId : null;
            if (!chatId) continue;
            const buildingId = contract.room ? contract.room.buildingId : null;
            const text = telegram.formatMessage(content, {
                tenantName: contract.tenant.name,
                roomNumber: contract.room ? contract.room.room_number : "",
                totalAmount: contract.price != null ? contract.price : "",
                dueDate: contract.paymentDay ? `ngay ${contract.paymentDay}` : ""
            });
            try {
                await telegram.sendMessage({ landlordId: req.user.id, buildingId, chatId, text });
                delivered += 1;
            } catch (e) {
                console.error("Telegram send failed:", e.message);
            }
        }

        res.status(201).json({ message: "Tao thong bao thanh cong", notification, delivered });
    } catch (error) {
        next(error);
    }
};
