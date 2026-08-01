"use client";

import { Box, Typography, Chip, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { formatCurrency } from "../../utils/format";

const statusLabel = { pending: "Chờ thu tiền", submitted: "Đã gửi chỉ số", paid: "Đã thanh toán" };

const MeterCell = ({ cost, oldVal, newVal, unit }) => (
  <TableCell align="right">
    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8125rem" }}>{formatCurrency(cost)}</div>
    <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontFamily: "monospace" }}>
      {oldVal || 0} → {newVal || 0} ({(newVal || 0) - (oldVal || 0)} {unit})
    </div>
  </TableCell>
);

const AmountCell = ({ amount }) => (
  <TableCell align="right">
    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8125rem" }}>{formatCurrency(amount)}</div>
  </TableCell>
);

export default function InvoiceHistoryTable({ invoices }) {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1, mb: 2, borderBottom: "1px solid #e2e8f0" }}>
        <HistoryIcon sx={{ color: "#059669", fontSize: 20 }} />
        <Typography variant="h6" fontWeight="bold" color="#0f172a">Lịch sử hóa đơn</Typography>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f1f5f9" }}>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Tháng</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#0f172a" }}>Tiền phòng</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#0f172a" }}>Tiền điện (kWh)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#0f172a" }}>Tiền nước (m³)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#0f172a" }}>Phí khác</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: "#0f172a" }}>Tổng</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell sx={{ color: "#0f172a" }}>{inv.month}</TableCell>
                <AmountCell amount={inv.roomPrice} />
                <MeterCell cost={inv.electricityCost} oldVal={inv.electricityOld} newVal={inv.electricityNew} unit="kWh" />
                <MeterCell cost={inv.waterCost} oldVal={inv.waterOld} newVal={inv.waterNew} unit="m³" />
                <AmountCell amount={inv.serviceFee + inv.otherFees} />
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
    </>
  );
}
