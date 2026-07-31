const { Op } = require("sequelize");
const { Room, Contract, Tenant } = require("../models");

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

        res.json({ totalRooms: total, emptyRooms: empty, rentedRooms: rented, currentTenants });
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
