"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Paper, Grid, CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import MessageDialog from "../components/MessageDialog";
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
// Give the password fields a proper medium height + balanced padding so text
// sits vertically centered instead of being pinned to the bottom border.
const passwordFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    minHeight: "48px",
  },
  "& .MuiOutlinedInput-input": {
    padding: "12px 14px",
    lineHeight: 1.5,
    fontSize: "0.9375rem",
    height: "24px",
  },
};

export default function TenantProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", cccd: "", telegramChatId: "" });
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

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

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#0f172a">Hồ sơ cá nhân</Typography>
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
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          </Grid>
          <Grid size={6}>
            <TextField fullWidth label="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          </Grid>
          <Grid size={6}>
            <TextField fullWidth label="Số điện thoại" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          </Grid>
          <Grid size={6}>
            <TextField fullWidth label="CCCD" value={profile.cccd || ""} onChange={(e) => setProfile({ ...profile, cccd: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          </Grid>
          <Grid size={12}>
            <TextField fullWidth label="Telegram Chat ID (để nhận thông báo từ chủ trọ)" placeholder="Ví dụ: 123456789" value={profile.telegramChatId || ""}
              onChange={(e) => setProfile({ ...profile, telegramChatId: e.target.value })}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
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
          <LockIcon sx={{ color: "#059669", fontSize: 20 }} />
          <Typography variant="h6" fontWeight="bold" color="#0f172a">Đổi mật khẩu</Typography>
        </Box>
         <Grid container spacing={2}>
          <Grid size={4}>
            <TextField fullWidth label="Mật khẩu cũ" type="password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
              sx={passwordFieldSx} />
          </Grid>
          <Grid size={4}>
            <TextField fullWidth label="Mật khẩu mới" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              sx={passwordFieldSx} />
          </Grid>
          <Grid size={4}>
            <TextField fullWidth label="Xác nhận mật khẩu" type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              sx={passwordFieldSx} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button variant="contained" onClick={handleChangePassword} disabled={saving}
            sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#065f46" }, borderRadius: "12px", textTransform: "none" }}>
            Đổi mật khẩu
          </Button>
        </Box>
      </Paper>

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
