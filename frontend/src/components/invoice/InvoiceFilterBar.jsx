"use client";

import { Box, Paper, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const STATUS_FILTERS = [
  { key: "all", label: "Tất Cả", activeColor: "#2563eb" },
  { key: "submitted", label: "Đã Gửi Chỉ Số", activeColor: "#d97706" },
  { key: "paid", label: "Đã Thanh Toán", activeColor: "#059669" },
  { key: "pending", label: "Chờ Nhập Chỉ Số", activeColor: "#334155" },
];

export default function InvoiceFilterBar({ total, counts, filterStatus, onFilterChange, searchQuery, onSearchChange }) {
  return (
    <Paper sx={{ p: 2, borderRadius: "16px", display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, gap: 2, justifyContent: "space-between", border: "1px solid #e2e8f0" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, bgcolor: "#f1f5f9", p: 0.5, borderRadius: "12px", width: { xs: "100%", md: "auto" } }}>
        {STATUS_FILTERS.map((f) => (
          <Box key={f.key} onClick={() => onFilterChange(f.key)}
            sx={{ px: 1.75, py: 0.9, borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", bgcolor: filterStatus === f.key ? f.activeColor : "transparent", color: filterStatus === f.key ? "#fff" : "#475569", boxShadow: filterStatus === f.key ? "0 1px 2px rgba(0,0,0,0.05)" : "none", transition: "all 0.15s", whiteSpace: "nowrap" }}
          >{f.label} ({counts[f.key] ?? total})</Box>
        ))}
      </Box>
      <TextField
        value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Tìm số phòng, tên khách..."
        sx={{ width: { xs: "100%", md: 280 }, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" }, pl: 3.5 } }}
        slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: "#94a3b8", fontSize: 16, mr: 0.5 }} /> } }}
      />
    </Paper>
  );
}
