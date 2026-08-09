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
import { usePushSubscription } from "../hooks/usePushSubscription";
import { tokens as t } from "../design/tokens";

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

  usePushSubscription();

  const handleLogout = () => { logout(); router.push("/login/tenant"); };

  const sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: t.colors.surface }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 2.5 }}>
        <Avatar sx={{ bgcolor: t.colors.accent, width: 38, height: 38, borderRadius: "10px" }}>
          <ApartmentIcon />
        </Avatar>
        <Box>
          <Typography className="font-display" sx={{ fontWeight: 700, fontSize: "1.0625rem", lineHeight: 1.2, color: t.colors.ink }}>
            Phòng Trọ
          </Typography>
          <Typography sx={{ fontSize: "0.6rem", color: t.colors.muted, fontWeight: 500, letterSpacing: "0.02em" }}>
            Cổng thông tin người thuê
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mx: 2, borderColor: t.colors.hairSoft }} />
      <Box sx={{ mx: 2, my: 1.5, p: 1.5, textAlign: "center", bgcolor: t.colors.accentSoft, borderRadius: t.radius.md, border: `1px solid ${t.colors.accentHair}` }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: t.colors.accent }}>{user?.name}</Typography>
        <Typography sx={{ fontSize: "0.65rem", color: t.colors.accentStrong }}>{user?.email}</Typography>
        <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}
          sx={{ mt: 1.25, borderRadius: t.radius.sm, fontSize: "0.75rem", color: t.colors.accentStrong, borderColor: t.colors.accentHair, "&:hover": { borderColor: t.colors.danger, color: t.colors.danger, bgcolor: t.colors.dangerSoft } }}
        >Đăng xuất</Button>
      </Box>
      <List sx={{ px: 1, py: 0.5, flex: 1 }}>
        {menuItems.map((item) => {
          const selected = pathname === item.path;
          return (
            <ListItemButton
              key={item.path} selected={selected}
              onClick={() => { router.push(item.path); if (isMobile) setMobileOpen(false); }}
              sx={{
                borderRadius: t.radius.md, mb: 0.25, px: 1.5, py: 0.8,
                "&.Mui-selected": { bgcolor: t.colors.accentSoft, "& .MuiListItemIcon-root": { color: t.colors.accent }, "& .MuiListItemText-primary": { color: t.colors.accent, fontWeight: 700 }, borderLeft: `3px solid ${t.colors.accent}` },
                "&:hover": { bgcolor: t.colors.surface2 },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: selected ? t.colors.accent : t.colors.muted }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { fontSize: "0.8125rem", fontWeight: selected ? 700 : 500, color: selected ? t.colors.accent : t.colors.ink } }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      {isMobile && (
        <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ position: "fixed", top: 12, left: 12, zIndex: 1200, bgcolor: t.colors.surface, boxShadow: t.shadow.md }}>
          <MenuIcon />
        </IconButton>
      )}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{ "& .MuiDrawer-paper": { width: drawerWidth, borderRight: `1px solid ${t.colors.hair}`, bgcolor: t.colors.surface } }}
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
