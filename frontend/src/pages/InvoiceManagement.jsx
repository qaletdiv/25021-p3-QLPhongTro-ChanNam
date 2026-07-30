import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, MenuItem, Chip, TableContainer, Paper, Snackbar, Alert,
} from "@mui/material";
import { Receipt } from "@mui/icons-material";
import invoiceApi from "../api/invoiceApi";

const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
const statusLabel = { pending: "Đã gửi chỉ số", paid: "Đã thanh toán" };

const chipSx = {
  pending: { bgcolor: "#fef3c7", color: "#92400e" },
  paid: { bgcolor: "#d1fae5", color: "#065f46" },
};

const cardSx = {
  bgcolor: "white",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchInvoices = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterMonth) params.month = filterMonth;
      const res = await invoiceApi.getAll(params);
      setInvoices(res.data.invoices);
    } catch {
      setSnack({ open: true, message: "Lỗi tải danh sách hóa đơn", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterMonth]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleMarkAsPaid = async (id) => {
    try {
      await invoiceApi.markAsPaid(id);
      setSnack({ open: true, message: "Xác nhận thanh toán thành công", severity: "success" });
      fetchInvoices();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    }
  };

  const handleSendReminder = async (id) => {
    try {
      const res = await invoiceApi.sendReminder(id);
      setSnack({ open: true, message: res.data.message, severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    }
  };

  const getMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      months.push(`${y}-${m}`);
    }
    return months;
  };

  return (
    <Box>
      <Paper sx={{ ...cardSx, p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Quản lý hóa đơn</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Quản lý và theo dõi trạng thái thanh toán hóa đơn
        </Typography>
      </Paper>

      <Paper sx={{ ...cardSx, overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 1 }}>
          <Receipt sx={{ fontSize: 20, color: "text.secondary" }} />
          <Typography fontWeight="bold" fontSize={15}>Danh sách hóa đơn</Typography>
        </Box>

        <Box sx={{ p: 3, display: "flex", gap: 2 }}>
          <TextField
            select size="small" label="Trạng thái" value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="pending">Đã gửi chỉ số</MenuItem>
            <MenuItem value="paid">Đã thanh toán</MenuItem>
          </TextField>
          <TextField
            select size="small" label="Tháng" value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {getMonths().map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
        </Box>

        {loading ? null : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Phòng</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Khách</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tháng</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Tiền phòng</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Tiền điện</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Tiền nước</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Phí khác</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Tổng cộng</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.contract?.room?.room_number || "-"}</TableCell>
                    <TableCell>{inv.contract?.tenant?.name || "-"}</TableCell>
                    <TableCell>{inv.month}</TableCell>
                    <TableCell align="right">{formatCurrency(inv.roomPrice)}</TableCell>
                    <TableCell align="right">{formatCurrency(inv.electricityCost)}</TableCell>
                    <TableCell align="right">{formatCurrency(inv.waterCost)}</TableCell>
                    <TableCell align="right">{formatCurrency(inv.serviceFee + inv.otherFees)}</TableCell>
                    <TableCell align="right"><strong>{formatCurrency(inv.total)}</strong></TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabel[inv.status]}
                        size="small"
                        sx={{
                          ...(chipSx[inv.status] || { bgcolor: "#ffe4e6", color: "#9f1239" }),
                          fontWeight: 500,
                          borderRadius: "8px",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {inv.status === "pending" && (
                        <Box display="flex" gap={1} justifyContent="center">
                          <Button
                            size="small" variant="contained"
                            sx={{ bgcolor: "#2563eb", borderRadius: "12px", "&:hover": { bgcolor: "#1d4ed8" } }}
                            onClick={() => handleMarkAsPaid(inv.id)}
                          >
                            Xác nhận đã nhận tiền
                          </Button>
                          <Button
                            size="small" variant="outlined"
                            sx={{ borderColor: "#2563eb", color: "#2563eb", borderRadius: "12px", "&:hover": { borderColor: "#1d4ed8", bgcolor: "rgba(37,99,235,0.04)" } }}
                            onClick={() => handleSendReminder(inv.id)}
                          >
                            Gửi nhắc nợ
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">Chưa có hóa đơn nào</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
