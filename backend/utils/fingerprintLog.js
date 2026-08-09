const { FingerprintHistory } = require("../models");

async function logFingerprintRow({ fingerprintCode, ownerType, ownerId, ownerName, tenantId, roomId, buildingId, landlordId, action }) {
    if (!fingerprintCode) return;
    await FingerprintHistory.create({
        fingerprintCode,
        ownerType: ownerType || 'tenant',
        ownerId: ownerId || null,
        ownerName: ownerName || null,
        tenantId: tenantId || null,
        roomId: roomId || null,
        buildingId: buildingId || null,
        landlordId,
        action
    });
}

// Log reassignment: remove old fingerprint (if changed), assign new one (if changed).
async function logFingerprintReassign({ oldFp, newFp, ownerType, ownerId, ownerName, tenantId, roomId, buildingId, landlordId }) {
    if (oldFp && oldFp !== newFp) {
        await logFingerprintRow({ fingerprintCode: oldFp, ownerType, ownerId, ownerName, tenantId, roomId, buildingId, landlordId, action: 'removed' });
    }
    if (newFp && newFp !== oldFp) {
        await logFingerprintRow({ fingerprintCode: newFp, ownerType, ownerId, ownerName, tenantId, roomId, buildingId, landlordId, action: 'assigned' });
    }
}

module.exports = { logFingerprintRow, logFingerprintReassign };