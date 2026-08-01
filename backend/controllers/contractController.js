const { Contract, ContractFurniture, Tenant, Room, Furniture, Companion } = require("../models");

exports.getContracts = async (req, res, next) => {
    try {
        const contracts = await Contract.findAll({
            include: [
                { model: Tenant, as: "tenant", attributes: ["name", "phone", "cccd"] },
                { model: Room, as: "room", where: { landlordId: req.user.id }, attributes: ["room_number", "price"] },
                { model: ContractFurniture, as: "contractFurnitures", include: [{ model: Furniture, as: "furniture", attributes: ["name"] }] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ contracts });
    } catch (error) {
        next(error);
    }
};

exports.getContractById = async (req, res, next) => {
    try {
        const contract = await Contract.findByPk(req.params.id, {
            include: [
                { model: Tenant, as: "tenant", attributes: ["name", "phone", "cccd"] },
                { model: Room, as: "room", attributes: ["room_number", "price"] },
                { model: ContractFurniture, as: "contractFurnitures", include: [{ model: Furniture, as: "furniture", attributes: ["name"] }] }
            ]
        });
        if (!contract) return res.status(404).json({ message: "Khong tim thay hop dong" });
        const companions = await Companion.findAll({ where: { tenantId: contract.tenantId } });
        res.json({ contract: { ...contract.toJSON(), companions } });
    } catch (error) {
        next(error);
    }
};

exports.updateContract = async (req, res, next) => {
    try {
        const { deposit, price, startDate, endDate, paymentDay, fingerprintCode, furnitures, companionFingerprints, roomId } = req.body;

        const contract = await Contract.findByPk(req.params.id, {
            include: [{ model: Room, as: "room" }]
        });
        if (!contract) return res.status(404).json({ message: "Khong tim thay hop dong" });
        if (contract.room.landlordId !== req.user.id) return res.status(403).json({ message: "Khong co quyen" });

        const updateData = { deposit, price, startDate, endDate, paymentDay, fingerprintCode };

        if (roomId && Number(roomId) !== contract.roomId) {
            const newRoom = await Room.findByPk(roomId);
            if (!newRoom || newRoom.landlordId !== req.user.id) return res.status(400).json({ message: "Phong khong hop le" });
            if (newRoom.status !== 'empty') return res.status(400).json({ message: "Phong khong trong" });
            await contract.room.update({ status: 'empty' });
            await newRoom.update({ status: 'rented' });
            updateData.roomId = roomId;
        }

        await contract.update(updateData);

        if (companionFingerprints && companionFingerprints.length > 0) {
            await Promise.all(companionFingerprints.map(c =>
                Companion.update({ fingerprintCode: c.fingerprintCode }, { where: { id: c.id } })
            ));
        }

        if (furnitures) {
            await ContractFurniture.destroy({ where: { contractId: contract.id } });
            const items = furnitures.map(f => ({ contractId: contract.id, furnitureId: f.furnitureId, quantity: f.quantity || 1 }));
            if (items.length > 0) await ContractFurniture.bulkCreate(items);
        }

        res.json({ message: "Cap nhat hop dong thanh cong" });
    } catch (error) {
        next(error);
    }
};

exports.createContract = async (req, res, next) => {
    try {
        const { tenantId, roomId, deposit, price, startDate, endDate, paymentDay, fingerprintCode, furnitures, companionFingerprints } = req.body;

        const room = await Room.findByPk(roomId);
        if (!room || room.landlordId !== req.user.id) return res.status(400).json({ message: "Phong khong hop le" });
        if (room.status !== 'empty') return res.status(400).json({ message: "Phong khong trong" });

        const contract = await Contract.create({ tenantId, roomId, deposit, price: price ?? room.price, startDate, endDate, paymentDay, fingerprintCode, status: 'active' });

        if (companionFingerprints && companionFingerprints.length > 0) {
            await Promise.all(companionFingerprints.map(c =>
                Companion.update({ fingerprintCode: c.fingerprintCode }, { where: { id: c.id } })
            ));
        }

        if (furnitures && furnitures.length > 0) {
            const items = furnitures.map(f => ({ contractId: contract.id, furnitureId: f.furnitureId, quantity: f.quantity || 1 }));
            await ContractFurniture.bulkCreate(items);
        }

        await room.update({ status: 'rented' });

        const result = await Contract.findByPk(contract.id, {
            include: [
                { model: Tenant, as: "tenant", attributes: ["name", "phone", "cccd"] },
                { model: Room, as: "room", attributes: ["room_number", "price"] },
                { model: ContractFurniture, as: "contractFurnitures", include: [{ model: Furniture, as: "furniture", attributes: ["name"] }] }
            ]
        });

        res.status(201).json({ message: "Tao hop dong thanh cong", contract: result });
    } catch (error) {
        next(error);
    }
};

exports.checkoutContract = async (req, res, next) => {
    try {
        const contract = await Contract.findByPk(req.params.id, { include: [{ model: Room, as: "room" }] });
        if (!contract) return res.status(404).json({ message: "Khong tim thay hop dong" });
        if (contract.room.landlordId !== req.user.id) return res.status(403).json({ message: "Khong co quyen" });

        await contract.update({ status: 'ended' });
        await contract.room.update({ status: 'empty', price: contract.price, default_payment_day: 5 });
        await ContractFurniture.destroy({ where: { contractId: contract.id } });

        res.json({ message: "Tra phong thanh cong" });
    } catch (error) {
        next(error);
    }
};
