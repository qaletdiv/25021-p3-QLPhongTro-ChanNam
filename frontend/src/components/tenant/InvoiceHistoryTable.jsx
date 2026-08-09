"use client";

import { Box, Typography, Chip, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { formatCurrency } from "../../utils/format";
import { tokens as t } from "../../design/tokens";

const statusLabel = { pending: "Chờ thu tiền", submitted: "Đã gửi chỉ số", paid: "Đã thanh toán" };

const MeterCell = ({ cost, oldVal, newVal, unit }) => (
  <TableCell align="right">
    <div style={{ fontWeight: 700, color: t.colors.ink, fontSize: "0.8125rem" }}>{formatCurrency(Math.round(Number(cost || 0)))}</div>
    <div className="font-mono" style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>
      {Math.round(Number(oldVal || 0))} → {Math.round(Number(newVal || 0))} ({Math.round(Number(newVal || 0)) - Math.round(Number(oldVal || 0))} {unit})
    </div>
  </TableCell>
);

const AmountCell = ({ amount }) => (
  <TableCell align="right">
    <div style={{ fontWeight: 700, color: t.colors.ink, fontSize: "0.8125rem" }}>{formatCurrency(amount)}</div>
  </TableCell>
);

export default function InvoiceHistoryTable({ invoices }) {
  return (
    <Box className="reveal">
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1, mb: 2, borderBottom: `1px solid ${t.colors.hair}` }}>
        <HistoryIcon sx={{ color: t.colors.accent, fontSize: 20 }} />
        <Typography className="font-display" sx={{ fontSize: "1.0625rem", fontWeight: 600, color: t.colors.ink }}>Lịch sử hóa đơn</Typography>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: "16px", border: `1px solid ${t.colors.hair}`, boxShadow: t.shadow.sm }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tháng</TableCell>
              <TableCell align="right">Tiền phòng</TableCell>
              <TableCell align="right">Tiền điện (kWh)</TableCell>
              <TableCell align="right">Tiền nước (m³)</TableCell>
              <TableCell align="right">Phí khác</TableCell>
              <TableCell align="right">Tổng</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell sx={{ color: t.colors.ink }}>{inv.month}</TableCell>
                <AmountCell amount={inv.roomPrice} />
                <MeterCell cost={inv.electricityCost} oldVal={inv.electricityOld} newVal={inv.electricityNew} unit="kWh" />
                <MeterCell cost={inv.waterCost} oldVal={inv.waterOld} newVal={inv.waterNew} unit="m³" />
                <AmountCell amount={inv.serviceFee + inv.otherFees} />
                <TableCell align="right" sx={{ color: t.colors.ink, fontWeight: 600 }}>{formatCurrency(inv.total)}</TableCell>
                <TableCell>
                  <Chip label={statusLabel[inv.status]}
                    size="small"
                    sx={{
                      borderRadius: t.radius.pill, fontWeight: 700,
                      bgcolor: inv.status === "paid" ? "#d1fae5" : "#fef3c7",
                      color: inv.status === "paid" ? t.colors.accent : t.colors.amber,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: t.colors.muted, py: 4 }}>Chưa có hóa đơn nào</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}