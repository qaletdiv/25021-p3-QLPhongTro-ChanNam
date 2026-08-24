"use client";

import { useState, useEffect } from "react";
import { Box, Grid, Badge, Icon, Menu, MenuItem, Divider, Typography, IconButton } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BugReportIcon from "@mui/icons-material/BugReport";
import DashboardBanner from "../components/dashboard/DashboardBanner";
import KpiCards from "../components/dashboard/KpiCards";
import RevenueChart from "../components/dashboard/RevenueChart";
import ExpiringContracts from "../components/dashboard/ExpiringContracts";
import UtilityUsageChart from "../components/dashboard/UtilityUsageChart";
import PriceHistoryChart from "../components/dashboard/PriceHistoryChart";
import dashboardApi from "../api/dashboardApi";
import { useRouter } from "next/navigation";

export default function Dashboard({ stats, revenue, expiring }) {
  const [notifCount, setNotifCount] = useState(0);
  const [notifItems, setNotifItems] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const loadNotifs = () => {
      dashboardApi.getNotifications()
        .then((res) => {
          if (!active) return;
          setNotifCount(res.data.unreadCount || 0);
          setNotifItems(res.data.items || []);
        })
        .catch(() => {});
    };
    loadNotifs();
    const timer = setInterval(loadNotifs, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const openBell = (e) => setAnchorEl(e.currentTarget);

  const handleNotifClick = (link) => {
    setAnchorEl(null);
    router.push(link);
  };

  const totalRooms = stats?.totalRooms || 0;
  const vacantRooms = stats?.emptyRooms || 0;
  const rentedRooms = stats?.rentedRooms || 0;
  const currentTenants = stats?.currentTenants || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

  const navigate = (path) => router.push(path);

  const kindIcon = (kind) => kind === "invoice"
    ? <ReceiptIcon sx={{ fontSize: 18, color: "#2563eb" }} />
    : <BugReportIcon sx={{ fontSize: 18, color: "#d97706" }} />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
        <IconButton onClick={openBell} sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", "&:hover": { bgcolor: "#f8fafc" } }}>
          <Badge badgeContent={notifCount > 0 ? notifCount : null} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.625rem", minWidth: 16, height: 16, borderRadius: "8px" } }}>
            <NotificationsIcon sx={{ fontSize: 20, color: "#475569" }} />
          </Badge>
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
          slotProps={{ paper: { sx: { mt: 1, width: 340, borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" } } }}>
          <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#0f172a", fontSize: "0.8125rem" }}>
            Thông báo chưa đọc ({notifCount})
          </Box>
          {notifItems.length === 0 && (
            <Box sx={{ px: 2, py: 3, textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>
              Không có thông báo nào.
            </Box>
          )}
          {notifItems.map((item, idx) => (
            <Box key={item.kind}>
              {idx > 0 && <Divider />}
              <MenuItem onClick={() => handleNotifClick(item.link)}
                sx={{ py: 1.25, alignItems: "flex-start", gap: 1.25, whiteSpace: "normal" }}>
                <Box sx={{ mt: 0.25 }}>{kindIcon(item.kind)}</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.75rem" }}>{item.title}</Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.6875rem" }}>{item.message}</Typography>
                </Box>
              </MenuItem>
            </Box>
          ))}
        </Menu>
      </Box>

      <DashboardBanner onNavigate={navigate} />

      <KpiCards
        totalRooms={totalRooms}
        rentedRooms={rentedRooms}
        vacantRooms={vacantRooms}
        currentTenants={currentTenants}
        occupancyRate={occupancyRate}
        monthlyRevenue={stats?.monthlyRevenue}
        totalDebt={stats?.totalDebt}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <RevenueChart data={revenue} monthlyRevenue={stats?.monthlyRevenue} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ExpiringContracts expiring={expiring} onManage={navigate} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <UtilityUsageChart />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <PriceHistoryChart />
        </Grid>
      </Grid>
    </Box>
  );
}
