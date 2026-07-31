"use client";

import { Box, Card, CardContent, Typography, Grid, Divider } from "@mui/material";
import { formatCurrency } from "../../utils/format";

const cardSx = {
  bgcolor: "#fff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};

export default function CalculatedInvoiceCard({ calculated }) {
  if (!calculated) return null;

  return (
    <Card sx={{ ...cardSx, mb: 3, borderLeft: "4px solid #059669" }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" color="#0f172a" mb={2}>Chi tiết hóa đơn</Typography>
        <Grid container spacing={1}>
          <Grid size={6}><Typography color="#64748b">Tiền phòng: <strong style={{ color: "#0f172a" }}>{formatCurrency(calculated.roomPrice)}</strong></Typography></Grid>
          <Grid size={6}><Typography color="#64748b">Phí dịch vụ: <strong style={{ color: "#0f172a" }}>{formatCurrency(calculated.svcFee)}</strong></Typography></Grid>
          <Grid size={12}><Divider sx={{ borderColor: "#e2e8f0" }} /></Grid>
          <Grid size={6}><Typography color="#64748b">Điện: {calculated.elecOld} → {calculated.elecNew} = <strong style={{ color: "#0f172a" }}>{formatCurrency(calculated.elecCost)}</strong></Typography></Grid>
          <Grid size={6}><Typography color="#64748b">Nước: {calculated.waterOld} → {calculated.waterNew} = <strong style={{ color: "#0f172a" }}>{formatCurrency(calculated.waterCost)}</strong></Typography></Grid>
          <Grid size={12}><Divider sx={{ borderColor: "#e2e8f0" }} /></Grid>
          <Grid size={12}>
            <Typography variant="h5" sx={{ color: "#059669" }} fontWeight="bold">
              Tổng cộng: {formatCurrency(calculated.total)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
