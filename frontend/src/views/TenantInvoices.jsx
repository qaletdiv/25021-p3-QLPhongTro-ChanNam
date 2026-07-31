"use client";

import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import MessageDialog from "../components/MessageDialog";
import MeterInputCard from "../components/tenant/MeterInputCard";
import CalculatedInvoiceCard from "../components/tenant/CalculatedInvoiceCard";
import InvoiceHistoryTable from "../components/tenant/InvoiceHistoryTable";
import tenantInvoiceApi from "../api/tenantInvoiceApi";

export default function TenantInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [electricityNew, setElectricityNew] = useState("");
  const [waterNew, setWaterNew] = useState("");
  const [calculated, setCalculated] = useState(null);

  useEffect(() => {
    Promise.all([
      tenantInvoiceApi.getInvoices(),
      tenantInvoiceApi.getInvoiceSettings(),
    ])
      .then(([invRes, setRes]) => {
        setInvoices(invRes.data.invoices);
        setSettings(setRes.data);
        if (invRes.data.invoices.length > 0) {
          const last = invRes.data.invoices[0];
          setElectricityNew(last.electricityNew || "");
          setWaterNew(last.waterNew || "");
        }
      })
      .catch(() => setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const calculate = () => {
    const rateElec = Number(settings?.electricityRate || 0);
    const rateWater = Number(settings?.waterRate || 0);
    const svcFee = Number(settings?.serviceFee || 0);
    const roomPrice = Number(settings?.roomPrice || 0);

    const lastInv = invoices.length > 0 ? invoices[0] : null;
    const elecOld = lastInv ? Number(lastInv.electricityNew) : 0;
    const waterOld = lastInv ? Number(lastInv.waterNew) : 0;
    const elecNew = Number(electricityNew);
    const waterNewVal = Number(waterNew);

    if (!elecNew || !waterNewVal) {
      setSnack({ open: true, message: "Vui lòng nhập chỉ số mới", severity: "warning" });
      return;
    }
    if (elecNew < elecOld || waterNewVal < waterOld) {
      setSnack({ open: true, message: "Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ", severity: "error" });
      return;
    }

    const elecCost = (elecNew - elecOld) * rateElec;
    const waterCost = (waterNewVal - waterOld) * rateWater;
    const total = roomPrice + elecCost + waterCost + svcFee;

    setCalculated({
      roomPrice, elecOld, elecNew, elecCost, waterOld, waterNew: waterNewVal, waterCost, svcFee, total,
    });
  };

  if (loading) return <CircularProgress />;

  const lastInv = invoices.length > 0 ? invoices[0] : null;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#0f172a">Hóa đơn của tôi</Typography>
        <Typography variant="body2" color="#64748b" mt={0.5}>Quản lý chỉ số điện nước và theo dõi hóa đơn hàng tháng</Typography>
      </Box>

      <MeterInputCard
        electricityNew={electricityNew} setElectricityNew={setElectricityNew}
        waterNew={waterNew} setWaterNew={setWaterNew}
        lastInv={lastInv} onCalculate={calculate}
      />

      <CalculatedInvoiceCard calculated={calculated} />

      <InvoiceHistoryTable invoices={invoices} />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
