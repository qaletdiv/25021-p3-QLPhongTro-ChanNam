const { Op } = require("sequelize");
const { Tenant, Contract, Room } = require("../models");
const { getAccessibleBuildingIds } = require("./buildingAccess");

/**
 * Danh sách id khách thuê mà user (chủ trọ / cộng tác viên) được phép nhìn thấy:
 * - Khách đã chọn nhà trọ này khi đăng ký (tenants.buildingId)
 * - Khách có hợp đồng trên phòng thuộc nhà được phép truy cập
 *
 * Trả về [] khi không có khách nào, để caller tự quy đổi thành điều kiện chặn.
 */
async function getAccessibleTenantIds(userId, accessibleBuildingIds) {
    const accIds = accessibleBuildingIds || (await getAccessibleBuildingIds(userId));
    if (!accIds.length) return [];

    const [byBuilding, byContract] = await Promise.all([
        Tenant.findAll({ where: { buildingId: { [Op.in]: accIds } }, attributes: ["id"] }),
        Contract.findAll({
            attributes: ["tenantId"],
            include: [{
                model: Room, as: "room", required: true, attributes: [],
                where: { buildingId: { [Op.in]: accIds } }
            }]
        })
    ]);

    return [...new Set([
        ...byBuilding.map((t) => t.id),
        ...byContract.map((c) => c.tenantId).filter(Boolean)
    ])];
}

/**
 * Điều kiện where cho bảng tenants. Dùng [-1] khi không có quyền để truy vấn
 * trả về rỗng thay vì trả về toàn bộ bảng.
 */
async function tenantAccessCondition(userId, accessibleBuildingIds) {
    const ids = await getAccessibleTenantIds(userId, accessibleBuildingIds);
    return { id: { [Op.in]: ids.length ? ids : [-1] } };
}

/**
 * Kiểm tra user có quyền thao tác trên 1 khách thuê cụ thể.
 */
async function isTenantAccessible(userId, tenantId) {
    if (!tenantId) return false;
    const ids = await getAccessibleTenantIds(userId);
    return ids.includes(Number(tenantId));
}

module.exports = { getAccessibleTenantIds, tenantAccessCondition, isTenantAccessible };
