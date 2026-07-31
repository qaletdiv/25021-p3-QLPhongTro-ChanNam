"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Card, CardContent, Grid, TextField, Button, Chip, TableContainer, Paper,
  Snackbar, Alert, CircularProgress, Divider,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HistoryIcon from "@mui/icons-material/History";
import CalculateIcon from "@mui/icons-material/Calculate";
import tenantInvoiceApi from "../api/tenantInvoiceApi";

const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
const statusLabel = { pending: "Đã gửi chỉ số", paid: "Đã thanh toán" };

const cardSx = {
  bgcolor: "#fff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};

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
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" color="#0f172a">Hóa đơn của tôi</Typography>
        <Typography variant="body2" color="#64748b" mt={0.5}>Quản lý chỉ số điện nước và theo dõi hóa đơn hàng tháng</Typography>
      </Box>

      <Card sx={cardSx}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} pb={1} mb={2} sx={{ borderBottom: "1px solid #e2e8f0" }}>
            <CalculateIcon sx={{ color: "#059669", fontSize: 20 }} />
            <Typography variant="h6" fontWeight="bold" color="#0f172a">Nhập chỉ số</Typography>
          </Box>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={5}>
              <TextField fullWidth label="Chỉ số điện mới" type="number" value={electricityNew}
                onChange={(e) => setElectricityNew(e.target.value)}
                helperText={lastInv ? `Chỉ số cũ: ${lastInv.electricityNew}` : "Chỉ số cũ: 0"}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Grid>
            <Grid item xs={5}>
              <TextField fullWidth label="Chỉ số nước mới" type="number" value={waterNew}
                onChange={(e) => setWaterNew(e.target.value)}
                helperText={lastInv ? `Chỉ số cũ: ${lastInv.waterNew}` : "Chỉ số cũ: 0"}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Grid>
            <Grid item xs={2}>
              <Button variant="contained" fullWidth onClick={calculate}
                sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#065f46" }, borderRadius: "12px", textTransform: "none" }}>
                Tính ngay
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {calculated && (
        <Card sx={{ ...cardSx, mb: 3, borderLeft: "4px solid #059669" }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" color="#0f172a" mb={2}>Chi tiết hóa đơn</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}><Typography color="#64748b">Tiền phòng: <strong style={{ color: "#0f172a" }}>{formatCurrency(calculated.roomPrice)}</strong></Typography></Grid>
              <Grid item xs={6}><Typography color="#64748b">Phí dịch vụ: <strong style={{ color: "#0f172a" }}>{formatCurrency(calculated.svcFee)}</strong></Typography></Grid>
              <Grid item xs={12}><Divider sx={{ borderColor: "#e2e8f0" }} /></Grid>
              <Grid item xs={6}><Typography color="#64748b">Điện: {calculated.elecOld} → {calculated.elecNew} = <strong style={{ color: "#0f172a" }}>{formatCurrency(calculated.elecCost)}</strong></Typography></Grid>
              <Grid item xs={6}><Typography color="#64748b">Nước: {calculated.waterOld} → {calculated.waterNew} = <strong style={{ color: "#0f172a" }}>{formatCurrency(calculated.waterCost)}</strong></Typography></Grid>
              <Grid item xs={12}><Divider sx={{ borderColor: "#e2e8f0" }} /></Grid>
              <Grid item xs={12}>
                <Typography variant="h5" sx={{ color: "#059669" }} fontWeight="bold">
                  Tổng cộng: {formatCurrency(calculated.total)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Box display="flex" alignItems="center" gap={1} pb={1} mb={2} sx={{ borderBottom: "1px solid #e2e8f0" }}>
        <HistoryIcon sx={{ color: "#059669", fontSize: 20 }} />
        <Typography variant="h6" fontWeight="bold" color="#0f172a">Lịch sử hóa đơn</Typography>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f1f5f9" }}>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Tháng</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#0f172a" }}>Tiền phòng</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#0f172a" }}>Tiền điện</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#0f172a" }}>Tiền nước</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#0f172a" }}>Phí khác</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#0f172a" }}>Tổng</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell sx={{ color: "#0f172a" }}>{inv.month}</TableCell>
                <TableCell align="right" sx={{ color: "#64748b" }}>{formatCurrency(inv.roomPrice)}</TableCell>
                <TableCell align="right" sx={{ color: "#64748b" }}>{formatCurrency(inv.electricityCost)}</TableCell>
                <TableCell align="right" sx={{ color: "#64748b" }}>{formatCurrency(inv.waterCost)}</TableCell>
                <TableCell align="right" sx={{ color: "#64748b" }}>{formatCurrency(inv.serviceFee + inv.otherFees)}</TableCell>
                <TableCell align="right" sx={{ color: "#0f172a", fontWeight: 600 }}>{formatCurrency(inv.total)}</TableCell>
                <TableCell>
                  <Chip label={statusLabel[inv.status]}
                    size="small"
                    sx={{
                      borderRadius: "12px", fontWeight: 600,
                      bgcolor: inv.status === "paid" ? "#d1fae5" : "#fef3c7",
                      color: inv.status === "paid" ? "#065f46" : "#d97706",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: "#64748b" }}>Chưa có hóa đơn nào</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: "12px" }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
