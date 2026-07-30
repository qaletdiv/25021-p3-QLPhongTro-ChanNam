import { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Chip, CircularProgress, Alert, Paper,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import WarningIcon from "@mui/icons-material/Warning";
import PaidIcon from "@mui/icons-material/Paid";
import HotelIcon from "@mui/icons-material/Hotel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SendIcon from "@mui/icons-material/Send";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ShieldIcon from "@mui/icons-material/Shield";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import dashboardApi from "../api/dashboardApi";
import { useNavigate } from "react-router-dom";

const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), dashboardApi.getExpiringContracts()])
      .then(([statsRes, expiringRes]) => {
        setStats(statsRes.data);
        setExpiring(expiringRes.data.contracts);
      })
      .catch((err) => setError(err.response?.data?.message || "Lỗi tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ borderRadius: "12px" }}>{error}</Alert>;

  const totalRooms = stats.totalRooms || 0;
  const vacantRooms = stats.emptyRooms || 0;
  const rentedRooms = stats.rentedRooms || 0;
  const currentTenants = stats.currentTenants || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

  const chartData = [
    { month: "T02/26", revenue: 11200000 },
    { month: "T03/26", revenue: 11800000 },
    { month: "T04/26", revenue: 12400000 },
    { month: "T05/26", revenue: 12100000 },
    { month: "T06/26", revenue: 12800000 },
    { month: "T07/26", revenue: stats.monthlyRevenue || 12805000 },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Banner */}
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
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.025em", mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
              Tổng Quan Quản Lý Nhà Trọ
              <AutoAwesomeIcon sx={{ fontSize: 20, color: "#fcd34d" }} />
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#bfdbfe", maxWidth: 560 }}>
              Theo dõi biến động doanh thu, tỷ lệ lấp đầy phòng, xử lý công nợ và quản lý hợp đồng cho thuê.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Box
              onClick={() => navigate("/landlord/notifications")}
              sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 1.25, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
            >
              <SendIcon sx={{ fontSize: 16 }} />
              <span>Gửi Thông Báo</span>
            </Box>
            <Box
              onClick={() => navigate("/landlord/invoices")}
              sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 1.25, bgcolor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }, border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <DescriptionIcon sx={{ fontSize: 16 }} />
              <span>Tạo Hóa Đơn Mới</span>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={2}>
        {[
          { label: "Tổng Phòng", value: totalRooms, sub: "Quy mô cơ sở", icon: <HotelIcon />, color: "#475569", bg: "#f1f5f9", valueColor: "#0f172a" },
          { label: "Đã Cho Thuê", value: rentedRooms, sub: `Tỷ lệ: ${occupancyRate}%`, icon: <PeopleIcon />, color: "#059669", bg: "#d1fae5", valueColor: "#059669" },
          { label: "Phòng Trống", value: vacantRooms, sub: "Sẵn sàng bàn giao", icon: <MeetingRoomIcon />, color: "#d97706", bg: "#fef3c7", valueColor: "#d97706" },
          { label: "Khách Thuê", value: currentTenants, sub: "Trong hợp đồng", icon: <PeopleIcon />, color: "#7c3aed", bg: "#ede9fe", valueColor: "#7c3aed" },
          { label: "Thực Thu", value: formatCurrency(stats.monthlyRevenue), sub: "Đã ghi nhận", icon: <PaidIcon />, color: "#2563eb", bg: "#eff6ff", valueColor: "#0f172a", subIcon: <TrendingUpIcon sx={{ fontSize: 12, mr: 0.25 }} />, subColor: "#059669" },
          { label: "Công Nợ", value: formatCurrency(stats.totalDebt), sub: "Chưa thanh toán", icon: <WarningIcon />, color: "#e11d48", bg: "#ffe4e6", valueColor: "#e11d48" },
        ].map((card) => (
          <Grid item xs={6} md={4} lg={2} key={card.label}>
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
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: card.valueColor, lineHeight: 1.1 }}>
                  {card.value}
                </Typography>
                <Typography sx={{ fontSize: "0.6875rem", color: card.subColor || "#64748b", fontWeight: card.subIcon ? 700 : 500, mt: 0.5, display: "flex", alignItems: "center" }}>
                  {card.subIcon}
                  {card.sub}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Middle Row: Chart + Expiring Contracts */}
      <Grid container spacing={2}>
        {/* Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: "16px", p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" }, gap: 1, mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Doanh Thu 6 Tháng Gần Nhất
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Thống kê doanh thu thực nhận định kỳ
                </Typography>
              </Box>
              <Chip
                label={`Thực thu T07/26: ${formatCurrency(stats.monthlyRevenue)}`}
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, borderRadius: "12px", fontSize: "0.6875rem", border: "1px solid #bfdbfe", alignSelf: "flex-start" }}
              />
            </Box>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Doanh Thu"]}
                    contentStyle={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "12px", fontSize: "12px", border: "1px solid #334155" }}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Expiring Contracts */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: "#fef3c7", color: "#d97706", borderRadius: "12px", display: "flex" }}>
                  <CalendarMonthIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Hợp Đồng Sắp Hết Hạn
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                    Trong vòng 60 ngày tới
                  </Typography>
                </Box>
              </Box>
              <Chip label={`${expiring.length} HĐ`} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, borderRadius: "8px", fontSize: "0.6875rem", border: "1px solid #fde68a" }} />
            </Box>

            {expiring.length === 0 ? (
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #e2e8f0", borderRadius: "16px", p: 4 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Không có hợp đồng nào sắp hết hạn trong 60 ngày tới.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
                {expiring.slice(0, 6).map((c) => {
                  const end = new Date(c.endDate);
                  const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
                  return (
                    <Paper
                      key={c.id}
                      sx={{
                        p: 1.5, bgcolor: "rgba(255,251,235,0.7)", borderRadius: "12px",
                        border: "1px solid rgba(253,230,138,0.8)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                          Phòng {c.room?.room_number} - {c.tenant?.name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                          SĐT: {c.tenant?.phone} • Hạn: {new Date(c.endDate).toLocaleDateString("vi-VN")}
                        </Typography>
                      </Box>
                      <Chip
                        label={`Còn ${daysLeft} ngày`}
                        size="small"
                        sx={{ bgcolor: "#d97706", color: "#fff", fontWeight: 700, borderRadius: "8px", fontSize: "0.6875rem" }}
                      />
                    </Paper>
                  );
                })}
              </Box>
            )}

            <Box
              onClick={() => navigate("/landlord/tenants")}
              sx={{
                mt: 2.5, py: 1.5, bgcolor: "#f1f5f9", borderRadius: "12px", textAlign: "center",
                fontSize: "0.75rem", fontWeight: 700, color: "#475569", cursor: "pointer",
                "&:hover": { bgcolor: "#e2e8f0" },
              }}
            >
              Quản lý hợp đồng & gia hạn →
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
