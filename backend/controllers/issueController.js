const { Op } = require("sequelize");
const { Issue, Room, Tenant, Building } = require("../models");
const push = require("../utils/push");
const { getAccessibleBuildingIds, isBuildingAccessible } = require("../utils/buildingAccess");

exports.getIssues = async (req, res, next) => {
    try {
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const issues = await Issue.findAll({
            include: [
                { model: Tenant, as: "tenant", attributes: ["id", "name", "phone"] },
                {
                    model: Room, as: "room", required: true,
                    where: { buildingId: { [Op.in]: accIds.length ? accIds : [-1] } },
                    attributes: ["id", "room_number", "floor"],
                    include: [{ model: Building, as: "building", attributes: ["name"] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ issues });
    } catch (error) {
        next(error);
    }
};

exports.getPendingCount = async (req, res, next) => {
    try {
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const count = await Issue.count({
            where: { status: 'pending' },
            include: [{ model: Room, as: "room", required: true, where: { buildingId: { [Op.in]: accIds.length ? accIds : [-1] } } }]
        });
        res.json({ count });
    } catch (error) {
        next(error);
    }
};

exports.updateIssueStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['pending', 'resolved'].includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }
        const issue = await Issue.findOne({
            where: { id: req.params.id },
            include: [{ model: Room, as: "room", required: true }]
        });
        if (!issue) return res.status(404).json({ message: "Không tìm thấy báo hỏng" });
        if (!(await isBuildingAccessible(req.user.id, issue.room?.buildingId))) {
            return res.status(403).json({ message: "Không có quyền" });
        }
        issue.status = status;
        await issue.save();

        // Notify the tenant via web push when their issue is resolved.
        if (status === 'resolved' && issue.tenantId) {
            try {
                const tenant = await Tenant.findByPk(issue.tenantId);
                if (tenant && tenant.userId) {
                    await push.sendToUser(tenant.userId, {
                        title: "Báo hỏng đã được xử lý",
                        body: `Báo hỏng "${issue.title}" đã được xử lý xong.`,
                        url: "/tenant/issues",
                        issueId: issue.id
                    });
                }
            } catch (e) {
                console.error("Tenant push (issue resolved) failed:", e.message);
            }
        }

        res.json({ message: "Cập nhật trạng thái thành công", issue });
    } catch (error) {
        next(error);
    }
};
