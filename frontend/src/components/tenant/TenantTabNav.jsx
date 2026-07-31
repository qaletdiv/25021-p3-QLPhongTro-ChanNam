"use client";

import { Box, Paper } from "@mui/material";

const TABS = [
  { key: "dashboard", label: "Bảng Điều Khiển Phòng Trọ" },
  { key: "meter_invoice", label: "Nhập Chỉ Số & Hóa Đơn VietQR" },
  { key: "profile", label: "Hồ Sơ Cá Nhân" },
];

export default function TenantTabNav({ activeTab, onTabChange }) {
  const tabBtnStyle = (tab) => ({
    flex: 1, py: 1.25, px: 1.5, fontSize: "0.75rem", fontWeight: 800,
    borderRadius: "10px", cursor: "pointer", textAlign: "center",
    bgcolor: activeTab === tab ? "#2563eb" : "transparent",
    color: activeTab === tab ? "#fff" : "#475569",
    transition: "all 0.15s",
    "&:hover": activeTab !== tab ? { bgcolor: "#f8fafc" } : {},
  });

  return (
    <Paper sx={{ p: 0.75, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", gap: 0.5 }}>
      {TABS.map((t) => (
        <Box key={t.key} onClick={() => onTabChange(t.key)} sx={tabBtnStyle(t.key)}>{t.label}</Box>
      ))}
    </Paper>
  );
}
