"use client";

import { useState } from "react";
import { Box, Typography, Chip, Paper } from "@mui/material";
import { formatCurrency, formatDate } from "../../utils/format";
import { resolveNotificationTemplate } from "../../utils/notificationTemplate";
import ModalShell from "../ui/ModalShell";
import TenantUtilityUsageChart from "./TenantUtilityUsageChart";

export default function TenantOverviewTab({ room, tenant, contract, daysLeft, notifications, calcTotal, monthStr, roomPrice, latestInvoice, landlordAddress, companions }) {
  const [furnitureOpen, setFurnitureOpen] = useState(false);
  const handoverItems = contract?.contractFurnitures || [];

  const statusInfo = latestInvoice
    ? latestInvoice.status === "paid"
      ? { label: "● Đã Thanh Toán", bgcolor: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" }
      : latestInvoice.status === "submitted"
        ? { label: "● Đã Gửi Chỉ Số", bgcolor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }
        : { label: "● Chờ Thu Tiền", bgcolor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }
    : { label: "● Chờ Nhập Điện Nước", bgcolor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" };

  const resolveContent = (content) => resolveNotificationTemplate(content, {
    TENKHACH: tenant?.name || "",
    MAPHONG: room?.room_number || "",
    THANG: monthStr || "",
    TONG_TIEN: contract?.price != null ? String(contract.price) : room?.price != null ? String(room.price) : "",
    HAN_THANH_TOAN: contract?.paymentDay ? String(contract.paymentDay + 5) : "",
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Gradient Banner */}
      <Box sx={{
        background: "linear-gradient(135deg, #1e3a8a, #2563eb, #3730a3)",
        borderRadius: "16px", p: { xs: 3, sm: 4 }, color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { md: "center" }, gap: 3 }}>
          <Box>
            <Chip label="Cư Dân SmartRent" size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: "0.6875rem", borderRadius: "9999px", mb: 1.5 }} />
            <Typography variant="h5" fontWeight="bold" color="#fff">
              Phòng Trọ {room?.room_number || "—"} - {tenant?.name || ""}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#bfdbfe", mt: 0.5, fontWeight: 500 }}>
              Địa chỉ: {landlordAddress || "—"}
            </Typography>
          </Box>
          <Box sx={{
            bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
            p: 3, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)",
            textAlign: "center", minWidth: 200,
          }}>
            <Typography sx={{ fontSize: "0.6875rem", color: "#bfdbfe", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Thời Hạn Hợp Đồng
            </Typography>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#fcd34d", mt: 0.5 }}>
              Còn {daysLeft} Ngày
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "#bfdbfe", mt: 0.5, fontWeight: 500 }}>
              Đến ngày: {contract?.endDate ? formatDate(contract.endDate) : "—"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Info Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
        <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Giá Thuê Phòng Hàng Tháng</Typography>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#2563eb" }}>{formatCurrency(room?.price || roomPrice)}</Typography>
          <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>Ngày thu tiền: Ngày {contract?.paymentDay || 5} hàng tháng</Typography>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Trạng Thái Hóa Đơn Tháng {monthStr}</Typography>
          <Box>
            <Chip label={statusInfo.label} size="small"
              sx={{ bgcolor: statusInfo.bgcolor, color: statusInfo.color, fontWeight: 700, fontSize: "0.6875rem", borderRadius: "9999px", border: statusInfo.border }} />
          </Box>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", mt: 0.5 }}>
            Tổng cộng: {formatCurrency(calcTotal)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Khóa Cửa & Bàn Giao</Typography>
          <Box sx={{ fontSize: "0.8125rem", fontFamily: "monospace", fontWeight: 700, color: "#2563eb", bgcolor: "#f8fafc", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            Mã Vân Tay: {contract?.fingerprintCode || "FP-101-88"}
          </Box>
          <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>
            Vật dụng bàn giao:{" "}
            <Box component="span" onClick={() => setFurnitureOpen(true)} sx={{ color: "#2563eb", fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>
              {handoverItems.length} món
            </Box>
          </Typography>
        </Paper>
      </Box>

      {/* Co-living people */}
      <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <Typography variant="h6" fontWeight="bold" color="#0f172a">Người Ở Cùng</Typography>
          <Chip label={String((companions || []).length + 1)} size="small"
            sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.6875rem", borderRadius: "9999px", border: "1px solid #bfdbfe", ml: "auto" }} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Paper sx={{ p: 2, bgcolor: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "12px", bgcolor: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8125rem", flexShrink: 0 }}>
              {(tenant?.name || "?").trim().charAt(0).toUpperCase()}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {tenant?.name || "—"}
                </Typography>
                <Chip label="Chủ hợp đồng" size="small" sx={{ bgcolor: "#2563eb", color: "#fff", fontWeight: 700, fontSize: "0.625rem", borderRadius: "9999px", height: 20, ml: "auto", flexShrink: 0 }} />
              </Box>
              <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", mt: 0.25 }}>
                SĐT: {tenant?.phone || "—"}{tenant?.cccd ? ` • CCCD: ${tenant.cccd}` : ""}
              </Typography>
            </Box>
          </Paper>
          {companions.length > 0 && companions.map((c) => (
            <Paper key={c.id} sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "12px", bgcolor: "#c7d2fe", color: "#4338ca", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8125rem", flexShrink: 0 }}>
                {String(c.name || "?").trim().charAt(0).toUpperCase()}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.name || "—"}
                  </Typography>
                  <Chip label={c.relationship || "Đi kèm"} size="small" sx={{ bgcolor: "#eef2f7", color: "#475569", fontWeight: 700, fontSize: "0.625rem", borderRadius: "9999px", height: 20, flexShrink: 0 }} />
                </Box>
                <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", mt: 0.25 }}>
                  SĐT: {c.phone || "—"}{c.cccd ? ` · CCCD: ${c.cccd}` : ""}
                </Typography>
              </Box>
            </Paper>
          ))}
          {companions.length === 0 && (
            <Typography sx={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", py: 2 }}>
              Hiện không có người đi kèm nào.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Utility usage chart */}
      <TenantUtilityUsageChart />

      {/* Notifications */}
      <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 2 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <Typography variant="h6" fontWeight="bold" color="#0f172a">Thông Báo Nhận Từ Chủ Trọ (Telegram)</Typography>
        </Box>
        {notifications.length === 0 ? (
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", py: 4 }}>
            Chưa có thông báo nào mới từ Chủ trọ.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: 245, maxHeight: 245, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
            {notifications.map((n) => (
              <Paper key={n.id} sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.75rem" }}>{n.title}</Typography>
                  <Typography sx={{ fontSize: "0.625rem", color: "#94a3b8", fontWeight: 500 }}>{n.createdAt ? formatDate(n.createdAt) : ""}</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.6875rem", color: "#475569", lineHeight: 1.6 }}>{resolveContent(n.content)}</Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      <ModalShell open={furnitureOpen} onClose={() => setFurnitureOpen(false)} maxWidth={480}
        headerBg="#059669"
        header={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M3 7V5a2 2 0 0 1 2-2h4l2 3h6a2 2 0 0 1 2 2v2"/></svg>
            <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>
              Vật Dụng Bàn Giao - Phòng {room?.room_number || "—"}
            </Typography>
          </Box>
        }
        body={
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {handoverItems.length === 0 ? (
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", py: 3 }}>
                Không có vật dụng bàn giao.
              </Typography>
            ) : (
              handoverItems.map((item) => (
                <Paper key={item.id} sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>{item.furniture?.name || "—"}</Typography>
                    {item.furniture?.note && (
                      <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", mt: 0.25 }}>{item.furniture.note}</Typography>
                    )}
                  </Box>
                  <Chip label={`x${item.quantity || 1}`} size="small"
                    sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.6875rem", borderRadius: "9999px", border: "1px solid #bfdbfe", flexShrink: 0 }} />
                </Paper>
              ))
            )}
          </Box>
        }
      />
    </Box>
  );
}
