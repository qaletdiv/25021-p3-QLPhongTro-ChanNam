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
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
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
  const [buildings, setBuildings] = useState(initialBuildings);
  const [buildingId, setBuildingId] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [checkMsg, setCheckMsg] = useState(null);
  const [banks, setBanks] = useState([]);
  const [pushMsg, setPushMsg] = useState("");
  const [collabBuilding, setCollabBuilding] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [collabEmail, setCollabEmail] = useState("");

  const myBuildings = buildings.filter((b) => b.landlordId === user?.id);

  const loadCollaborators = async (bid) => {
    if (!bid) { setCollaborators([]); return; }
    try {
      const res = await getCollaborators(bid);
      setCollaborators(res.data.collaborators || []);
    } catch { setCollaborators([]); }
  };

  const handleAddCollaborator = async () => {
    if (!collabBuilding || !collabEmail.trim()) return;
    try {
      await addCollaborator(collabBuilding, collabEmail.trim());
      setCollabEmail("");
      await loadCollaborators(collabBuilding);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Không thể thêm cộng tác viên", severity: "error" });
    }
  };

  const handleRemoveCollaborator = async (uid) => {
    try {
      await removeCollaborator(collabBuilding, uid);
      await loadCollaborators(collabBuilding);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Không thể xóa cộng tác viên", severity: "error" });
    }
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

  const sectionSx = { bgcolor: "#fff", p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" fontWeight="bold">Cài Đặt Cấu Hình Hệ Thống Chung</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Cấu hình đơn giá tiện ích điện nước, tài khoản ngân hàng VietQR, token kết nối Telegram Bot và thông tin vận hành.
        </Typography>
      </Box>

      {/* Building scope selector */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <TextField
          select size="small" value={buildingId} onChange={(e) => handleBuildingChange(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><ApartmentIcon sx={{ fontSize: 18, color: "#64748b" }} /></InputAdornment>) } }}
          sx={{ minWidth: 320, "& .MuiSelect-select": { py: 1.1, fontSize: "0.75rem", fontWeight: 600 } }}
        >
          <MenuItem value="">Mặc định (áp dụng cho tất cả nhà)</MenuItem>
          {buildings.map((b) => (
            <MenuItem key={b.id} value={String(b.id)}>Cấu hình riêng: {b.name}</MenuItem>
          ))}
        </TextField>
        {buildingId && (
          <Typography sx={{ fontSize: "0.6875rem", color: "#d97706", fontWeight: 600 }}>
            Đang chỉnh cấu hình riêng cho nhà này, sẽ ghi đè cấu hình mặc định.
          </Typography>
        )}
      </Box>

      {savedMsg && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, bgcolor: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: 700, borderRadius: "16px", border: "1px solid #a7f3d0" }}>
          <CheckCircleIcon sx={{ fontSize: 18, color: "#059669" }} />
          <span>{savedMsg}</span>
        </Box>
      )}

      <Box component="form" onSubmit={handleSave} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* 1. Đơn giá */}
        <Box sx={sectionSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
            <BoltIcon sx={{ fontSize: 18, color: "#2563eb" }} />
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>1. Đơn Giá Tiện Ích & Dịch Vụ Mặc Định</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Đơn Giá Điện (đ/kWh)</Typography>
              <MoneyField fullWidth value={form.electricityRate || ""} onChange={(v) => set("electricityRate", v)} sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Đơn Giá Nước (đ/m³)</Typography>
              <MoneyField fullWidth value={form.waterRate || ""} onChange={(v) => set("waterRate", v)} sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Phí Dịch Vụ & Rác (đ/tháng)</Typography>
              <MoneyField fullWidth value={form.serviceFee || ""} onChange={(v) => set("serviceFee", v)} sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
            </Box>
          </Box>
        </Box>

        {/* 2. Ngân hàng VietQR */}
        <Box sx={sectionSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
            <CreditCardIcon sx={{ fontSize: 18, color: "#2563eb" }} />
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>2. Thông Tin Ngân Hàng Tích Hợp VietQR Automate</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "2fr 1fr 1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tên Ngân Hàng</Typography>
              <TextField
                select fullWidth size="small" value={form.bankName || ""}
                onChange={(e) => set("bankName", e.target.value)}
                placeholder="Chọn ngân hàng"
                renderValue={(selected) => {
                  const b = banks.find((x) => x.shortName === selected);
                  if (!b) return selected;
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      {b.logo && (
                        <img src={b.logo} alt={b.shortName} style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 6 }} />
                      )}
                      <span>{b.shortName}</span>
                    </Box>
                  );
                }}
                sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
              >
                <MenuItem value="">-- Chọn ngân hàng --</MenuItem>
                {banks.map((b) => (
                  <MenuItem key={b.bin} value={b.shortName}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      {b.logo && (
                        <img src={b.logo} alt={b.shortName} style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 6 }} />
                      )}
                      <span>{b.shortName} ({b.name})</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số Tài Khoản</Typography>
              <TextField fullWidth placeholder="0988776655" value={form.bankAccount || ""} onChange={(e) => set("bankAccount", e.target.value)} sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tên Chủ Tài Khoản</Typography>
              <TextField fullWidth placeholder="NGUYEN VAN A" value={form.bankHolder || ""} onChange={(e) => set("bankHolder", e.target.value)} slotProps={{ htmlInput: { style: { textTransform: "uppercase", fontWeight: 700 } } }} sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Chi Nhánh Ngân Hàng</Typography>
              <TextField fullWidth placeholder="Chi nhánh Hà Nội" value={form.bankBranch || ""} onChange={(e) => set("bankBranch", e.target.value)} sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
            </Box>
          </Box>
        </Box>

        {/* 3. Telegram Bot */}
        <Box sx={sectionSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
            <MessageIcon sx={{ fontSize: 18, color: "#2563eb" }} />
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>3. Cấu Hình Telegram Bot Gửi Thông Báo</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }, gap: 2, alignItems: "center" }}>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / 2", lg: "1 / 3" } }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Telegram Bot Token (lấy từ @BotFather)</Typography>
              <TextField fullWidth type="password" placeholder="123456:ABC-DEF..." value={form.telegramBotToken || ""} onChange={(e) => set("telegramBotToken", e.target.value)} sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
              <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8", mt: 0.75 }}>
                Khách thuê cần nhập Telegram Chat ID trong mục "Hồ sơ cá nhân" để nhận thông báo.
              </Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "2 / -1", lg: "3 / -1" }, display: "flex", flexDirection: "column", gap: 0.5, p: 1.5, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <FormControlLabel
                control={<Checkbox size="small" checked={form.autoReminderEnabled !== "false"} onChange={(e) => set("autoReminderEnabled", e.target.checked ? "true" : "false")} />}
                label={<Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>Bật Tự Động Nhắc Nợ Qua Telegram</Typography>}
              />
              <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", pl: 0.5 }}>
                Hệ thống tự gửi nhắc nợ vào đúng ngày thu tiền của TỪNG PHÒNG (theo "Ngày thu" trong hợp đồng), mỗi tháng 1 lần cho mỗi phòng.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 2 }}>
            <Button variant="outlined" size="small" onClick={handleTestTelegram}
              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700, borderRadius: "10px", borderColor: "#cbd5e1", color: "#334155", "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" } }}>
              Kiểm Tra Kết Nối Bot
            </Button>
            {checkMsg && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75, borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700,
                bgcolor: checkMsg.ok ? "#d1fae5" : "#fee2e2", color: checkMsg.ok ? "#065f46" : "#991b1b", border: `1px solid ${checkMsg.ok ? "#a7f3d0" : "#fecaca"}` }}>
                {checkMsg.ok ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <BoltIcon sx={{ fontSize: 16 }} />}
                <span>{checkMsg.message}</span>
              </Box>
            )}
          </Box>
        </Box>

        {/* 4. Chủ trọ */}
        <Box sx={sectionSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
            <PersonIcon sx={{ fontSize: 18, color: "#2563eb" }} />
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>4. Thông Tin Chủ Trọ Quản Lý</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Họ & Tên Chủ Trọ</Typography>
              <TextField fullWidth value={form.landlordName || ""} onChange={(e) => set("landlordName", e.target.value)} sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số Điện Thoại Liên Hệ</Typography>
              <TextField fullWidth value={form.landlordPhone || ""} onChange={(e) => set("landlordPhone", e.target.value)} sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Telegram ID Chủ Trọ</Typography>
              <TextField fullWidth value={form.landlordTelegramId || ""} onChange={(e) => set("landlordTelegramId", e.target.value)} placeholder="Ví dụ: 667203953" sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
              <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8", mt: 0.75 }}>
                Chủ trọ sẽ nhận thông báo báo hỏng & hóa đơn mới qua Telegram kèm link xem chi tiết.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 5. Thông báo đẩy (Web Push) */}
        <Box sx={sectionSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
            <NotificationImportantIcon sx={{ fontSize: 18, color: "#2563eb" }} />
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>5. Thông Báo Đẩy (Push)</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" size="small" onClick={handleEnablePush}
              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700, borderRadius: "10px", borderColor: "#cbd5e1", color: "#334155", "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" } }}>
              Bật Thông Báo Đẩy
            </Button>
            {pushMsg && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75, borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700, bgcolor: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                <CheckCircleIcon sx={{ fontSize: 16 }} />
                <span>{pushMsg}</span>
              </Box>
            )}
          </Box>
          <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8", mt: 1.5 }}>
            Nhận thông báo ngay trong trình duyệt khi có báo hỏng mới, hóa đơn đã thanh toán hoặc thông báo từ chủ trọ.
          </Typography>
        </Box>

        {/* Save */}
        <Box sx={{ textAlign: "center" }}>
          <Button type="submit" variant="contained"
            sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 4, py: 1.5, fontWeight: 700, fontSize: "0.75rem", borderRadius: "12px", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
          >
            <SaveIcon sx={{ fontSize: 16 }} />
            <span>Lưu Cập Nhật Cấu Hình Hệ Thống</span>
          </Button>
        </Box>
      </Box>

      {/* Cộng tác viên */}
      <Box sx={sectionSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
          <GroupAddIcon sx={{ fontSize: 18, color: "#7c3aed" }} />
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>Cộng Tác Viên Quản Lý Nhà</Typography>
        </Box>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: 2 }}>
          Chia sẻ nhà trọ cho một tài khoản chủ trọ khác. Cộng tác viên sẽ xem và quản lý toàn bộ phòng, hóa đơn, khách thuê của nhà được chia sẻ (chỉ chủ sở hữu mới thêm/bỏ được).
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr auto" }, gap: 2, alignItems: "center", mb: 2 }}>
          <TextField
            select fullWidth size="small" label="Chọn nhà của bạn" value={collabBuilding}
            onChange={(e) => { setCollabBuilding(e.target.value); loadCollaborators(e.target.value); }}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
          >
            {myBuildings.map((b) => (
              <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth size="small" label="Email tài khoản chủ trọ" placeholder="chuhoangsa2@gmail.com"
            value={collabEmail} onChange={(e) => setCollabEmail(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
          />
          <Button variant="contained" startIcon={<GroupAddIcon />} onClick={handleAddCollaborator} disabled={!collabBuilding || !collabEmail.trim()}
            sx={{ py: 1, fontSize: "0.75rem", fontWeight: 700, textTransform: "none", borderRadius: "12px" }}>
            Thêm
          </Button>
        </Box>
        {collabBuilding && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {collaborators.length === 0 && (
              <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>Chưa có cộng tác viên nào cho nhà này.</Typography>
            )}
            {collaborators.map((c) => (
              <Box key={c.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.25, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{c.name}</Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>{c.email}</Typography>
                </Box>
                <IconButton size="small" onClick={() => handleRemoveCollaborator(c.id)} title="Xóa cộng tác viên">
                  <DeleteIcon sx={{ fontSize: 18, color: "#e11d48" }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
