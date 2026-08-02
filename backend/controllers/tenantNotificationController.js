const { Invoice, Contract, Issue, TenantNotificationRead } = require("../models");
const { findTenantByUser } = require("../utils/tenantHelpers");

exports.getNotifications = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const invoices = await Invoice.findAll({
            where: { status: 'paid' },
            include: [{ model: Contract, as: "contract", required: true, where: { tenantId: tenant.id } }],
            order: [['paidAt', 'DESC']]
        });
        const issues = await Issue.findAll({
            where: { tenantId: tenant.id, status: 'resolved' },
            order: [['updatedAt', 'DESC']]
        });

        const reads = await TenantNotificationRead.findAll({ where: { tenantId: tenant.id } });
        const readSet = new Set(reads.map((r) => `${r.kind}:${r.targetId}`));

        const items = [];

        for (const inv of invoices) {
            items.push({
                kind: 'invoice',
                targetId: inv.id,
                title: 'Hóa đơn đã được xác nhận',
                message: `Hóa đơn tiền nhà tháng ${inv.month}: ${Math.round(Number(inv.total)).toLocaleString("vi-VN")}₫ đã được chủ trọ xác nhận`,
                time: inv.paidAt || inv.updatedAt,
                link: '/tenant/invoices',
                read: readSet.has(`invoice:${inv.id}`)
            });
        }

        for (const issue of issues) {
            items.push({
                kind: 'issue',
                targetId: issue.id,
                title: 'Báo hỏng đã xử lý',
                message: `Báo hỏng "${issue.title}" đã được chủ trọ xử lý`,
                time: issue.updatedAt,
                link: '/tenant/issues',
                read: readSet.has(`issue:${issue.id}`)
            });
        }

        items.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json({
            unreadCount: items.filter((i) => !i.read).length,
            items
        });
    } catch (error) {
        next(error);
    }
};

exports.markRead = async (req, res, next) => {
    try {
        const tenant = await findTenantByUser(req.user.id);
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const items = req.body.items || [];
        for (const item of items) {
            const row = { tenantId: tenant.id, kind: item.kind, targetId: item.targetId };
            const existing = await TenantNotificationRead.findOne({ where: row });
            if (!existing) await TenantNotificationRead.create(row);
        }

        res.json({ message: "Da danh dau da doc" });
    } catch (error) {
        next(error);
    }
};
