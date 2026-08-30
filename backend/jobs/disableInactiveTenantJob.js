const { Op } = require("sequelize");
const { User, Tenant, Contract } = require("../models");
const { writeAuditLog } = require("../utils/auditLog");

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // chạy mỗi giờ
const GRACE_DAYS = 7; // số ngày ân hạn sau khi trả phòng

// Tự động vô hiệu hóa tài khoản khách thuê khi hợp đồng đã kết thúc (đã trả phòng)
// và qua GRACE_DAYS ngày mà không có hợp đồng active mới (không gia hạn).
exports.runDisableInactiveTenants = async () => {
  const now = new Date();
  const graceAgo = new Date(now.getTime() - GRACE_DAYS * 24 * 60 * 60 * 1000);

  // Khách thuê đang còn hợp đồng active -> giữ nguyên tài khoản
  const activeContracts = await Contract.findAll({ where: { status: "active" }, attributes: ["tenantId"] });
  const activeTenantIds = new Set(activeContracts.map((c) => c.tenantId).filter(Boolean));

  // Hợp đồng đã kết thúc (trả phòng) và đã qua GRACE_DAYS ngày kể từ ngày trả phòng
  const endedContracts = await Contract.findAll({
    where: {
      status: "ended",
      [Op.or]: [
        { checkoutDate: { [Op.ne]: null, [Op.lt]: graceAgo } },
        { [Op.and]: [{ checkoutDate: null }, { endDate: { [Op.lt]: graceAgo } }] },
      ],
    },
    attributes: ["tenantId"],
  });

  const candidateTenantIds = [
    ...new Set(endedContracts.map((c) => c.tenantId).filter(Boolean)),
  ].filter((id) => !activeTenantIds.has(id));

  if (!candidateTenantIds.length) return { checked: 0, disabled: 0 };

  const tenants = await Tenant.findAll({
    where: { id: { [Op.in]: candidateTenantIds } },
    attributes: ["id", "userId", "name"],
  });

  let disabled = 0;
  for (const t of tenants) {
    if (!t.userId) continue;
    const user = await User.findByPk(t.userId);
    if (!user || user.isActive === false || user.role !== "tenant") continue;

    await user.update({ isActive: false, currentSessionToken: null });
    await writeAuditLog({
      actorId: null,
      actorType: "system",
      action: "user.auto_disable",
      targetType: "user",
      targetId: user.id,
      metadata: { targetName: user.name, targetEmail: user.email, reason: "contract_ended_no_renewal_7d" },
    });
    disabled++;
  }

  if (disabled > 0) {
    console.log(`[disableInactiveTenantJob] Auto-disabled ${disabled} tenant account(s) (contract ended, no renewal within ${GRACE_DAYS}d)`);
  }
  return { checked: candidateTenantIds.length, disabled };
};

exports.startDisableInactiveTenantJob = () => {
  exports.runDisableInactiveTenants().catch((e) => console.error("[disableInactiveTenantJob] run failed:", e.message));
  setInterval(() => {
    exports.runDisableInactiveTenants().catch((e) => console.error("[disableInactiveTenantJob] run failed:", e.message));
  }, CHECK_INTERVAL_MS);
};
