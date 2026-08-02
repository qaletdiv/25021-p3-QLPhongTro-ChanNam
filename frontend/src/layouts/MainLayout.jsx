"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box, Typography, Button, Avatar, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Divider, useMediaQuery, useTheme, IconButton, Badge,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ChairIcon from "@mui/icons-material/Chair";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import BugReportIcon from "@mui/icons-material/BugReport";
import { useAuth } from "../contexts/AuthContext";
import issueApi from "../api/issueApi";

const drawerWidth = 260;

const menuItems = [
  { label: "Tổng quan", icon: <DashboardIcon />, path: "/landlord/dashboard" },
  { label: "Nhà Trọ", icon: <ApartmentIcon />, path: "/landlord/buildings" },
  { label: "Phòng", icon: <MeetingRoomIcon />, path: "/landlord/rooms" },
  { label: "Vật Dụng", icon: <ChairIcon />, path: "/landlord/furnitures" },
  { label: "Hợp Đồng", icon: <PeopleIcon />, path: "/landlord/tenants" },
  { label: "Hóa Đơn", icon: <ReceiptIcon />, path: "/landlord/invoices" },
  { label: "Báo Hỏng", icon: <BugReportIcon />, path: "/landlord/issues", badge: true },
  { label: "Thông Báo", icon: <NotificationsIcon />, path: "/landlord/notifications" },
  { label: "Cài Đặt", icon: <SettingsIcon />, path: "/landlord/settings" },
  { label: "Mẫu Hợp Đồng", icon: <DescriptionIcon />, path: "/landlord/contract-template" },
];

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingIssues, setPendingIssues] = useState(0);

  useEffect(() => {
    let active = true;
    const loadCount = () => {
      issueApi.getPendingCount()
        .then((res) => { if (active) setPendingIssues(res.data.count || 0); })
        .catch(() => {});
    };
    loadCount();
    const timer = setInterval(loadCount, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const handleLogout = () => { logout(); router.push("/login/landlord"); };

  const sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fff" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 2.5 }}>
        <Avatar sx={{ bgcolor: "#2563eb", width: 38, height: 38, borderRadius: "10px" }}>
          <HomeIcon />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.2, color: "#0f172a" }}>SmartRent</Typography>
          <Typography sx={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 500 }}>Quản Lý Phòng Trọ</Typography>
        </Box>
      </Box>
      <Divider sx={{ mx: 2 }} />
      <Box sx={{ mx: 2, my: 1.5, p: 1.5, textAlign: "center", bgcolor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{user?.name}</Typography>
        <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>{user?.email}</Typography>
        <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}
          sx={{ mt: 1.25, borderRadius: "8px", fontSize: "0.75rem", color: "#64748b", borderColor: "#e2e8f0", "&:hover": { borderColor: "#ef4444", color: "#ef4444", bgcolor: "#fef2f2" } }}
        >Đăng xuất</Button>
      </Box>
      <List sx={{ px: 1, py: 0.5, flex: 1 }}>
        {menuItems.map((item) => {
          const selected = pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => { router.push(item.path); if (isMobile) setMobileOpen(false); }}
              sx={{
                borderRadius: "8px", mb: 0.25, px: 1.5, py: 0.8,
                "&.Mui-selected": { bgcolor: "#eff6ff", "& .MuiListItemIcon-root": { color: "#2563eb" }, "& .MuiListItemText-primary": { color: "#2563eb", fontWeight: 700 } },
                "&:hover": { bgcolor: "#f8fafc" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: selected ? "#2563eb" : "#64748b" }}>
                {item.badge ? (
                  <Badge badgeContent={pendingIssues > 0 ? pendingIssues : null} color="error" sx={{ "& .MuiBadge-badge": { fontSize: "0.5625rem", minWidth: 16, height: 16, borderRadius: "8px" } }}>
                    {item.icon}
                  </Badge>
                ) : item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { fontSize: "0.8125rem", fontWeight: selected ? 700 : 500, color: selected ? "#2563eb" : "#334155" } }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f1f5f9" }}>
      {isMobile && (
        <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ position: "fixed", top: 12, left: 12, zIndex: 1200, bgcolor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <MenuIcon />
        </IconButton>
      )}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{ "& .MuiDrawer-paper": { width: drawerWidth, borderRight: "1px solid #e2e8f0", bgcolor: "#fff" } }}
        >
          {sidebar}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 }, mt: isMobile ? 7 : 0 }}>
        {children}
      </Box>
    </Box>
  );
}
