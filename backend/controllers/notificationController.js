const { Op } = require("sequelize");
const { Notification, Room, Contract, Tenant } = require("../models");
const telegram = require("../utils/telegram");
const push = require("../utils/push");
const { getAccessibleBuildingIds, roomAccessCondition } = require("../utils/buildingAccess");

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

exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Notification.update({ isRead: true }, { where: { id, landlordId: req.user.id } });
        res.json({ message: "Đã đánh dấu đã đọc" });
    } catch (error) {
        next(error);
    }
};

exports.createNotification = async (req, res, next) => {
    try {
        const { title, content, targetType, targetRoomIds } = req.body;
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const roomScope = roomAccessCondition(req.user.id, accIds);

        let activeContracts = [];
        if (targetType === 'all') {
            activeContracts = await Contract.findAll({
                where: { status: 'active' },
                include: [
                    { model: Room, as: "room", where: roomScope, required: true },
                    { model: Tenant, as: "tenant", required: true }
                ]
            });
        } else if (targetType === 'specific_rooms' && targetRoomIds && targetRoomIds.length > 0) {
            activeContracts = await Contract.findAll({
                where: { status: 'active' },
                include: [
                    {
                        model: Room, as: "room",
                        where: { id: { [Op.in]: targetRoomIds }, ...roomScope },
                        required: true
                    },
                    { model: Tenant, as: "tenant", required: true }
                ]
            });
        }

        const notifications = [];
        const deliveredMap = {};
        const pushedUserIds = new Set();

        if (targetType === 'specific_rooms' && targetRoomIds && targetRoomIds.length > 0) {
            const roomContracts = {};
            for (const contract of activeContracts) {
                const rid = contract.roomId;
                if (!roomContracts[rid]) roomContracts[rid] = [];
                roomContracts[rid].push(contract);
            }
            for (const rid of Object.keys(roomContracts)) {
                const roomContractsForRoom = roomContracts[rid];
                const roomNumber = roomContractsForRoom[0]?.room?.room_number || "";
                const resolvedContent = content.replace(/\{\{\s*MAPHONG\s*\}\}/g, roomNumber);
                const resolvedTitle = title.replace(/\{\{\s*MAPHONG\s*\}\}/g, roomNumber);
                const notif = await Notification.create({
                    title: resolvedTitle, content: resolvedContent, targetType,
                    targetRoomIds: JSON.stringify([String(rid)]),
                    sentAt: new Date(),
                    recipientCount: roomContractsForRoom.length,
                    status: 'sent',
                    landlordId: req.user.id
                });
                notifications.push(notif);
                deliveredMap[rid] = { delivered: 0, pushDelivered: 0 };
                for (const contract of roomContractsForRoom) {
                    const chatId = contract.tenant ? contract.tenant.telegramChatId : null;
                    if (chatId) {
                        const buildingId = contract.room ? contract.room.buildingId : null;
                        const text = telegram.formatMessage(resolvedContent, {
                            tenantName: contract.tenant.name,
                            roomNumber,
                            totalAmount: contract.price != null ? contract.price : "",
                            dueDate: contract.paymentDay ? `ngay ${contract.paymentDay}` : ""
                        });
                        try {
                            await telegram.sendMessage({ landlordId: req.user.id, buildingId, chatId, text });
                            deliveredMap[rid].delivered += 1;
                        } catch (e) {
                            console.error("Telegram send failed:", e.message);
                        }
                    }
                    if (contract.tenant && contract.tenant.userId && !pushedUserIds.has(contract.tenant.userId)) {
                        pushedUserIds.add(contract.tenant.userId);
                        try {
                            const res2 = await push.sendToUser(contract.tenant.userId, {
                                title: `Thông báo: ${resolvedTitle}`,
                                body: resolvedContent.slice(0, 140),
                                url: "/tenant/dashboard",
                                roomNumber
                            });
                            deliveredMap[rid].pushDelivered += res2.delivered;
                        } catch (e) {
                            console.error("Push send failed:", e.message);
                        }
                    }
                }
            }
        } else {
            const notif = await Notification.create({
                title, content, targetType,
                targetRoomIds: targetRoomIds ? JSON.stringify(targetRoomIds.map(String)) : null,
                sentAt: new Date(),
                recipientCount: activeContracts.length,
                status: 'sent',
                landlordId: req.user.id
            });
            notifications.push(notif);
            deliveredMap['all'] = { delivered: 0, pushDelivered: 0 };
            for (const contract of activeContracts) {
                const chatId = contract.tenant ? contract.tenant.telegramChatId : null;
                if (chatId) {
                    const buildingId = contract.room ? contract.room.buildingId : null;
                    const roomNumber = contract.room ? contract.room.room_number : "";
                    const text = telegram.formatMessage(content, {
                        tenantName: contract.tenant.name,
                        roomNumber,
                        totalAmount: contract.price != null ? contract.price : "",
                        dueDate: contract.paymentDay ? `ngay ${contract.paymentDay}` : ""
                    });
                    try {
                        await telegram.sendMessage({ landlordId: req.user.id, buildingId, chatId, text });
                        deliveredMap['all'].delivered += 1;
                    } catch (e) {
                        console.error("Telegram send failed:", e.message);
                    }
                }
                if (contract.tenant && contract.tenant.userId && !pushedUserIds.has(contract.tenant.userId)) {
                    pushedUserIds.add(contract.tenant.userId);
                    try {
                        const res2 = await push.sendToUser(contract.tenant.userId, {
                            title: `Thông báo: ${title}`,
                            body: content.slice(0, 140),
                            url: "/tenant/dashboard",
                            roomNumber: contract.room ? contract.room.room_number : ""
                        });
                        deliveredMap['all'].pushDelivered += res2.delivered;
                    } catch (e) {
                        console.error("Push send failed:", e.message);
                    }
                }
            }
        }

        const totalDelivered = Object.values(deliveredMap).reduce((s, d) => s + d.delivered, 0);
        const totalPush = Object.values(deliveredMap).reduce((s, d) => s + d.pushDelivered, 0);

        res.status(201).json({ message: "Tạo thông báo thành công", notifications, delivered: totalDelivered, pushDelivered: totalPush });
    } catch (error) {
        next(error);
    }
};
