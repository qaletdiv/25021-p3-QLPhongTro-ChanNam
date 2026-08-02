const { Issue, Room, Notification } = require("../models");
const { findTenantByUser, findActiveContract } = require("../utils/tenantHelpers");

exports.getIssues = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const issues = await Issue.findAll({
            where: { tenantId: tenant.id },
            include: [{ model: Room, as: "room", attributes: ["room_number"] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ issues });
    } catch (error) {
        next(error);
    }
};

exports.createIssue = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const contract = await findActiveContract(tenant.id);
        if (!contract) return res.status(400).json({ message: "Ban khong co hop dong hoat dong" });

        const { title, description, images } = req.body;
        const issue = await Issue.create({
            tenantId: tenant.id,
            roomId: contract.roomId,
            title,
            description,
            images: images ? JSON.stringify(images) : null
        });

        const room = await Room.findByPk(contract.roomId);
        if (room && room.landlordId) {
            await Notification.create({
                title: `Báo hỏng mới - Phòng ${room.room_number}`,
                content: `Khách ${tenant.name} (Phòng ${room.room_number}) báo hỏng: ${title}${description ? `\n${description}` : ""}`,
                targetType: 'specific_rooms',
                targetRoomIds: JSON.stringify([String(room.id)]),
                sentAt: new Date(),
                recipientCount: 0,
                status: 'sent',
                source: 'manual',
                type: 'issue',
                landlordId: room.landlordId
            });
        }

        res.status(201).json({ message: "Gui bao cao thanh cong", issue });
    } catch (error) {
        next(error);
    }
};
