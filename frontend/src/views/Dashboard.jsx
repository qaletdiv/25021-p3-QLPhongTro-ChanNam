"use client";

import { useState, useEffect } from "react";
import { Box, Grid, CircularProgress, Alert } from "@mui/material";
import DashboardBanner from "../components/dashboard/DashboardBanner";
import KpiCards from "../components/dashboard/KpiCards";
import RevenueChart from "../components/dashboard/RevenueChart";
import ExpiringContracts from "../components/dashboard/ExpiringContracts";
import dashboardApi from "../api/dashboardApi";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [expiring, setExpiring] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), dashboardApi.getExpiringContracts(), dashboardApi.getMonthlyRevenue()])
      .then(([statsRes, expiringRes, revRes]) => {
        setStats(statsRes.data);
        setExpiring(expiringRes.data.contracts);
        setChartData((revRes.data.chartData || []).map((d) => ({
          month: `T${d.month.slice(0, 2)}/${d.month.slice(3, 5)}`,
          revenue: d.revenue,
        })));
      })
      .catch((err) => setError(err.response?.data?.message || "Lỗi tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ borderRadius: "12px" }}>{error}</Alert>;

  const totalRooms = stats.totalRooms || 0;
  const vacantRooms = stats.emptyRooms || 0;
  const rentedRooms = stats.rentedRooms || 0;
  const currentTenants = stats.currentTenants || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

  const navigate = (path) => router.push(path);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <DashboardBanner onNavigate={navigate} />

      <KpiCards
        totalRooms={totalRooms}
        rentedRooms={rentedRooms}
        vacantRooms={vacantRooms}
        currentTenants={currentTenants}
        occupancyRate={occupancyRate}
        monthlyRevenue={stats.monthlyRevenue}
        totalDebt={stats.totalDebt}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <RevenueChart data={chartData} monthlyRevenue={stats.monthlyRevenue} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ExpiringContracts expiring={expiring} onManage={navigate} />
        </Grid>
      </Grid>
    </Box>
  );
}
