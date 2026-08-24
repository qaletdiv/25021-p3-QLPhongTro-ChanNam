const { Op } = require("sequelize");
const { Building, BuildingCollaborator } = require("../models");

/**
 * Danh sách id các nhà mà user được phép truy cập:
 * - Nhà họ sở hữu (landlordId = userId)
 * - Nhà được chia sẻ qua bảng building_collaborators
 */
async function getAccessibleBuildingIds(userId) {
    const own = await Building.findAll({ where: { landlordId: userId }, attributes: ["id"] });
    const shared = await BuildingCollaborator.findAll({ where: { userId }, attributes: ["buildingId"] });
    return [...new Set([...own.map((b) => b.id), ...shared.map((s) => s.buildingId)])];
}

/**
 * Điều kiện lọc cho bảng rooms (dùng trực tiếp hoặc trong include "room"):
 * phòng do mình sở hữu HOẶC thuộc nhà được chia sẻ.
 */
function roomAccessCondition(landlordId, accessibleIds) {
    const or = [{ landlordId }];
    if (accessibleIds.length) or.push({ buildingId: { [Op.in]: accessibleIds } });
    return { [Op.or]: or };
}

/**
 * Kiểm tra 1 nhà có thuộc quyền truy cập của user không (owner hoặc cộng tác viên)
 */
async function isBuildingAccessible(userId, buildingId) {
    if (!buildingId) return false;
    const b = await Building.findByPk(buildingId);
    if (!b) return false;
    if (b.landlordId === userId) return true;
    const c = await BuildingCollaborator.findOne({ where: { buildingId, userId } });
    return Boolean(c);
}

module.exports = { getAccessibleBuildingIds, roomAccessCondition, isBuildingAccessible };
