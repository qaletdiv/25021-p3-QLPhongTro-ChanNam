"use client";

import { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import MessageDialog from "../components/MessageDialog";
import TenantOverviewTab from "../components/tenant/TenantOverviewTab";
import { currentMonthLabel } from "../utils/format";
import tenantDashboardApi from "../api/tenantDashboardApi";
import tenantInvoiceApi from "../api/tenantInvoiceApi";

export default function TenantDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    Promise.all([tenantDashboardApi.getDashboard(), tenantInvoiceApi.getInvoiceSettings()])
      .then(([dashRes, setRes]) => { setData(dashRes.data); setSettings(setRes.data); })
      .catch(() => setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const contract = data?.contract;
  const room = contract?.room;
  const tenant = data?.tenant;
  const notifications = data?.notifications || [];
  const daysLeft = contract ? Math.max(0, Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
  const s = settings?.settings || {};
  const serviceFee = s.serviceFee !== undefined && s.serviceFee !== "" ? Number(s.serviceFee) || 0 : 0;
  const roomPrice = Number(settings?.roomPrice || 0) || 3200000;
  const calcTotal = roomPrice + serviceFee;

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <TenantOverviewTab
        room={room} tenant={tenant} contract={contract} daysLeft={daysLeft}
        notifications={notifications} calcTotal={calcTotal}
        monthStr={currentMonthLabel()} roomPrice={roomPrice}
      />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
