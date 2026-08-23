"use client";

import { useState, Fragment } from "react";
import { Box, Paper, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PrintIcon from "@mui/icons-material/Print";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { formatCurrency, formatDate } from "../../utils/format";

const HEADERS = ["Phòng", "Khách Thuê", "Số Điện Thoại", "Telegram", "Tiền Cọc", "Thời Hạn HĐ", "Thời Gian Thuê TT", "Ngày Thu", "Mã Vân Tay", "Trạng Thái", "Quan Hệ", ""];

const formatDuration = (contract) => {
  if (!contract?.startDate) return "-";
  let end = null;
  if (contract.status === "ended") {
    end = contract.checkoutDate ? new Date(contract.checkoutDate) : new Date(contract.endDate);
  }
  const startText = formatDate(contract.startDate);
  const endText = end ? formatDate(end) : "";
  return `${startText} - ${endText}`;
};

const formatCompanionDuration = (companion) => {
  if (!companion?.createdAt) return "-";
  let ended = null;
  if (companion.status === "ended") {
    ended = companion.endedAt ? new Date(companion.endedAt) : companion.updatedAt ? new Date(companion.updatedAt) : new Date();
  }
  const startText = formatDate(companion.createdAt);
  const endText = ended ? formatDate(ended) : "";
  return `${startText} - ${endText}`;
};

const TreeCell = ({ isFirst, isLast }) => {
  const color = "#94a3b8";
  const spineX = 7;
  const branchX = 21;
  const cy = 16;
  return (
    <svg width={28} height={32} style={{ display: "block" }}>
      <line x1={spineX} y1={0} x2={spineX} y2={isLast ? cy : 32} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {isFirst && <line x1={0} y1={0} x2={spineX} y2={0} stroke={color} strokeWidth={1.5} strokeLinecap="round" />}
      <line x1={spineX} y1={cy} x2={branchX} y2={cy} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={branchX} cy={cy} r={3.5} fill="#2563eb" stroke="#bfdbfe" strokeWidth={1} />
    </svg>
  );
};

const StatusBadge = ({ active, ended }) => {
  if (active) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "9999px", backgroundColor: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#059669", display: "inline-block" }} />
        Đang Thuê
      </span>
    );
  }
  if (ended) {
    return (
      <span style={{ padding: "3px 10px", fontSize: "0.6875rem", fontWeight: 600, borderRadius: "9999px", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
        ○ Hết Thuê
      </span>
    );
  }
  return (
    <span style={{ padding: "3px 10px", fontSize: "0.6875rem", fontWeight: 600, borderRadius: "9999px", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
      Chưa thuê
    </span>
  );
};

export default function TenantTable({ tenants, onEdit, onCheckout, onPrint, companionStatus = "all" }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (tenantId) => setExpandedId((cur) => (cur === tenantId ? null : tenantId));

  return (
    <Paper sx={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {HEADERS.map((h) => (
                <th key={h} style={{ padding: "12px 16px", fontWeight: 700, color: "#475569", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "" ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ borderBottom: "1px solid #f1f5f9" }}>
            {tenants.map((tenant) => {
              const contracts = [...(tenant.contracts || [])].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
              const active = contracts.find((c) => c.status === "active");
              const ended = !active && contracts.some((c) => c.status === "ended");
              const displayContract = active || contracts[0];
              const companions = (tenant.companions || []).filter((c) => {
                if (companionStatus === "active") return c.status !== "ended";
                if (companionStatus === "ended") return c.status === "ended";
                return true;
              });
              const activeCompanions = (tenant.companions || []).filter((c) => c.status !== "ended");
              return (
                <Fragment key={tenant.id}>
                <tr style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a", fontSize: "0.8125rem" }}>
                    Phòng {displayContract?.room?.room_number || "-"}
                    {displayContract?.room?.building?.name && (
                      <div style={{ fontSize: "0.625rem", color: "#2563eb", fontWeight: 600 }}>{displayContract.room.building.name}</div>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {companions.length > 0 && (
                        <IconButton size="small" onClick={() => toggleExpand(tenant.id)}
                          title={expandedId === tenant.id ? "Thu gọn người đi kèm" : "Xem người đi kèm"}
                          sx={{ color: "#2563eb", bgcolor: "#eff6ff", "&:hover": { bgcolor: "#dbeafe" }, p: 0.25 }}>
                          {expandedId === tenant.id ? <RemoveIcon sx={{ fontSize: 14 }} /> : <AddIcon sx={{ fontSize: 14 }} />}
                        </IconButton>
                      )}
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{tenant.name}</span>
                      {(activeCompanions.length) > 0 && (
                        <Box component="span" sx={{ color: "#2563eb", fontSize: "0.6875rem", fontWeight: 700 }}>({1 + (activeCompanions.length)} người)</Box>
                      )}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontWeight: 600 }}>
                    {tenant.phone || "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {tenant.telegramChatId ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "9999px", backgroundColor: "#e0f2fe", color: "#075985", border: "1px solid #bae6fd" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#0284c7", display: "inline-block" }} />
                        Đã liên kết
                      </span>
                    ) : (
                      <span style={{ padding: "3px 10px", fontSize: "0.6875rem", fontWeight: 600, borderRadius: "9999px", backgroundColor: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0" }}>
                        Chưa liên kết
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2563eb" }}>
                    {displayContract ? formatCurrency(displayContract.deposit) : "-"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {displayContract ? `${formatDate(displayContract.startDate)} - ${formatDate(displayContract.endDate)}` : "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>
                    {formatDuration(displayContract)}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>
                    {displayContract ? `Ngày ${displayContract.paymentDay}` : "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {displayContract?.fingerprintCode ? (
                      <span style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "8px", fontSize: "0.6875rem", fontWeight: 700 }}>
                        {displayContract.fingerprintCode}
                      </span>
                    ) : "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge active={!!active} ended={ended} />
                  </td>
                  <td style={{ padding: "12px 16px", color: "#94a3b8" }}>-</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <IconButton size="small" onClick={() => onEdit(tenant)} title="Sửa" sx={{ color: "#64748b", "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" } }}>
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    {active && (
                      <IconButton size="small" onClick={() => onCheckout(tenant)} title="Trả phòng" sx={{ color: "#64748b", "&:hover": { color: "#e11d48", bgcolor: "#ffe4e6" } }}>
                        <ExitToAppIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                    {displayContract && (
                      <IconButton size="small" onClick={() => onPrint(displayContract.id)} title="In hợp đồng" sx={{ color: "#64748b", "&:hover": { color: "#059669", bgcolor: "#d1fae5" } }}>
                        <PrintIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </td>
                </tr>
                {expandedId === tenant.id &&
                  companions.map((c, idx) => (
                    <tr key={c.id || idx} style={{ backgroundColor: "#f8fafc", borderBottom: idx === companions.length - 1 ? "1px solid #e2e8f0" : "1px solid #eef2f7" }}>
                      <td style={{ padding: "6px 16px", verticalAlign: "middle" }}>
                        <TreeCell isFirst={idx === 0} isLast={idx === companions.length - 1} />
                      </td>
                      <td style={{ padding: "6px 16px", fontWeight: 700, color: "#0f172a" }}>
                        {c.name}
                      </td>
                      <td style={{ padding: "6px 16px", color: "#64748b", fontWeight: 600 }}>{c.phone || "-"}</td>
                      <td style={{ padding: "6px 16px", color: "#94a3b8" }}>-</td>
                      <td style={{ padding: "6px 16px", color: "#94a3b8" }}>-</td>
                      <td style={{ padding: "6px 16px", color: "#475569" }}>
                        {displayContract ? `${formatDate(displayContract.startDate)} - ${formatDate(displayContract.endDate)}` : "-"}
                      </td>
                      <td style={{ padding: "6px 16px", color: "#0f172a", fontWeight: 600 }}>
                        {formatCompanionDuration(c)}
                      </td>
                      <td style={{ padding: "6px 16px", color: "#94a3b8" }}>-</td>
                      <td style={{ padding: "6px 16px" }}>
                        {c.fingerprintCode ? (
                          <span style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "8px", fontSize: "0.6875rem", fontWeight: 700 }}>
                            {c.fingerprintCode}
                          </span>
                        ) : "-"}
                      </td>
                      <td style={{ padding: "6px 16px" }}>
                        {c.status === "ended" ? (
                          <span style={{ padding: "3px 10px", fontSize: "0.6875rem", fontWeight: 600, borderRadius: "9999px", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
                            Hết Thuê
                          </span>
                        ) : (
                          <StatusBadge active={!!active} ended={ended} />
                        )}
                      </td>
                      <td style={{ padding: "6px 16px", color: "#64748b", fontWeight: 600 }}>{c.relationship || "-"}</td>
                      <td style={{ padding: "6px 16px" }}></td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
}
