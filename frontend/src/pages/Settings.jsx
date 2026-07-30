import { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Snackbar, Alert, Paper, Grid, Divider,
} from "@mui/material";
import settingApi from "../api/settingApi";

export default function Settings() {
  const [form, setForm] = useState({});
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    settingApi.getAll().then((res) => setForm(res.data.settings || {})).catch(() => {});
  }, []);

  const set = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    try {
      await settingApi.save(form);
      setSnack({ open: true, message: "Lưu cài đặt thành công", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Lỗi lưu cài đặt", severity: "error" });
    }
  };

  const handleCheckZalo = async () => {
    try {
      const res = await settingApi.checkZalo();
      setSnack({ open: true, message: res.data.message, severity: "success" });
    } catch {
      setSnack({ open: true, message: "Kết nối Zalo thất bại", severity: "error" });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h4">Cài đặt chung</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>Cấu hình đơn giá, ngân hàng, Zalo OA và thông tin chủ trọ.</Typography>
      </Box>

      {/* Đơn giá */}
      <Paper sx={{ p: 3, borderRadius: "16px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, pb: 1.5, borderBottom: "1px solid #f1f5f9" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>Đơn giá</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Điện (VND/kWh)" type="number" value={form.electricityRate || ""} onChange={(e) => set("electricityRate", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Nước (VND/m³)" type="number" value={form.waterRate || ""} onChange={(e) => set("waterRate", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Phí dịch vụ (VND/tháng)" type="number" value={form.serviceFee || ""} onChange={(e) => set("serviceFee", e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      {/* Thông tin ngân hàng */}
      <Paper sx={{ p: 3, borderRadius: "16px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, pb: 1.5, borderBottom: "1px solid #f1f5f9" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>Thông tin ngân hàng</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Tên ngân hàng" value={form.bankName || ""} onChange={(e) => set("bankName", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Số tài khoản" value={form.bankAccount || ""} onChange={(e) => set("bankAccount", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Chủ tài khoản" value={form.bankHolder || ""} onChange={(e) => set("bankHolder", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Chi nhánh" value={form.bankBranch || ""} onChange={(e) => set("bankBranch", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Nội dung chuyển khoản mẫu" value={form.transferContent || ""} onChange={(e) => set("transferContent", e.target.value)} helperText="Sử dụng biến: {{MAPHONG}}, {{TENKHACH}}, {{THANG}}" />
          </Grid>
        </Grid>
      </Paper>

      {/* Cấu hình Zalo OA */}
      <Paper sx={{ p: 3, borderRadius: "16px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, pb: 1.5, borderBottom: "1px solid #f1f5f9" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>Cấu hình Zalo OA</Typography>
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField fullWidth label="OA ID" value={form.zaloOaId || ""} onChange={(e) => set("zaloOaId", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField fullWidth label="Access Token" value={form.zaloAccessToken || ""} onChange={(e) => set("zaloAccessToken", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="outlined" onClick={handleCheckZalo} sx={{ width: "100%" }}>Kiểm tra kết nối</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Cài đặt hệ thống */}
      <Paper sx={{ p: 3, borderRadius: "16px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, pb: 1.5, borderBottom: "1px solid #f1f5f9" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>Cài đặt hệ thống</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Ngày chốt hóa đơn" type="number" value={form.invoiceClosingDay || ""} onChange={(e) => set("invoiceClosingDay", e.target.value)} inputProps={{ min: 1, max: 31 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Ngày gửi nhắc tự động" type="number" value={form.defaultRemindDay || ""} onChange={(e) => set("defaultRemindDay", e.target.value)} inputProps={{ min: 1, max: 31 }} />
          </Grid>
        </Grid>
      </Paper>

      {/* Thông tin chủ trọ */}
      <Paper sx={{ p: 3, borderRadius: "16px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, pb: 1.5, borderBottom: "1px solid #f1f5f9" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>Thông tin chủ trọ</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Tên" value={form.landlordName || ""} onChange={(e) => set("landlordName", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="SĐT" value={form.landlordPhone || ""} onChange={(e) => set("landlordPhone", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Email" value={form.landlordEmail || ""} onChange={(e) => set("landlordEmail", e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Địa chỉ" value={form.landlordAddress || ""} onChange={(e) => set("landlordAddress", e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" size="large" onClick={handleSave} sx={{ px: 4 }}>Lưu cài đặt</Button>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
