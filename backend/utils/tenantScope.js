const { Op } = require("sequelize");
const { Tenant, Contract, Room } = require("../models");
const { getAccessibleBuildingIds } = require("./buildingAccess");

/**
 * Khách thuê "chưa được gán": chưa chọn nhà trọ và chưa có hợp đồng nào.
 * Đây là hàng đợi onboarding - chủ trọ phải thấy để lập hợp đồng đầu tiên,
 * nên nhóm này hiển thị cho mọi chủ trọ. Ngay khi có hợp đồng (createContract
 * sẽ gán buildingId theo phòng) hoặc khi khách chọn nhà lúc đăng ký thì
 * bản ghi rời khỏi nhóm này và chỉ còn chủ nhà tương ứng nhìn thấy.
 */
async function getUnassignedTenantIds() {
    const rows = await Tenant.findAll({
        where: { buildingId: null },
        attributes: ["id"],
        include: [{ model: Contract, as: "contracts", required: false, attributes: ["id"] }]
    });
    return rows.filter((t) => !t.contracts || t.contracts.length === 0).map((t) => t.id);
}

/**
 * Danh sách id khách thuê mà user (chủ trọ / cộng tác viên) được phép nhìn thấy:
 * - Khách đã chọn nhà trọ thuộc quyền truy cập (tenants.buildingId)
 * - Khách có hợp đồng trên phòng thuộc nhà được phép truy cập
 * - Khách chưa được gán nhà và chưa có hợp đồng (hàng đợi onboarding)
 */
async function getAccessibleTenantIds(userId, accessibleBuildingIds) {
    const accIds = accessibleBuildingIds || (await getAccessibleBuildingIds(userId));

    const [byBuilding, byContract, unassigned] = await Promise.all([
        accIds.length
            ? Tenant.findAll({ where: { buildingId: { [Op.in]: accIds } }, attributes: ["id"] })
            : [],
        accIds.length
            ? Contract.findAll({
                attributes: ["tenantId"],
                include: [{
                    model: Room, as: "room", required: true, attributes: [],
                    where: { buildingId: { [Op.in]: accIds } }
                }]
            })
            : [],
        getUnassignedTenantIds()
    ]);

    return [...new Set([
        ...byBuilding.map((t) => t.id),
        ...byContract.map((c) => c.tenantId).filter(Boolean),
        ...unassigned
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

module.exports = { getAccessibleTenantIds, getUnassignedTenantIds, tenantAccessCondition, isTenantAccessible };
