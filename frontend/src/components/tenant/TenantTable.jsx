"use client";

import { Box, Paper, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PrintIcon from "@mui/icons-material/Print";
import { formatCurrency, formatDate } from "../../utils/format";

const HEADERS = ["Phòng", "Khách Thuê", "Số Điện Thoại", "Telegram", "Tiền Cọc", "Thời Hạn HĐ", "Ngày Thu", "Mã Vân Tay", "Trạng Thái", ""];

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

export default function TenantTable({ tenants, onEdit, onCheckout, onPrint }) {
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
              return (
                <tr key={tenant.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
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
                    {tenant.name}
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
                    {displayContract ? `Ngày ${displayContract.paymentDay}` : "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {displayContract?.fingerprintCode ? (
                      <span style={{ fontFamily: "monospace", backgroundColor: "#f1f5f9", color: "#0f172a", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "8px", fontSize: "0.6875rem", fontWeight: 700 }}>
                        {displayContract.fingerprintCode}
                      </span>
                    ) : "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge active={!!active} ended={ended} />
                  </td>
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
              );
            })}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
}
