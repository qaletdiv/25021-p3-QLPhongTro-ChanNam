"use client";

import { Box, Typography, Chip, Paper } from "@mui/material";
import { formatCurrency, formatDate } from "../../utils/format";

export default function TenantOverviewTab({ room, tenant, contract, daysLeft, notifications, calcTotal, monthStr, roomPrice }) {
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
            <Typography sx={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.025em" }}>
              Phòng Trọ {room?.room_number || "—"} - {tenant?.name || ""}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#bfdbfe", mt: 0.5, fontWeight: 500 }}>
              Địa chỉ: Số 123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội
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
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#fcd34d", mt: 0.5 }}>
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
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#2563eb" }}>{formatCurrency(room?.price || roomPrice)}</Typography>
          <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>Ngày thu tiền: Ngày {contract?.paymentDay || 5} hàng tháng</Typography>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Trạng Thái Hóa Đơn Tháng {monthStr}</Typography>
          <Box>
            <Chip label="● Chờ Nhập Điện Nước" size="small"
              sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 800, fontSize: "0.6875rem", borderRadius: "9999px", border: "1px solid #e2e8f0" }} />
          </Box>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
            Tổng cộng: {formatCurrency(calcTotal)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Khóa Cửa & Bàn Giao</Typography>
          <Box sx={{ fontSize: "0.8125rem", fontFamily: "monospace", fontWeight: 800, color: "#2563eb", bgcolor: "#f8fafc", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            Mã Vân Tay: {contract?.fingerprintCode || "FP-101-88"}
          </Box>
          <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>Vật dụng bàn giao: {contract?.contractFurnitures?.length || 0} món</Typography>
        </Paper>
      </Box>

      {/* Notifications */}
      <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 2 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a" }}>Thông Báo Nhận Từ Chủ Trọ (Zalo OA)</Typography>
        </Box>
        {notifications.length === 0 ? (
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", py: 4 }}>
            Chưa có thông báo nào mới từ Chủ trọ.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {notifications.map((n) => (
              <Paper key={n.id} sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.75rem" }}>{n.title}</Typography>
                  <Typography sx={{ fontSize: "0.625rem", color: "#94a3b8", fontWeight: 500 }}>{n.createdAt ? formatDate(n.createdAt) : ""}</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.6875rem", color: "#475569", lineHeight: 1.6 }}>{n.content}</Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
