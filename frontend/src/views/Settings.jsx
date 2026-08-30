"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, MenuItem, InputAdornment, Checkbox, FormControlLabel, IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BoltIcon from "@mui/icons-material/Bolt";
import MessageIcon from "@mui/icons-material/Message";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import MessageDialog from "../components/MessageDialog";
import MoneyField from "../components/ui/MoneyField";
import settingApi from "../api/settingApi";
import { requestPushPermission } from "../hooks/usePushSubscription";
import { useAuth } from "../contexts/AuthContext";
import { getCollaborators, addCollaborator, removeCollaborator } from "../actions/collaboratorActions";

export default function Settings({ initialSettings = null, initialBuildings = [] }) {
  const { user } = useAuth();
  const [form, setForm] = useState(initialSettings || {});
  const [buildings] = useState(initialBuildings);
  const [buildingId, setBuildingId] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [checkMsg, setCheckMsg] = useState(null);
const [banks, setBanks] = useState([]);
  const [pushMsg, setPushMsg] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [collabBuilding, setCollabBuilding] = useState("");
  const [collabEmail, setCollabEmail] = useState("");
  const [collabPassword, setCollabPassword] = useState("");
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removeUid, setRemoveUid] = useState(null);

  const myBuildings = buildings.filter((b) => b.landlordId === user?.id);

  const loadCollaborators = async (bid) => {
    if (!bid) { setCollaborators([]); return; }
    try {
      const res = await getCollaborators(bid);
      setCollaborators(res.data.collaborators || []);
    } catch { setCollaborators([]); }
  };

  const handleAddCollaborator = async () => {
    if (!collabBuilding || !collabEmail.trim() || !collabPassword.trim()) return;
    try {
      await addCollaborator(collabBuilding, collabEmail.trim(), collabPassword.trim());
      setCollabEmail("");
      setCollabPassword("");
      await loadCollaborators(collabBuilding);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Không thể thêm cộng tác viên", severity: "error" });
    }
  };

  const handleRemoveCollaborator = async (uid) => {
    setRemoveUid(uid);
    setRemoveConfirmOpen(true);
  };

  const handleEnablePush = async () => {
    const ok = await requestPushPermission();
    setPushMsg(ok ? "Đã bật thông báo đẩy thành công!" : "Bạn chưa cấp quyền nhận thông báo đẩy.");
  };

  // Dữ liệu ban đầu được fetch server-side; chỉ banks cần tải thêm phía client
  useEffect(() => {
    settingApi.getBanks().then((res) => setBanks(res.data.banks || [])).catch(() => {});
  }, []);

  const loadSettings = (bid) => {
    settingApi.getAll(bid).then((res) => setForm(res.data.settings || {})).catch(() => {});
  };

  const handleBuildingChange = (bid) => {
    setBuildingId(bid);
    setSavedMsg("");
    loadSettings(bid);
  };

  const set = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await settingApi.save(form, buildingId);
      setSavedMsg(buildingId ? "Cấu hình riêng cho nhà trọ đã được lưu thành công!" : "Cấu hình chung hệ thống đã được lưu cập nhật thành công!");
      setTimeout(() => setSavedMsg(""), 4000);
    } catch {
      setSnack({ open: true, message: "Lỗi lưu cài đặt", severity: "error" });
    }
  };

  const handleTestTelegram = async () => {
    try {
      await settingApi.save(form, buildingId);
      const res = await settingApi.checkTelegram(buildingId);
      setCheckMsg({ ok: res.data.ok, message: res.data.message || "Kiểm tra không xác định" });
    } catch {
      setCheckMsg({ ok: false, message: "Lỗi kết nối đến máy chủ" });
    }
  };

  const sectionSx = { bgcolor: "#fff", p: 2, borderRadius: "16px", border: "1px solid #e2e8f0" };
  const fieldSx = { "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } };
  const labelSx = { fontSize: "0.6875rem", fontWeight: 700, color: "#334155", mb: 0.5 };
  const headSx = (icon, color, title) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1, mb: 1.5, borderBottom: "1px solid #f1f5f9" }}>
      {icon}
      <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8125rem" }}>{title}</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Header + phạm vi cấu hình trên cùng một hàng */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">Cài Đặt Cấu Hình Hệ Thống</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>
            Đơn giá điện nước, VietQR, Telegram Bot và cộng tác viên quản lý nhà.
          </Typography>
        </Box>
        <TextField
          select size="small" value={buildingId} onChange={(e) => handleBuildingChange(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><ApartmentIcon sx={{ fontSize: 18, color: "#64748b" }} /></InputAdornment>) } }}
          sx={{ minWidth: 300, "& .MuiSelect-select": { py: 1, fontSize: "0.75rem", fontWeight: 600 } }}
        >
          <MenuItem value="">Mặc định (áp dụng cho tất cả nhà)</MenuItem>
          {buildings.map((b) => (
            <MenuItem key={b.id} value={String(b.id)}>Cấu hình riêng: {b.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      {savedMsg && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.25, bgcolor: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px", border: "1px solid #a7f3d0" }}>
          <CheckCircleIcon sx={{ fontSize: 18, color: "#059669" }} />
          <span>{savedMsg}</span>
        </Box>
      )}

      <Box component="form" onSubmit={handleSave} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 1.5, alignItems: "start" }}>
          {/* 1. Đơn giá */}
          <Box sx={sectionSx}>
            {headSx(<BoltIcon sx={{ fontSize: 16, color: "#2563eb" }} />, "#2563eb", "1. Đơn Giá Tiện Ích & Dịch Vụ")}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1.5 }}>
              <Box>
                <Typography sx={labelSx}>Điện (đ/kWh)</Typography>
                <MoneyField fullWidth value={form.electricityRate || ""} onChange={(v) => set("electricityRate", v)} sx={fieldSx} />
              </Box>
              <Box>
                <Typography sx={labelSx}>Nước (đ/m³)</Typography>
                <MoneyField fullWidth value={form.waterRate || ""} onChange={(v) => set("waterRate", v)} sx={fieldSx} />
              </Box>
              <Box>
                <Typography sx={labelSx}>Phí Dịch Vụ (đ/tháng)</Typography>
                <MoneyField fullWidth value={form.serviceFee || ""} onChange={(v) => set("serviceFee", v)} sx={fieldSx} />
              </Box>
            </Box>
          </Box>

          {/* 2. Ngân hàng VietQR */}
          <Box sx={sectionSx}>
            {headSx(<CreditCardIcon sx={{ fontSize: 16, color: "#2563eb" }} />, "#2563eb", "2. Ngân Hàng VietQR")}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
              <Box>
                <Typography sx={labelSx}>Tên Ngân Hàng</Typography>
                <TextField
                  select fullWidth size="small" value={form.bankName || ""}
                  onChange={(e) => set("bankName", e.target.value)}
                  placeholder="Chọn ngân hàng"
                  renderValue={(selected) => {
                    const b = banks.find((x) => x.shortName === selected);
                    if (!b) return selected;
                    return (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        {b.logo && (<img src={b.logo} alt={b.shortName} style={{ width: 24, height: 24, objectFit: "contain", borderRadius: 6 }} />)}
                        <span>{b.shortName}</span>
                      </Box>
                    );
                  }}
                  sx={fieldSx}
                >
                  <MenuItem value="">-- Chọn ngân hàng --</MenuItem>
                  {banks.map((b) => (
                    <MenuItem key={b.bin} value={b.shortName}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        {b.logo && (<img src={b.logo} alt={b.shortName} style={{ width: 24, height: 24, objectFit: "contain", borderRadius: 6 }} />)}
                        <span>{b.shortName} ({b.name})</span>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box>
                <Typography sx={labelSx}>Số Tài Khoản</Typography>
                <TextField fullWidth size="small" placeholder="0988776655" value={form.bankAccount || ""} onChange={(e) => set("bankAccount", e.target.value)} sx={fieldSx} />
              </Box>
              <Box>
                <Typography sx={labelSx}>Tên Chủ Tài Khoản</Typography>
                <TextField fullWidth size="small" placeholder="NGUYEN VAN A" value={form.bankHolder || ""} onChange={(e) => set("bankHolder", e.target.value)} slotProps={{ htmlInput: { style: { textTransform: "uppercase", fontWeight: 700 } } }} sx={fieldSx} />
              </Box>
              <Box>
                <Typography sx={labelSx}>Chi Nhánh</Typography>
                <TextField fullWidth size="small" placeholder="Chi nhánh Hà Nội" value={form.bankBranch || ""} onChange={(e) => set("bankBranch", e.target.value)} sx={fieldSx} />
              </Box>
            </Box>
          </Box>

          {/* 3. Telegram Bot */}
          <Box sx={sectionSx}>
            {headSx(<MessageIcon sx={{ fontSize: 16, color: "#2563eb" }} />, "#2563eb", "3. Telegram Bot Gửi Thông Báo")}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, alignItems: "start" }}>
              <Box>
                <Typography sx={labelSx}>Bot Token (@BotFather)</Typography>
                <TextField fullWidth size="small" type="password" placeholder="123456:ABC-DEF..." value={form.telegramBotToken || ""} onChange={(e) => set("telegramBotToken", e.target.value)} sx={fieldSx} />
                <Button variant="outlined" size="small" type="button" onClick={handleTestTelegram}
                  sx={{ mt: 1, textTransform: "none", fontSize: "0.7rem", fontWeight: 700, borderRadius: "10px", borderColor: "#cbd5e1", color: "#334155", "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" } }}>
                  Kiểm Tra Kết Nối
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, p: 1.25, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <FormControlLabel
                  control={<Checkbox size="small" checked={form.autoReminderEnabled !== "false"} onChange={(e) => set("autoReminderEnabled", e.target.checked ? "true" : "false")} />}
                  label={<Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f172a" }}>Bật Tự Động Nhắc Nợ Qua Telegram</Typography>}
                />
                <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>
                  Tự gửi nhắc nợ vào ngày thu tiền của từng phòng, mỗi tháng 1 lần.
                </Typography>
                {checkMsg && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.5, borderRadius: "8px", fontSize: "0.68rem", fontWeight: 700,
                    bgcolor: checkMsg.ok ? "#d1fae5" : "#fee2e2", color: checkMsg.ok ? "#065f46" : "#991b1b" }}>
                    <span>{checkMsg.message}</span>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* 4 + 5. Chủ trọ & Thông báo đẩy */}
          <Box sx={sectionSx}>
            {headSx(<PersonIcon sx={{ fontSize: 16, color: "#2563eb" }} />, "#2563eb", "4. Chủ Trọ & Thông Báo Đẩy")}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1.5 }}>
              <Box>
                <Typography sx={labelSx}>Họ & Tên Chủ Trọ</Typography>
                <TextField fullWidth size="small" value={form.landlordName || ""} onChange={(e) => set("landlordName", e.target.value)} sx={fieldSx} />
              </Box>
              <Box>
                <Typography sx={labelSx}>SĐT Liên Hệ</Typography>
                <TextField fullWidth size="small" value={form.landlordPhone || ""} onChange={(e) => set("landlordPhone", e.target.value)} sx={fieldSx} />
              </Box>
              <Box>
                <Typography sx={labelSx}>Telegram ID Chủ Trọ</Typography>
                <TextField fullWidth size="small" value={form.landlordTelegramId || ""} onChange={(e) => set("landlordTelegramId", e.target.value)} placeholder="667203953" sx={fieldSx} />
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5, flexWrap: "wrap" }}>
              <Button variant="outlined" size="small" type="button" onClick={handleEnablePush}
                sx={{ textTransform: "none", fontSize: "0.7rem", fontWeight: 700, borderRadius: "10px", borderColor: "#cbd5e1", color: "#334155", "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" } }}>
                Bật Thông Báo Đẩy
              </Button>
              {pushMsg && (
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: pushMsg.startsWith("Đã") ? "#065f46" : "#d97706" }}>{pushMsg}</Typography>
              )}
              <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8" }}>
                Nhận thông báo trong trình duyệt khi có báo hỏng / hóa đơn mới.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Cộng tác viên */}
        <Box sx={sectionSx}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, pb: 1, mb: 1.5, borderBottom: "1px solid #f1f5f9" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <GroupAddIcon sx={{ fontSize: 16, color: "#7c3aed" }} />
              <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8125rem" }}>Cộng Tác Viên Quản Lý Nhà</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8" }}>
              Cộng tác viên xem và quản lý toàn bộ phòng, hóa đơn, khách thuê của nhà được chia sẻ.
            </Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr auto" }, gap: 1, alignItems: "center" }}>
            <TextField
              select fullWidth size="small" label="Tòa nhà" value={collabBuilding}
              sx={{ mb: 0 }}
              onChange={(e) => { setCollabBuilding(e.target.value); loadCollaborators(e.target.value); }}
              sx={fieldSx}
            >
              {myBuildings.map((b) => (
                <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
              ))}
            </TextField>
<TextField
              fullWidth size="small" label="Email tài khoản chủ trọ" placeholder="chuhoangsa2@gmail.com"
              value={collabEmail} onChange={(e) => setCollabEmail(e.target.value)}
              sx={{ mb: 0, margin: "dense" }}
/>
            <TextField
              fullWidth size="small" label="Mật khẩu" type="password" placeholder="*****"
              value={collabPassword} onChange={(e) => setCollabPassword(e.target.value)}
              sx={{ mb: 0, margin: "dense" }}
/>
            <Button variant="contained" startIcon={<GroupAddIcon />} type="button" onClick={handleAddCollaborator} disabled={!collabBuilding || !collabEmail.trim() || !collabPassword.trim()}
              sx={{ py: 1.5, px: 3, fontSize: "0.75rem", fontWeight: 600, textTransform: "none", borderRadius: "8px" }}>
              Thêm
            </Button>
          </Box>
          {collabBuilding && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
              {collaborators.length === 0 && (
                <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>Chưa có cộng tác viên nào cho nhà này.</Typography>
              )}
              {collaborators.map((c) => (
                <Box key={c.id} sx={{ display: "flex", alignItems: "center", gap: 1.25, pl: 1.5, pr: 0.75, py: 0.75, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "999px" }}>
                  <Box sx={{ lineHeight: 1.15 }}>
                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#0f172a" }}>{c.name}</Typography>
                    <Typography sx={{ fontSize: "0.62rem", color: "#64748b" }}>{c.email}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => { setRemoveUid(c.id); setRemoveConfirmOpen(true); }} title="Xóa cộng tác viên">
                    <DeleteIcon sx={{ fontSize: 16, color: "#e11d48" }} />
                  </IconButton>
                  {removeConfirmOpen && removeUid === c.id && (
                    <MessageDialog
                      open={removeConfirmOpen}
                      severity="warning"
                      message="Bạn có chắc chắn muốn xóa cộng tác viên này?"
                      onClose={() => { removeCollaborator(collabBuilding, c.id); setRemoveConfirmOpen(false); setRemoveUid(null); loadCollaborators(collabBuilding); }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Save — dưới cùng */}
        <Box sx={{ textAlign: "center" }}>
          <Button type="submit" variant="contained"
            sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 5, py: 1.25, fontWeight: 700, fontSize: "0.78rem", borderRadius: "12px", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
          >
            <SaveIcon sx={{ fontSize: 16 }} />
            <span>Lưu Cập Nhật Cấu Hình Hệ Thống</span>
          </Button>
        </Box>
      </Box>

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
