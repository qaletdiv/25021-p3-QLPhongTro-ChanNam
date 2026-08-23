"use client";

import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import WarningIcon from "@mui/icons-material/Warning";
import PaidIcon from "@mui/icons-material/Paid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { formatCurrency } from "../../utils/format";

export default function KpiCards({ totalRooms, rentedRooms, vacantRooms, currentTenants, occupancyRate, monthlyRevenue, totalDebt }) {
  const cards = [
    { label: "Tổng Phòng", value: totalRooms, sub: "Quy mô cơ sở", icon: <HotelIcon />, color: "#475569", bg: "#f1f5f9", valueColor: "#0f172a" },
    { label: "Đã Cho Thuê", value: rentedRooms, sub: `Tỷ lệ: ${occupancyRate}%`, icon: <PeopleIcon />, color: "#059669", bg: "#d1fae5", valueColor: "#059669" },
    { label: "Phòng Trống", value: vacantRooms, sub: "Sẵn sàng bàn giao", icon: <MeetingRoomIcon />, color: "#d97706", bg: "#fef3c7", valueColor: "#d97706" },
    { label: "Khách Thuê", value: currentTenants, sub: "Trong hợp đồng", icon: <PeopleIcon />, color: "#7c3aed", bg: "#ede9fe", valueColor: "#7c3aed" },
    { label: "Thực Thu", value: formatCurrency(monthlyRevenue), sub: "Đã ghi nhận", icon: <PaidIcon />, color: "#2563eb", bg: "#eff6ff", valueColor: "#0f172a", subIcon: <TrendingUpIcon sx={{ fontSize: 12, mr: 0.25 }} />, subColor: "#059669" },
    { label: "Chờ Thu", value: formatCurrency(totalDebt), sub: "Chờ xác nhận thu tiền", icon: <WarningIcon />, color: "#e11d48", bg: "#ffe4e6", valueColor: "#e11d48" },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid size={{ xs: 6, md: 4, lg: 2 }} key={card.label}>
          <Card
            sx={{
              borderRadius: "16px", border: "1px solid #e2e8f0",
              transition: "all 0.2s", "&:hover": { borderColor: "#cbd5e1" },
            }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {card.label}
                </Typography>
                <Box sx={{ p: 1, bgcolor: card.bg, color: card.color, borderRadius: "12px", display: "flex" }}>
                  {card.icon}
                </Box>
              </Box>
              <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: card.valueColor, lineHeight: 1.1, textAlign: "center" }}>
                {card.value}
              </Typography>
              <Typography sx={{ fontSize: "0.6875rem", color: card.subColor || "#64748b", fontWeight: card.subIcon ? 700 : 500, mt: 0.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {card.subIcon}
                {card.sub}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
