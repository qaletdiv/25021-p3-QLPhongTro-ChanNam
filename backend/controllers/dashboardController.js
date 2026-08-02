const { Op } = require("sequelize");
const { Room, Contract, Tenant, Invoice, Issue } = require("../models");
const { monthStr } = require("../utils/dates");

exports.getStats = async (req, res, next) => {
    try {
        const landlordId = req.user.id;
        const rooms = await Room.findAll({ where: { landlordId } });
        const total = rooms.length;
        const empty = rooms.filter(r => r.status === 'empty').length;
        const rented = rooms.filter(r => r.status === 'rented').length;

        const activeContracts = await Contract.findAll({
            where: { status: 'active' },
            include: [{ model: Room, as: "room", where: { landlordId }, attributes: [] }]
        });
        const currentTenants = activeContracts.length;

        const cMonth = monthStr(new Date());
        const paidInvoices = await Invoice.findAll({
            where: { status: 'paid', month: cMonth },
            include: [{ model: Contract, as: "contract", include: [{ model: Room, as: "room", where: { landlordId }, attributes: [] }] }]
        });
        const monthlyRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

        const unpaidInvoices = await Invoice.findAll({
            where: { status: { [Op.in]: ['pending', 'submitted'] } },
            include: [{ model: Contract, as: "contract", include: [{ model: Room, as: "room", where: { landlordId }, attributes: [] }] }]
        });
        const totalDebt = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

        res.json({ totalRooms: total, emptyRooms: empty, rentedRooms: rented, currentTenants, monthlyRevenue, totalDebt });
    } catch (error) {
        next(error);
    }
};

exports.getMonthlyRevenue = async (req, res, next) => {
    try {
        const landlordId = req.user.id;
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            months.push(monthStr(new Date(now.getFullYear(), now.getMonth() - i, 1)));
        }

        const paidInvoices = await Invoice.findAll({
            where: { status: 'paid', month: { [Op.in]: months } },
            attributes: ['month', 'total'],
            include: [{ model: Contract, as: "contract", include: [{ model: Room, as: "room", where: { landlordId }, attributes: [] }] }]
        });

        const revenueByMonth = {};
        months.forEach((m) => (revenueByMonth[m] = 0));
        paidInvoices.forEach((inv) => {
            if (revenueByMonth[inv.month] !== undefined) revenueByMonth[inv.month] += Number(inv.total);
        });

        const chartData = months.map((m) => ({ month: m, revenue: revenueByMonth[m] }));
        res.json({ chartData });
    } catch (error) {
        next(error);
    }
};

exports.getNotifications = async (req, res, next) => {
    try {
        const landlordId = req.user.id;

        const unpaidInvoices = await Invoice.findAll({
            where: { status: { [Op.in]: ['pending', 'submitted'] } },
            attributes: ['id', 'month'],
            include: [{ model: Contract, as: "contract", include: [{ model: Room, as: "room", where: { landlordId }, attributes: ['room_number'] }] }]
        });
        const pendingIssues = await Issue.count({
            where: { status: 'pending' },
            include: [{ model: Room, as: "room", required: true, where: { landlordId } }]
        });

        const items = [];
        for (const inv of unpaidInvoices) {
            const [mm, yyyy] = String(inv.month).split("/");
            items.push({
                kind: 'invoice',
                title: 'Hóa đơn cần xử lý',
                message: `Có phòng ${inv.contract?.room?.room_number || "?"} gửi tiền nhà tháng ${mm} năm ${yyyy} chờ xác nhận`,
                count: 1,
                link: '/landlord/invoices'
            });
        }
        if (pendingIssues > 0) {
            items.push({ kind: 'issue', title: 'Báo hỏng cần xem', message: `Có ${pendingIssues} báo hỏng đang chờ xử lý`, count: pendingIssues, link: '/landlord/issues' });
        }

        res.json({ unreadCount: unpaidInvoices.length + pendingIssues, items });
    } catch (error) {
        next(error);
    }
};

exports.getExpiringContracts = async (req, res, next) => {
    try {
        const landlordId = req.user.id;
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

        const contracts = await Contract.findAll({
            where: {
                status: 'active',
                endDate: { [Op.lte]: thirtyDaysLater }
            },
            include: [
                { model: Tenant, as: "tenant", attributes: ["name", "phone"] },
                { model: Room, as: "room", where: { landlordId }, attributes: ["room_number"] }
            ],
            order: [['endDate', 'ASC']]
        });

        res.json({ contracts });
    } catch (error) {
        next(error);
    }
};
