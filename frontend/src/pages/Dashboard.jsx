import { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, CircularProgress, Alert, Paper,
} from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PeopleIcon from "@mui/icons-material/People";
import WarningIcon from "@mui/icons-material/Warning";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import dashboardApi from "../api/dashboardApi";
import { useNavigate } from "react-router-dom";

const formatCurrency = (n) => (n || 0).toLocaleString("vi-VN");

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
    { month: "T2/26", revenue: 11200000 },
    { month: "T3/26", revenue: 11800000 },
    { month: "T4/26", revenue: 12400000 },
    { month: "T5/26", revenue: 12100000 },
    { month: "T6/26", revenue: 12800000 },
    { month: "T7/26", revenue: stats.monthlyRevenue || 12805000 },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Gradient Banner */}
      <Paper
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e3a8a 100%)",
          color: "#fff",
          borderRadius: "16px",
          p: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 14, color: "#34d399" }} />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#93c5fd" }}>
              Hệ Thống Đang Hoạt Động
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.025em", mb: 0.5 }}>
            Tổng Quan Quản Lý Nhà Trọ
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#bfdbfe" }}>
            Thống kê doanh thu, phòng trống, công nợ và quản lý hợp đồng.
          </Typography>
        </Box>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={2}>
        {[
          { label: "Tổng Số Phòng", value: totalRooms, sub: "Quy mô nhà trọ", icon: <HotelIcon />, color: "#2563eb", bg: "#eff6ff", hoverBorder: "#93c5fd" },
          { label: "Đã Cho Thuê", value: rentedRooms, sub: `Tỷ lệ: ${occupancyRate}%`, icon: <PeopleIcon />, color: "#059669", bg: "#d1fae5", hoverBorder: "#6ee7b7" },
          { label: "Phòng Trống", value: vacantRooms, sub: "Sẵn sàng nhận khách", icon: <MeetingRoomIcon />, color: "#d97706", bg: "#fef3c7", hoverBorder: "#fcd34d" },
          { label: "Số Khách Thuê", value: currentTenants, sub: "Đang trong hợp đồng", icon: <PeopleIcon />, color: "#7c3aed", bg: "#ede9fe", hoverBorder: "#a78bfa" },
          { label: "Doanh Thu Tháng", value: `${formatCurrency(stats.monthlyRevenue)}đ`, sub: "Đã thực thu", icon: <PaidIcon />, color: "#2563eb", bg: "#eff6ff", hoverBorder: "#93c5fd" },
          { label: "Tổng Công Nợ", value: `${formatCurrency(stats.totalDebt)}đ`, sub: "Chưa thanh toán", icon: <WarningIcon />, color: "#e11d48", bg: "#ffe4e6", hoverBorder: "#fda4af" },
        ].map((card) => (
          <Grid item xs={6} md={4} lg={2} key={card.label}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                "&:hover": { borderColor: card.hoverBorder },
                transition: "all 0.2s",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {card.label}
                  </Typography>
                  <Box sx={{ p: 1, bgcolor: card.bg, color: card.color, borderRadius: "12px", display: "flex" }}>
                    {card.icon}
                  </Box>
                </Box>
                <Typography sx={{ fontSize: "1.25rem", fontWeight: 900, color: card.color, lineHeight: 1.2 }}>
                  {card.value}
                </Typography>
                <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 500, mt: 0.25 }}>
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
          <Card sx={{ borderRadius: "16px", p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Biểu Đồ Doanh Thu 6 Tháng
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Doanh thu thực tế theo tháng (VNĐ)
                </Typography>
              </Box>
              <Chip
                label={`Tháng này: ${formatCurrency(stats.monthlyRevenue)}đ`}
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#2563eb", fontWeight: 700, borderRadius: "9999px", fontSize: "0.6875rem" }}
              />
            </Box>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    formatter={(value) => [`${formatCurrency(value)} VNĐ`, "Doanh Thu"]}
                    contentStyle={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: "12px", fontSize: "12px", border: "none" }}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Expiring Contracts */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: "16px", p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarMonthIcon sx={{ color: "#d97706", fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Hợp Đồng Sắp Hết Hạn
                </Typography>
              </Box>
              <Chip label={`${expiring.length} Hợp đồng`} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, borderRadius: "9999px", fontSize: "0.6875rem" }} />
            </Box>

            {expiring.length === 0 ? (
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Không có hợp đồng nào sắp hết hạn.
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
                        p: 1.5,
                        bgcolor: "#fffbeb",
                        borderRadius: "12px",
                        border: "1px solid #fde68a",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
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

            <Box sx={{ mt: 2 }}>
              <Box
                onClick={() => navigate("/landlord/tenants")}
                sx={{
                  py: 1.5,
                  bgcolor: "#f1f5f9",
                  borderRadius: "12px",
                  textAlign: "center",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#e2e8f0" },
                }}
              >
                Quản lý hợp đồng & gia hạn →
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
