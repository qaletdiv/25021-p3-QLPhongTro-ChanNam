const { FingerprintHistory, Companion } = require("../models");

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

// Persist the companion details (incl. fingerprintCode) provided with a contract.
async function updateCompanionDetails(companionFingerprints) {
    if (!companionFingerprints || companionFingerprints.length === 0) return;
    await Promise.all(companionFingerprints.map((c) =>
        Companion.update(
            {
                name: c.name,
                phone: c.phone || null,
                cccd: c.cccd || null,
                relationship: c.relationship || null,
                fingerprintCode: c.fingerprintCode || null,
            },
            { where: { id: c.id } }
        )
    ));
}

// Log 'assigned' rows for companions on contract creation.
async function logCompanionAssignments(companionFingerprints, { tenantId, roomId, buildingId, landlordId }) {
    if (!companionFingerprints || companionFingerprints.length === 0) return;
    for (const c of companionFingerprints) {
        if (c.fingerprintCode) {
            await logFingerprintRow({
                fingerprintCode: c.fingerprintCode, ownerType: 'companion', ownerId: c.id,
                ownerName: c.name, tenantId, roomId, buildingId, landlordId, action: 'assigned'
            });
        }
    }
}

// Log remove/assign rows for companions whose fingerprint changed on contract update.
async function logCompanionReassignments(companionFingerprints, oldCompanionFps, { tenantId, roomId, buildingId, landlordId }) {
    if (!companionFingerprints || companionFingerprints.length === 0) return;
    for (const c of companionFingerprints) {
        if (c.id && oldCompanionFps[c.id] !== c.fingerprintCode) {
            await logFingerprintReassign({
                oldFp: oldCompanionFps[c.id], newFp: c.fingerprintCode, ownerType: 'companion', ownerId: c.id,
                ownerName: c.name, tenantId, roomId, buildingId, landlordId
            });
        }
    }
}

module.exports = { logFingerprintRow, logFingerprintReassign, updateCompanionDetails, logCompanionAssignments, logCompanionReassignments };