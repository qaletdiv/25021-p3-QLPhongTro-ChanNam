const { Op } = require("sequelize");
const { Contract, ContractFurniture, Tenant, Room, Furniture, Companion } = require("../models");
const { logFingerprintRow, logFingerprintReassign, updateCompanionDetails, logCompanionAssignments, logCompanionReassignments } = require("../utils/fingerprintLog");
const { getAccessibleBuildingIds, isBuildingAccessible } = require("../utils/buildingAccess");
const { isTenantAccessible } = require("../utils/tenantScope");

exports.getContracts = async (req, res, next) => {
    try {
        const accIds = await getAccessibleBuildingIds(req.user.id);
        const contracts = await Contract.findAll({
            where: { '$room.buildingId$': { [Op.in]: accIds.length ? accIds : [-1] } },
            include: [
                { model: Tenant, as: "tenant", attributes: ["name", "phone", "cccd"] },
                { model: Room, as: "room", attributes: ["room_number", "price", "buildingId"] },
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
                { model: Room, as: "room", attributes: ["room_number", "price", "buildingId"] },
                { model: ContractFurniture, as: "contractFurnitures", include: [{ model: Furniture, as: "furniture", attributes: ["name"] }] }
            ]
        });
        if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        if (!(await isBuildingAccessible(req.user.id, contract.room?.buildingId))) {
            return res.status(403).json({ message: "Không có quyền" });
        }
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
        if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        if (!(await isBuildingAccessible(req.user.id, contract.room?.buildingId))) {
            return res.status(403).json({ message: "Không có quyền" });
        }

        const oldFingerprint = contract.fingerprintCode;
        const oldCompanions = await Companion.findAll({ where: { tenantId: contract.tenantId } });
        const oldCompanionFps = Object.fromEntries(oldCompanions.map(c => [c.id, c.fingerprintCode]));
        const tenant = await Tenant.findByPk(contract.tenantId);
        let logRoom = contract.room;

        const updateData = { deposit, price, startDate, endDate, paymentDay, fingerprintCode };

        if (roomId && Number(roomId) !== contract.roomId) {
            const newRoom = await Room.findByPk(roomId);
            if (!newRoom || !(await isBuildingAccessible(req.user.id, newRoom.buildingId))) return res.status(400).json({ message: "Phòng không hợp lệ" });
            if (newRoom.status !== 'empty') return res.status(400).json({ message: "Phòng không trống" });
            await contract.room.update({ status: 'empty' });
            await newRoom.update({ status: 'rented' });
            updateData.roomId = roomId;
            logRoom = newRoom;
        }

        await contract.update(updateData);

        await updateCompanionDetails(companionFingerprints);

        await logFingerprintReassign({
            oldFp: oldFingerprint, newFp: fingerprintCode, ownerType: 'tenant', ownerId: contract.tenantId,
            ownerName: tenant ? tenant.name : null, tenantId: contract.tenantId,
            roomId: logRoom.id, buildingId: logRoom.buildingId, landlordId: req.user.id
        });
        await logCompanionReassignments(companionFingerprints, oldCompanionFps, {
            tenantId: contract.tenantId, roomId: logRoom.id, buildingId: logRoom.buildingId, landlordId: req.user.id
        });

        if (furnitures) {
            await ContractFurniture.destroy({ where: { contractId: contract.id } });
            const items = furnitures.map(f => ({ contractId: contract.id, furnitureId: f.furnitureId, quantity: f.quantity || 1 }));
            if (items.length > 0) await ContractFurniture.bulkCreate(items);
        }

        res.json({ message: "Cập nhật hợp đồng thành công" });
    } catch (error) {
        next(error);
    }
};

exports.createContract = async (req, res, next) => {
    try {
        const { tenantId, roomId, deposit, price, startDate, endDate, paymentDay, fingerprintCode, furnitures, companionFingerprints } = req.body;

        const room = await Room.findByPk(roomId);
        if (!room || !(await isBuildingAccessible(req.user.id, room.buildingId))) return res.status(400).json({ message: "Phòng không hợp lệ" });
        if (room.status !== 'empty') return res.status(400).json({ message: "Phòng không trống" });

        // Không cho lập hợp đồng với khách thuê của nhà trọ khác.
        // isTenantAccessible đã bao gồm nhóm khách chưa được gán nhà (hàng đợi onboarding).
        const tenant = await Tenant.findByPk(tenantId);
        if (!tenant) return res.status(400).json({ message: "Khách thuê không tồn tại" });
        if (!(await isTenantAccessible(req.user.id, tenantId))) {
            return res.status(403).json({ message: "Bạn không có quyền trên khách thuê này" });
        }

        const contract = await Contract.create({ tenantId, roomId, deposit, price: price ?? room.price, startDate, endDate, paymentDay, fingerprintCode, status: 'active' });

        // Khách tự đăng ký nhưng chưa chọn nhà: gắn vào nhà của phòng vừa thuê.
        if (tenant.buildingId == null && room.buildingId) {
            await tenant.update({ buildingId: room.buildingId });
        }

        await updateCompanionDetails(companionFingerprints);

        if (furnitures && furnitures.length > 0) {
            const items = furnitures.map(f => ({ contractId: contract.id, furnitureId: f.furnitureId, quantity: f.quantity || 1 }));
            await ContractFurniture.bulkCreate(items);
        }

        await room.update({ status: 'rented' });

        if (contract.fingerprintCode) {
            await logFingerprintRow({
                fingerprintCode: contract.fingerprintCode, ownerType: 'tenant', ownerId: contract.tenantId,
                ownerName: tenant ? tenant.name : null, tenantId: contract.tenantId,
                roomId: room.id, buildingId: room.buildingId, landlordId: req.user.id, action: 'assigned'
            });
        }
        await logCompanionAssignments(companionFingerprints, {
            tenantId: contract.tenantId, roomId: room.id, buildingId: room.buildingId, landlordId: req.user.id
        });

        const result = await Contract.findByPk(contract.id, {
            include: [
                { model: Tenant, as: "tenant", attributes: ["name", "phone", "cccd"] },
                { model: Room, as: "room", attributes: ["room_number", "price"] },
                { model: ContractFurniture, as: "contractFurnitures", include: [{ model: Furniture, as: "furniture", attributes: ["name"] }] }
            ]
        });

        res.status(201).json({ message: "Tạo hợp đồng thành công", contract: result });
    } catch (error) {
        next(error);
    }
};

exports.checkoutContract = async (req, res, next) => {
    try {
        const contract = await Contract.findByPk(req.params.id, { include: [{ model: Room, as: "room" }] });
        if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng" });
        if (!(await isBuildingAccessible(req.user.id, contract.room?.buildingId))) return res.status(403).json({ message: "Không có quyền" });

        const { promoteCompanionId, removedCompanionIds } = req.body || {};
        const activeCompanions = await Companion.findAll({ where: { tenantId: contract.tenantId, status: 'active' } });

        // Main tenant stays; only the listed companions leave the room.
        if (Array.isArray(removedCompanionIds) && removedCompanionIds.length > 0) {
            const toRemove = activeCompanions.filter((c) => removedCompanionIds.map(String).includes(String(c.id)));
            if (toRemove.length > 0) {
                await Companion.update(
                    { status: 'ended', endedAt: new Date() },
                    { where: { id: toRemove.map((c) => c.id) } }
                );
                for (const c of toRemove) {
                    if (c.fingerprintCode) {
                        await logFingerprintRow({
                            fingerprintCode: c.fingerprintCode, ownerType: 'companion', ownerId: c.id,
                            ownerName: c.name, tenantId: contract.tenantId,
                            roomId: contract.roomId, buildingId: contract.room.buildingId,
                            landlordId: req.user.id, action: 'removed'
                        });
                    }
                }
            }
            res.json({ message: "Người đi kèm đã rời phòng" });
            return;
        }

        // Promote a chosen companion to be the new main tenant; any other staying companions follow them.
        const promoted = activeCompanions.find((c) => String(c.id) === String(promoteCompanionId));
        if (promoted) {
            const newTenant = await Tenant.create({
                name: promoted.name,
                phone: promoted.phone || '',
                cccd: promoted.cccd || null,
                telegramChatId: promoted.telegramChatId || null,
            });
            await contract.update({ tenantId: newTenant.id });
            await Companion.update({ status: 'ended', endedAt: new Date() }, { where: { id: promoted.id } });
            const stayingIds = activeCompanions.filter((c) => c.id !== promoted.id).map((c) => c.id);
            if (stayingIds.length > 0) {
                await Companion.update({ tenantId: newTenant.id }, { where: { id: stayingIds } });
            }
            res.json({ message: "Trả phòng thành công", promoted: true, newTenantId: newTenant.id });
            return;
        }

        await contract.update({ status: 'ended', checkoutDate: new Date() });
        await contract.room.update({ status: 'empty', price: contract.price });
        await ContractFurniture.destroy({ where: { contractId: contract.id } });
        if (activeCompanions.length > 0) {
            await Companion.update({ status: 'ended', endedAt: new Date() }, { where: { tenantId: contract.tenantId, status: 'active' } });
        }

        const tenant = await Tenant.findByPk(contract.tenantId);
        if (contract.fingerprintCode) {
            await logFingerprintRow({
                fingerprintCode: contract.fingerprintCode, ownerType: 'tenant', ownerId: contract.tenantId,
                ownerName: tenant ? tenant.name : null, tenantId: contract.tenantId,
                roomId: contract.roomId, buildingId: contract.room.buildingId, landlordId: req.user.id, action: 'removed'
            });
        }
        const allCompanions = await Companion.findAll({ where: { tenantId: contract.tenantId } });
        for (const c of allCompanions) {
            if (c.fingerprintCode) {
                await logFingerprintRow({
                    fingerprintCode: c.fingerprintCode, ownerType: 'companion', ownerId: c.id,
                    ownerName: c.name, tenantId: contract.tenantId,
                    roomId: contract.roomId, buildingId: contract.room.buildingId, landlordId: req.user.id, action: 'removed'
                });
            }
        }

        res.json({ message: "Trả phòng thành công" });
    } catch (error) {
        next(error);
    }
};
