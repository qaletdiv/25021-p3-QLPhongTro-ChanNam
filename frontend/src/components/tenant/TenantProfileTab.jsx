"use client";

import { Box, Typography, TextField, Paper, Button } from "@mui/material";

export default function TenantProfileTab({
  profileName, setProfileName, profileEmail, setProfileEmail, profilePhone, setProfilePhone,
  oldPw, setOldPw, newPw, setNewPw, confirmPw, setConfirmPw,
  profileSaveMsg, profileSaving,
  handleSaveProfile,
}) {
  return (
    <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", maxWidth: 600, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <Typography sx={{ fontSize: "1rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.025em" }}>
          Hồ Sơ Cá Nhân & Đổi Mật Khẩu
        </Typography>
      </Box>

      {profileSaveMsg && (
        <Box sx={{ p: 2, bgcolor: "#ecfdf5", color: "#065f46", fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px", border: "1px solid #a7f3d0", mb: 2 }}>
          {profileSaveMsg}
        </Box>
      )}

      <Box component="form" onSubmit={handleSaveProfile} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Họ và Tên *</Typography>
            <TextField fullWidth size="small" value={profileName} required
              onChange={(e) => setProfileName(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "10px" } }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số Điện Thoại *</Typography>
            <TextField fullWidth size="small" value={profilePhone} required
              onChange={(e) => setProfilePhone(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "10px" } }} />
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Email</Typography>
          <TextField fullWidth size="small" type="email" value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "10px" } }} />
        </Box>

        <Box sx={{ borderTop: "1px solid #f1f5f9", pt: 2.5 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Thay Đổi Mật Khẩu
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1.5 }}>
            <TextField fullWidth size="small" type="password" label="Mật Khẩu Cũ" value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "10px" } }} />
            <TextField fullWidth size="small" type="password" label="Mật Khẩu Mới" value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "10px" } }} />
            <TextField fullWidth size="small" type="password" label="Xác Nhận Mật Khẩu" value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "10px" } }} />
          </Box>
        </Box>

        <Box sx={{ textAlign: "right", pt: 1 }}>
          <Button onClick={handleSaveProfile} variant="contained"
            sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, borderRadius: "10px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {profileSaving ? "Đang lưu..." : "Lưu Thay Đổi Hồ Sơ"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
