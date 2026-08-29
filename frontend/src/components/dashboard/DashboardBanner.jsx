"use client";

import { Box, Paper, Chip, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DescriptionIcon from "@mui/icons-material/Description";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ShieldIcon from "@mui/icons-material/Shield";

export default function DashboardBanner({ onNavigate, buildings = [], selectedBuilding = "", onBuildingChange }) {
  return (
    <Paper
      sx={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #0f172a 100%)",
        color: "#fff", borderRadius: "16px", p: 3, position: "relative", overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, justifyContent: "space-between", gap: 3 }}>
        <Box>
          <Chip
            icon={<ShieldIcon sx={{ fontSize: 14, color: "#93c5fd" }} />}
            label="Hệ Thống Quản Lý Cho Thuê Phòng Trọ"
            size="small"
            sx={{ bgcolor: "rgba(59,130,246,0.2)", color: "#bfdbfe", fontWeight: 700, borderRadius: "9999px", border: "1px solid rgba(96,165,250,0.3)", fontSize: "0.6875rem", mb: 1.5 }}
          />
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
            Tổng Quan Quản Lý Nhà Trọ
            <AutoAwesomeIcon sx={{ fontSize: 20, color: "#fcd34d" }} />
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#bfdbfe", maxWidth: 560 }}>
            Theo dõi biến động doanh thu, tỷ lệ lấp đầy phòng, xử lý công nợ và quản lý hợp đồng cho thuê.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 200, bgcolor: "#fff", borderRadius: "10px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" } }}>
            <InputLabel id="banner-building-label">Nhà trọ</InputLabel>
            <Select
              labelId="banner-building-label"
              label="Nhà trọ"
              value={selectedBuilding}
              onChange={(e) => onBuildingChange?.(e.target.value)}
              sx={{ fontSize: "0.8125rem", borderRadius: "10px", color: "#0f172a" }}
            >
              <MenuItem value=""><em>Tất Cả Nhà</em></MenuItem>
              {buildings.map((b) => (
                <MenuItem key={String(b.id)} value={String(b.id)}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box
            onClick={() => onNavigate("/landlord/notifications")}
            sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 1.25, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
          >
            <SendIcon sx={{ fontSize: 16 }} />
            <span>Gửi Thông Báo</span>
          </Box>
          <Box
            onClick={() => onNavigate("/landlord/invoices")}
            sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 1.25, bgcolor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <DescriptionIcon sx={{ fontSize: 16 }} />
            <span>Tạo Hóa Đơn Mới</span>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
