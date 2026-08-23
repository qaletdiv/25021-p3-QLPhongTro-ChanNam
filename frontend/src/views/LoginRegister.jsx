"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { loginSchema, registerSchema } from "../utils/authValidation";
import {
  Box, Paper, Tabs, Tab, TextField, Button, Typography, Alert, CircularProgress, IconButton, Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";

const roleConfig = {
  landlord: { label: "Chủ trọ", icon: "🏠" },
  tenant: { label: "Người thuê", icon: "👤" },
};

export default function LoginRegister() {
  const { role } = useParams();
  const { login, register, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const config = roleConfig[role] || roleConfig.tenant;

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", cccd: "", password: "", confirmPassword: "" });
  const [companions, setCompanions] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const validation = loginSchema.safeParse(loginForm);
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setLoading(false);
        return;
      }
      const user = await login(loginForm);
      if (user.role !== role) {
        setError(`Tài khoản này không phải là ${config.label.toLowerCase()}`);
        return;
      }
      router.push(user.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard");
    } catch (err) {
      const data = err.response?.data;
      if (data?.error) setError(data.error.map(e => e.msg).join("; "));
      else setError(data?.message || "Đăng nhập thất bại");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(""); setSuccessMsg("");
    try {
      const validation = registerSchema.safeParse(regForm);
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setLoading(false);
        return;
      }
      if (regForm.password !== regForm.confirmPassword) { setError("Mật khẩu xác nhận không khớp"); return; }
      setLoading(true);
      try {
        const payload = { ...regForm, role, companions: companions.filter(c => c.name.trim()) };
        await register(payload);
        await logout();
        setRegForm({ name: "", email: "", phone: "", cccd: "", password: "", confirmPassword: "" });
        setCompanions([]);
        setLoginForm({ email: payload.email, password: "" });
        setSuccessMsg("Đăng ký thành công! Bạn chưa có phòng, vui lòng liên hệ chủ trọ để đăng ký. Bây giờ bạn có thể đăng nhập bằng email trên.");
        setTab(0);
      } catch (err) {
        const data = err.response?.data;
        if (data?.error) setError(data.error.map(e => e.msg).join("; "));
        else setError(data?.message || "Đăng ký thất bại");
      } finally { setLoading(false); }
    } catch (err) {
      const data = err.response?.data;
      if (data?.error) setError(data.error.map(e => e.msg).join("; "));
      else setError(data?.message || "Đăng ký thất bại");
    } finally { setLoading(false); }
  };

  const addCompanion = () => setCompanions([...companions, { name: "", phone: "", cccd: "", relationship: "", telegramChatId: "" }]);
  const removeCompanion = (i) => setCompanions(companions.filter((_, idx) => idx !== i));
  const updateCompanion = (i, field, value) => {
    const updated = [...companions];
    updated[i][field] = value;
    setCompanions(updated);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f1f5f9", p: 2 }}>
      <Paper sx={{ width: 440, p: 0, borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}>
        {/* Header */}
        <Box sx={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e3a8a 100%)", p: 4, textAlign: "center" }}>
          <Avatar sx={{ mx: "auto", mb: 1.5, bgcolor: "#2563eb", width: 52, height: 52, borderRadius: "14px" }}>
            <HomeIcon />
          </Avatar>
          <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#fff" }}>
            SmartRent Manager
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#93c5fd", mt: 0.5 }}>
            {config.icon} {config.label}
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(""); setSuccessMsg(""); }} variant="fullWidth" sx={{ mt: 0 }}>
          <Tab label="Đăng nhập" />
          {role === "tenant" && <Tab label="Đăng ký" />}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12x" }}>{error}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: "12x" }}>{successMsg}</Alert>}

          {tab === 0 && (
            <Box component="form" onSubmit={handleLogin}>
              <TextField fullWidth label="Email" margin="normal" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
              <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
              <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 2, py: 1.5, fontSize: "0.8125rem" }}>
                {loading ? <CircularProgress size={22} /> : "Đăng nhập"}
              </Button>
            </Box>
          )}

          {tab === 1 && (
            <Box component="form" onSubmit={handleRegister}>
              <TextField fullWidth label="Họ tên" margin="normal" value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} required />
              <TextField fullWidth label="Email" type="email" margin="normal" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required />
              <TextField fullWidth label="Số điện thoại" margin="normal" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} required />
              <TextField fullWidth label="CCCD" margin="normal" value={regForm.cccd} onChange={(e) => setRegForm({ ...regForm, cccd: e.target.value })} />
              <TextField fullWidth label="Mật khẩu" type="password" margin="normal" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required />
              <TextField fullWidth label="Xác nhận mật khẩu" type="password" margin="normal" value={regForm.confirmPassword} onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })} required />

              <Box sx={{ mt: 2, mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle2">Người đi kèm</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addCompanion} sx={{ fontSize: "0.75rem" }}>Thêm</Button>
              </Box>
              {companions.map((c, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                  <TextField size="small" label="Họ tên" value={c.name} onChange={(e) => updateCompanion(i, "name", e.target.value)} sx={{ flex: 2 }} />
                  <TextField size="small" label="SĐT" value={c.phone} onChange={(e) => updateCompanion(i, "phone", e.target.value)} sx={{ flex: 1.5 }} />
                  <TextField size="small" label="CCCD" value={c.cccd} onChange={(e) => updateCompanion(i, "cccd", e.target.value)} sx={{ flex: 1.5 }} />
                  <TextField size="small" label="Quan hệ" value={c.relationship} onChange={(e) => updateCompanion(i, "relationship", e.target.value)} sx={{ flex: 1 }} />
                  <TextField size="small" label="Telegram" value={c.telegramChatId || ""} onChange={(e) => updateCompanion(i, "telegramChatId", e.target.value)} sx={{ flex: 1.5 }} />
                  <IconButton size="small" onClick={() => removeCompanion(i)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              ))}
              <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 2, py: 1.5, fontSize: "0.8125rem" }}>
                {loading ? <CircularProgress size={22} /> : "Đăng ký"}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}