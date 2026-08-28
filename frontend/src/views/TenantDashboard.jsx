"use client";

import { useState, useEffect } from "react";
import { Box, Badge, IconButton, Menu, MenuItem, Divider, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MessageDialog from "../components/MessageDialog";
import TenantOverviewTab from "../components/tenant/TenantOverviewTab";
import { currentMonthLabel } from "../utils/format";
import tenantNotificationApi from "../api/tenantNotificationApi";

export default function TenantDashboard({ data, settings, notifInit }) {
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [notifCount, setNotifCount] = useState(notifInit?.unreadCount || 0);
  const [notifItems, setNotifItems] = useState(notifInit?.items || []);
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const loadNotifs = () => {
      tenantNotificationApi.getNotifications()
        .then((res) => {
          if (!active) return;
          setNotifCount(res.data.unreadCount || 0);
          setNotifItems(res.data.items || []);
        })
        .catch(() => {});
    };
    const timer = setInterval(loadNotifs, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const openBell = (e) => setAnchorEl(e.currentTarget);

  const handleNotifClick = async (item) => {
    setAnchorEl(null);
    if (!item.read) {
      tenantNotificationApi.markRead([{ kind: item.kind, targetId: item.targetId }]).catch(() => {});
      setNotifItems((prev) => prev.map((i) => i.targetId === item.targetId && i.kind === item.kind ? { ...i, read: true } : i));
      setNotifCount((c) => Math.max(0, c - 1));
    }
    router.push(item.link);
  };

  const handleMarkAllRead = async () => {
    const unread = notifItems.filter((i) => !i.read);
    if (unread.length === 0) return;
    tenantNotificationApi.markRead(unread.map((i) => ({ kind: i.kind, targetId: i.targetId }))).catch(() => {});
    setNotifItems((prev) => prev.map((i) => ({ ...i, read: true })));
    setNotifCount(0);
  };

  const contract = data?.contract;
  const hasContract = !!contract;
  const room = contract?.room;
  const tenant = data?.tenant;
  const notifications = data?.notifications || [];
  const daysLeft = contract ? Math.max(0, Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
  const s = settings?.settings || {};
  const serviceFee = s.serviceFee !== undefined && s.serviceFee !== "" ? Number(s.serviceFee) || 0 : 0;
  // No fake default price when there is no active contract/room.
  const roomPrice = settings ? Number(settings.roomPrice || 0) : 0;
  const latestInvoice = contract?.invoices?.[0] || null;
  const calcTotal = latestInvoice ? Number(latestInvoice.total) || 0 : (hasContract ? roomPrice + serviceFee : 0);

  const kindIcon = (kind) => kind === "invoice"
    ? <ReceiptIcon sx={{ fontSize: 18, color: "#2563eb" }} />
    : <CheckCircleIcon sx={{ fontSize: 18, color: "#059669" }} />;

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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.25, borderBottom: "1px solid #f1f5f9" }}>
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8125rem" }}>Thông báo chưa đọc ({notifCount})</Typography>
            {notifItems.some((i) => !i.read) && (
              <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "none", color: "#2563eb" }}>
                Đánh dấu đã đọc
              </Button>
            )}
          </Box>
          {notifItems.length === 0 && (
            <Box sx={{ px: 2, py: 3, textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>
              Không có thông báo nào.
            </Box>
          )}
          {notifItems.map((item, idx) => (
            <Box key={`${item.kind}-${item.targetId}`}>
              {idx > 0 && <Divider />}
              <MenuItem onClick={() => handleNotifClick(item)} sx={{ py: 1.25, alignItems: "flex-start", gap: 1.25, whiteSpace: "normal", bgcolor: item.read ? "inherit" : "#eff6ff" }}>
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

      <TenantOverviewTab
        room={room} tenant={tenant} contract={contract} daysLeft={daysLeft}
        notifications={notifications} calcTotal={calcTotal}
        monthStr={latestInvoice?.month || currentMonthLabel()}
        latestInvoice={latestInvoice}
        landlordAddress={room?.building?.address || ""}
        roomPrice={roomPrice}
        hasContract={hasContract}
        companions={data?.companions || []}
      />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
