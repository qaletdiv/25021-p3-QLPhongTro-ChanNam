const { Issue, Room } = require("../models");
const { findTenantByUser, findActiveContract } = require("../utils/tenantHelpers");
const telegram = require("../utils/telegram");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

exports.getIssues = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });

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
        if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê" });

        const contract = await findActiveContract(tenant.id);
        if (!contract) return res.status(400).json({ message: "Bạn không có hợp đồng hoạt động" });

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
            try {
                await telegram.sendToLandlord({
                    landlordId: room.landlordId,
                    buildingId: room.buildingId,
                    text: `🚨 Báo hỏng mới\nKhách ${tenant.name} (Phòng ${room.room_number}): ${title}${description ? `\n${description}` : ""}`,
                    url: `${FRONTEND_URL}/landlord/issues`
                });
            } catch (e) {
                console.error("Landlord Telegram failed:", e.message);
            }
        }

        res.status(201).json({ message: "Gửi báo cáo thành công", issue });
    } catch (error) {
        next(error);
    }
};
