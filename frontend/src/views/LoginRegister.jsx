"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { registerFormAction } from "../actions/authActions";
import { getPublicBuildings } from "../actions/buildingActions";
import {
  Box, Paper, Tabs, Tab, TextField, Button, Typography, Alert, CircularProgress, IconButton, Avatar,
  FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";

const roleConfig = {
  landlord: { label: "Chủ trọ", icon: "🏠" },
  tenant: { label: "Người thuê", icon: "👤" },
};

export default function LoginRegister({ role = "tenant", loginAction }) {
  const { user, loading, adoptUser } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const config = roleConfig[role] || roleConfig.tenant;

  const [loginState, submitLogin, loginPending] = useActionState(loginAction, null);
  const [registerState, submitRegister, registerPending] = useActionState(registerFormAction, null);

  const [companions, setCompanions] = useState([]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [prefillEmail, setPrefillEmail] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");

  useEffect(() => {
    if (role !== "tenant") return;
    let active = true;
    getPublicBuildings()
      .then((list) => { if (active) setBuildings(list || []); })
      .catch(() => { if (active) setBuildings([]); });
    return () => { active = false; };
  }, [role]);

  // Nếu đã đăng nhập thì không ở lại trang login mà chuyển thẳng về dashboard.
  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loginState?.error) setError(loginState.error);
  }, [loginState]);

  useEffect(() => {
    if (loginState?.ok) {
      if (loginState.user.role !== role) {
        setError(`Tài khoản này không phải là ${config.label.toLowerCase()}`);
        return;
      }
      adoptUser(loginState.user);
      router.push(loginState.user.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginState?.ok]);

  useEffect(() => {
    if (registerState?.error) setError(registerState.error);
    if (registerState?.ok) {
      setError("");
      setSuccessMsg("Đăng ký thành công! Bạn chưa có phòng, vui lòng liên hệ chủ trọ để đăng ký. Bây giờ bạn có thể đăng nhập bằng email trên.");
      setCompanions([]);
      setPrefillEmail(registerState.email);
      setTab(0);
    }
  }, [registerState]);

  const addCompanion = () => setCompanions([...companions, { name: "", phone: "" }]);
  const removeCompanion = (i) => setCompanions(companions.filter((_, idx) => idx !== i));
  const updateCompanion = (i, field, value) => {
    const updated = [...companions];
    updated[i][field] = value;
    setCompanions(updated);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#f1f5f9" }}>
        <CircularProgress />
      </Box>
    );
  }

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
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: "12px" }}>{successMsg}</Alert>}

          {tab === 0 && (
            <Box component="form" action={submitLogin}>
              <input type="hidden" name="role" value={role} />
              <TextField fullWidth label="Email" name="email" margin="normal" required defaultValue={prefillEmail} key={prefillEmail} />
              <TextField fullWidth label="Mật khẩu" type="password" name="password" margin="normal" required />
              <Button fullWidth variant="contained" type="submit" disabled={loginPending} sx={{ mt: 2, py: 1.5, fontSize: "0.8125rem" }}>
                {loginPending ? <CircularProgress size={22} /> : "Đăng nhập"}
              </Button>
            </Box>
          )}

          {tab === 1 && (
            <Box component="form" action={submitRegister}>
              <TextField fullWidth label="Họ tên" name="name" margin="normal" required />
              <TextField fullWidth label="Email" type="email" name="email" margin="normal" required />
              <TextField fullWidth label="Số điện thoại" name="phone" margin="normal" required />

              <FormControl fullWidth margin="normal" required>
                <InputLabel id="building-select-label">Nhà trọ bạn đang thuê</InputLabel>
                <Select
                  labelId="building-select-label"
                  label="Nhà trọ bạn đang thuê"
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                >
                  {buildings.map((b) => (
                    <MenuItem key={b.id} value={String(b.id)}>
                      {b.name}{b.address ? ` — ${b.address}` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <input type="hidden" name="buildingId" value={selectedBuildingId} />

              <TextField fullWidth label="CCCD" name="cccd" margin="normal" />
              <TextField fullWidth label="Mật khẩu" type="password" name="password" margin="normal" required />
              <TextField fullWidth label="Xác nhận mật khẩu" type="password" name="confirmPassword" margin="normal" required />

              <input type="hidden" name="companions" value={JSON.stringify(companions.filter((c) => c.name.trim()))} />

              <Box sx={{ mt: 2, mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle2">Người đi kèm</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addCompanion} sx={{ fontSize: "0.75rem" }}>Thêm</Button>
              </Box>
              {companions.map((c, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
                  <TextField size="small" label="Họ tên" value={c.name} onChange={(e) => updateCompanion(i, "name", e.target.value)} sx={{ flex: 2 }} />
                  <TextField size="small" label="SĐT" value={c.phone} onChange={(e) => updateCompanion(i, "phone", e.target.value)} sx={{ flex: 1.5 }} />
                  <IconButton size="small" onClick={() => removeCompanion(i)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              ))}
              <Button fullWidth variant="contained" type="submit" disabled={registerPending} sx={{ mt: 2, py: 1.5, fontSize: "0.8125rem" }}>
                {registerPending ? <CircularProgress size={22} /> : "Đăng ký"}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
