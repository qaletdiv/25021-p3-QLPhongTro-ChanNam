const { Invoice, Contract, Tenant, Room } = require("../models");
const cloudinary = require("../config/cloudinary");

exports.getInvoices = async (req, res, next) => {
    try {
        const tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const invoices = await Invoice.findAll({
            include: [{
                model: Contract, as: "contract", required: true,
                where: { tenantId: tenant.id }
            }],
            order: [['month', 'DESC']]
        });

        res.json({ invoices });
    } catch (error) {
        next(error);
    }
};

exports.getSettings = async (req, res, next) => {
    try {
        const tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const contract = await Contract.findOne({
            where: { tenantId: tenant.id, status: 'active' },
            include: [{ model: Room, as: "room" }]
        });
        if (!contract) return res.status(404).json({ message: "Khong co hop dong hoat dong" });

        const { Setting } = require("../models");
        const settings = await Setting.findAll({ where: { landlordId: contract.room.landlordId } });
        const result = {};
        settings.forEach(s => { result[s.key] = s.value; });

        res.json({
            settings: result,
            roomPrice: contract.room.price,
            room: contract.room,
            contract
        });
    } catch (error) {
        next(error);
    }
};

exports.saveInitialReadings = async (req, res, next) => {
    try {
        const { electricity, water, electricityPhoto, waterPhoto } = req.body;
        if (electricity === undefined || water === undefined) {
            return res.status(400).json({ message: "Thieu chi so dien/nuoc ban dau" });
        }
        if (!electricityPhoto || !waterPhoto) {
            return res.status(400).json({ message: "Vui long upload anh dong ho dien va nuoc" });
        }

        const tenant = await Tenant.findOne({ where: { userId: req.user.id } });
        if (!tenant) return res.status(404).json({ message: "Khong tim thay thong tin khach thue" });

        const contract = await Contract.findOne({
            where: { tenantId: tenant.id, status: 'active' },
            include: [{ model: Room, as: "room" }]
        });
        if (!contract) return res.status(404).json({ message: "Khong co hop dong hoat dong" });

        const [elecRes, waterRes] = await Promise.all([
            cloudinary.uploader.upload(electricityPhoto, {
                folder: `phongtro/${contract.room.room_number}/meters`,
                public_id: `elec_initial_${contract.id}`,
                overwrite: true
            }),
            cloudinary.uploader.upload(waterPhoto, {
                folder: `phongtro/${contract.room.room_number}/meters`,
                public_id: `water_initial_${contract.id}`,
                overwrite: true
            })
        ]);

        await contract.update({
            initialElectricity: Number(electricity),
            initialWater: Number(water),
            initialElectricityPhoto: elecRes.secure_url,
            initialWaterPhoto: waterRes.secure_url
        });

        res.json({
            message: "Da luu chi so ban dau thanh cong",
            contract
        });
    } catch (error) {
        next(error);
    }
};
