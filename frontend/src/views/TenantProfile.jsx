"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Paper, Grid, CircularProgress, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import MessageDialog from "../components/MessageDialog";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import tenantProfileApi from "../api/tenantProfileApi";

const cardSx = {
  bgcolor: "#fff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  p: 3,
  mb: 3,
};

// MUI v9 outlines a short input (height 1.4375em ~ 23px, padding 4px 0) which
// pushes the floating label/placeholder to the bottom of an empty field.
// Global theming (src/theme.js -> MuiOutlinedInput) sets a proper medium height
// + balanced padding so all inputs are vertically centered.
const inputFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
};

export default function TenantProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", cccd: "", telegramChatId: "", companions: [] });
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);

  useEffect(() => {
    tenantProfileApi.getProfile()
      .then((res) => setProfile(res.data.profile))
      .catch(() => setSnack({ open: true, message: "Lỗi tải thông tin", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      await tenantProfileApi.updateProfile(profile);
      setSnack({ open: true, message: "Cập nhật thông tin thành công", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi cập nhật", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setSnack({ open: true, message: "Mật khẩu mới không khớp", severity: "error" });
      return;
    }
    try {
      setSaving(true);
      await tenantProfileApi.changePassword({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword });
      setSnack({ open: true, message: "Đổi mật khẩu thành công", severity: "success" });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi đổi mật khẩu", severity: "error" });
    } finally {
      setSaving(false);
    }
  };
   const addCompanion = () => {
    const companions = profile.companions || [];
    setProfile({ ...profile, companions: [...companions, { name: "", phone: "", cccd: "", relationship: "", telegramChatId: "" }] });
  };
  const removeCompanion = (i) => {
    const companions = profile.companions || [];
    setProfile({ ...profile, companions: companions.filter((_, idx) => idx !== i) });
    setConfirmDeleteIndex(null);
  };
  const updateCompanion = (i, field, value) => {
    const companions = profile.companions ? [...profile.companions] : [];
    companions[i] = { ...companions[i], [field]: value };
    setProfile({ ...profile, companions });
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="#0f172a" sx={{ lineHeight: 1.4 }}>Hồ sơ cá nhân</Typography>
        <Typography variant="body2" color="#64748b" mt={0.5}>Quản lý thông tin cá nhân và thay đổi mật khẩu</Typography>
      </Box>

      <Paper sx={cardSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1, mb: 2, borderBottom: "1px solid #e2e8f0" }}>
          <PersonIcon sx={{ color: "#059669", fontSize: 20 }} />
          <Typography variant="h6" fontWeight="bold" color="#0f172a">Thông tin cá nhân</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField fullWidth label="Họ tên" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              sx={inputFieldSx} />
          </Grid>
          <Grid size={6}>
            <TextField fullWidth label="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              sx={inputFieldSx} />
          </Grid>
          <Grid size={6}>
            <TextField fullWidth label="Số điện thoại" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              sx={inputFieldSx} />
          </Grid>
          <Grid size={6}>
            <TextField fullWidth label="CCCD" value={profile.cccd || ""} onChange={(e) => setProfile({ ...profile, cccd: e.target.value })}
              sx={inputFieldSx} />
          </Grid>
          <Grid size={12}>
            <TextField fullWidth label="Telegram Chat ID (để nhận thông báo từ chủ trọ)" placeholder="Ví dụ: 123456789" value={profile.telegramChatId || ""}
              onChange={(e) => setProfile({ ...profile, telegramChatId: e.target.value })}
              sx={inputFieldSx} />
            <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8", mt: 0.5 }}>
              Gửi tin nhắn /start tới bot của chủ trọ trên Telegram, sau đó lấy Chat ID từ tin nhắn hoặc dùng @userinfobot để tra cứu.
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button variant="contained" onClick={handleUpdateProfile} disabled={saving}
            sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#065f46" }, borderRadius: "12px", textTransform: "none" }}>
            Lưu thay đổi
          </Button>
        </Box>
      </Paper>

      <Paper sx={cardSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1, mb: 2, borderBottom: "1px solid #e2e8f0" }}>
          <PersonIcon sx={{ color: "#059669", fontSize: 20 }} />
          <Typography variant="h6" fontWeight="bold" color="#0f172a">Người đi kèm</Typography>
        </Box>
        <TableContainer>
          <Table size="small" sx={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", borderBottom: "1px solid #e2e8f0", width: 44 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>Họ tên</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>CCCD</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>Quan hệ</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>Telegram</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", borderBottom: "1px solid #e2e8f0" }}>Vân tay</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", borderBottom: "1px solid #e2e8f0" }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(profile.companions || []).map((c, i) => (
                <TableRow key={i} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", p: 1, color: "#64748b" }}>{i + 1}</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", p: 1 }}>
                    <TextField size="small" fullWidth value={c.name || ""} required
                      onChange={(e) => updateCompanion(i, "name", e.target.value)} sx={inputFieldSx} />
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", p: 1 }}>
                    <TextField size="small" fullWidth value={c.phone || ""}
                      onChange={(e) => updateCompanion(i, "phone", e.target.value)} sx={inputFieldSx} />
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", p: 1 }}>
                    <TextField size="small" fullWidth value={c.cccd || ""}
                      onChange={(e) => updateCompanion(i, "cccd", e.target.value)} sx={inputFieldSx} />
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", p: 1 }}>
                    <TextField size="small" fullWidth value={c.relationship || ""}
                      onChange={(e) => updateCompanion(i, "relationship", e.target.value)} sx={inputFieldSx} />
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", p: 1 }}>
                    <TextField size="small" fullWidth value={c.telegramChatId || ""} placeholder="Chat ID"
                      onChange={(e) => updateCompanion(i, "telegramChatId", e.target.value)} sx={inputFieldSx} />
                  </TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #f1f5f9", p: 1, color: c.fingerprintCode ? "#475569" : "#cbd5e1", fontSize: "0.8125rem" }}>
                    {c.fingerprintCode || "—"}
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", p: 1 }}>
                    <IconButton size="small" color="error" onClick={() => setConfirmDeleteIndex(i)} aria-label="Xoá người đi kèm">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(profile.companions || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: "#94a3b8", fontSize: "0.8125rem", border: 0 }}>
                    Chưa có người đi kèm
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 1 }}>
          <Button startIcon={<AddIcon />} size="small" onClick={addCompanion}
            sx={{ textTransform: "none", color: "#059669" }}>
            Thêm người đi kèm
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button variant="contained" onClick={handleUpdateProfile} disabled={saving}
            sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#065f46" }, borderRadius: "12px", textTransform: "none" }}>
            Lưu thay đổi
          </Button>
        </Box>
      </Paper>

      <Paper sx={cardSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1, mb: 2, borderBottom: "1px solid #e2e8f0" }}>
          <LockIcon sx={{ color: "#059669", fontSize: 20 }} />
          <Typography variant="h6" fontWeight="bold" color="#0f172a">Đổi mật khẩu</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={4}>
            <TextField fullWidth label="Mật khẩu cũ" type="password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
              sx={inputFieldSx} />
          </Grid>
          <Grid size={4}>
            <TextField fullWidth label="Mật khẩu mới" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              sx={inputFieldSx} />
          </Grid>
          <Grid size={4}>
            <TextField fullWidth label="Xác nhận mật khẩu" type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              sx={inputFieldSx} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button variant="contained" onClick={handleChangePassword} disabled={saving}
            sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#065f46" }, borderRadius: "12px", textTransform: "none" }}>
            Đổi mật khẩu
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmDeleteIndex !== null}
        title="Xóa người đi kèm"
        message={confirmDeleteIndex !== null && profile.companions?.[confirmDeleteIndex]?.name ? `Bạn có chắc muốn xóa "${profile.companions[confirmDeleteIndex].name}" khỏi danh sách người đi kèm không?` : "Bạn có chắc muốn xóa người đi kèm này không?"}
        confirmText="Xóa"
        onClose={() => setConfirmDeleteIndex(null)}
        onConfirm={() => removeCompanion(confirmDeleteIndex)}
      />
      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
