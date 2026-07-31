"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box, Typography, Button, Avatar, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Divider, useMediaQuery, useTheme, IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BuildIcon from "@mui/icons-material/Build";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 260;

const menuItems = [
  { label: "Trang chủ", icon: <HomeIcon />, path: "/tenant/dashboard" },
  { label: "Hóa đơn", icon: <ReceiptIcon />, path: "/tenant/invoices" },
  { label: "Báo hỏng", icon: <BuildIcon />, path: "/tenant/issues" },
  { label: "Hồ sơ", icon: <PersonIcon />, path: "/tenant/profile" },
];

export default function TenantLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); router.push("/login/tenant"); };

  const sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fff" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 2.5 }}>
        <Avatar sx={{ bgcolor: "#059669", width: 38, height: 38, borderRadius: "10px" }}>
          <ApartmentIcon />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.2, color: "#0f172a" }}>Phòng Trọ</Typography>
          <Typography sx={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 500 }}>Cổng thông tin người thuê</Typography>
        </Box>
      </Box>
      <Divider sx={{ mx: 2 }} />
      <Box sx={{ mx: 2, my: 1.5, p: 1.5, bgcolor: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#065f46" }}>{user?.name}</Typography>
        <Typography sx={{ fontSize: "0.65rem", color: "#047857" }}>{user?.email}</Typography>
      </Box>
      <List sx={{ px: 1, py: 0.5, flex: 1 }}>
        {menuItems.map((item) => {
          const selected = pathname === item.path;
          return (
            <ListItemButton
              key={item.path} selected={selected}
              onClick={() => { router.push(item.path); if (isMobile) setMobileOpen(false); }}
              sx={{
                borderRadius: "8px", mb: 0.25, px: 1.5, py: 0.8,
                "&.Mui-selected": { bgcolor: "#f0fdf4", "& .MuiListItemIcon-root": { color: "#059669" }, "& .MuiListItemText-primary": { color: "#059669", fontWeight: 700 } },
                "&:hover": { bgcolor: "#f8fafc" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: selected ? "#059669" : "#64748b" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { fontSize: "0.8125rem", fontWeight: selected ? 700 : 500, color: selected ? "#059669" : "#334155" } }} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
        <Button fullWidth variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}
          sx={{ borderRadius: "8px", fontSize: "0.75rem", color: "#64748b", borderColor: "#e2e8f0" }}
        >Đăng xuất</Button>
      </Box>
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
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: isMobile ? 7 : 0, ml: { md: `${drawerWidth}px` }, maxWidth: { md: `calc(100% - ${drawerWidth}px)` } }}>
        {children}
      </Box>
    </Box>
  );
}
