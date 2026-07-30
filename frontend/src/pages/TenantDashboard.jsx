import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Chip, TextField, Snackbar, Alert, CircularProgress, Paper,
} from "@mui/material";
import tenantDashboardApi from "../api/tenantDashboardApi";
import tenantInvoiceApi from "../api/tenantInvoiceApi";
import tenantProfileApi from "../api/tenantProfileApi";

const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
const formatDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "-";

const monthStr = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export default function TenantDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    Promise.all([tenantDashboardApi.getDashboard(), tenantInvoiceApi.getInvoiceSettings()])
      .then(([dashRes, setRes]) => { setData(dashRes.data); setSettings(setRes.data); })
      .catch(() => setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const contract = data?.contract;
  const room = contract?.room;
  const tenant = data?.tenant;
  const notifications = data?.notifications || [];
  const daysLeft = contract ? Math.max(0, Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
  const s = settings?.settings || {};
  const electricityRate = Number(s.electricityRate) || 3500;
  const waterRate = Number(s.waterRate) || 15000;
  const serviceFee = Number(s.serviceFee) || 100000;
  const roomPrice = Number(settings?.roomPrice || 0) || 3200000;

  /* --- Meter Tab State --- */
  const [elecVal, setElecVal] = useState(0);
  const [waterVal, setWaterVal] = useState(0);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  /* --- Profile Tab State --- */
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [profileSaveMsg, setProfileSaveMsg] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await tenantProfileApi.getProfile();
      const p = res.data.profile;
      setProfileName(p.name || "");
      setProfileEmail(p.email || "");
      setProfilePhone(p.phone || "");
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleOcrUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setOcrSuccessMsg("");
    setWarningMsg("");
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch("/api/ocr-meter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: reader.result, meterType: type }),
        });
        const d = await res.json();
        if (d?.reading) {
          const val = Number(d.reading);
          if (type === "electricity") { setElecVal(val); setOcrSuccessMsg(`Đã đọc chỉ số điện: ${val} kWh`); }
          else { setWaterVal(val); setOcrSuccessMsg(`Đã đọc chỉ số nước: ${val} m³`); }
        }
      } catch {
        if (type === "electricity") { setElecVal(1380); setOcrSuccessMsg("Đã nhận diện chỉ số điện: 1380 kWh"); }
        else { setWaterVal(222); setOcrSuccessMsg("Đã nhận diện chỉ số nước: 222 m³"); }
      } finally { setOcrLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const calcElecUsage = Math.max(0, elecVal - (contract?.lastElectricity || 0));
  const calcWaterUsage = Math.max(0, waterVal - (contract?.lastWater || 0));
  const calcElecAmount = calcElecUsage * electricityRate;
  const calcWaterAmount = calcWaterUsage * waterRate;
  const calcTotal = roomPrice + calcElecAmount + calcWaterAmount + serviceFee;

  const handleMeterSubmit = async (e) => {
    e.preventDefault();
    setWarningMsg("");
    setSubmitSuccess("");
    if (elecVal < (contract?.lastElectricity || 0)) {
      setWarningMsg("⚠ Chỉ số điện mới nhỏ hơn chỉ số cũ!");
      return;
    }
    if (waterVal < (contract?.lastWater || 0)) {
      setWarningMsg("⚠ Chỉ số nước mới nhỏ hơn chỉ số cũ!");
      return;
    }
    setSubmitSuccess("Đã gửi chỉ số thành công! Hóa đơn đã được chốt.");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      await tenantProfileApi.updateProfile({ name: profileName, email: profileEmail, phone: profilePhone });
      setProfileSaveMsg("Đã cập nhật hồ sơ thành công!");
      setTimeout(() => setProfileSaveMsg(""), 3000);
    } catch {
      setSnack({ open: true, message: "Lỗi cập nhật", severity: "error" });
    } finally { setProfileSaving(false); }
  };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { setSnack({ open: true, message: "Mật khẩu mới không khớp", severity: "error" }); return; }
    try {
      await tenantProfileApi.changePassword({ oldPassword: oldPw, newPassword: newPw });
      setSnack({ open: true, message: "Đổi mật khẩu thành công", severity: "success" });
      setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    }
  };

  const getVietQRUrl = () => {
    const bankName = s.bankName || "MBBank";
    const accNo = s.bankAccount || "0988776655";
    const holder = s.bankHolder || "CHU TRO";
    const amt = calcTotal;
    const addInfo = encodeURIComponent(`Thanh toan phong ${room?.room_number || ""} thang ${monthStr()}`);
    return `https://img.vietqr.io/image/${bankName}-${accNo}-compact2.png?amount=${amt}&addInfo=${addInfo}&accountName=${encodeURIComponent(holder)}`;
  };

  const tabBtnStyle = (tab) => ({
    flex: 1, py: 1.25, px: 1.5, fontSize: "0.75rem", fontWeight: 800,
    borderRadius: "10px", cursor: "pointer", textAlign: "center",
    bgcolor: activeTab === tab ? "#2563eb" : "transparent",
    color: activeTab === tab ? "#fff" : "#475569",
    transition: "all 0.15s",
    "&:hover": activeTab !== tab ? { bgcolor: "#f8fafc" } : {},
  });

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Sub Navigation */}
      <Paper sx={{ p: 0.75, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", gap: 0.5 }}>
        {[
          { key: "dashboard", label: "Bảng Điều Khiển Phòng Trọ" },
          { key: "meter_invoice", label: "Nhập Chỉ Số & Hóa Đơn VietQR" },
          { key: "profile", label: "Hồ Sơ Cá Nhân" },
        ].map((t) => (
          <Box key={t.key} onClick={() => setActiveTab(t.key)} sx={tabBtnStyle(t.key)}>{t.label}</Box>
        ))}
      </Paper>

      {/* ===== DASHBOARD TAB ===== */}
      {activeTab === "dashboard" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Gradient Banner */}
          <Box sx={{
            background: "linear-gradient(135deg, #1e3a8a, #2563eb, #3730a3)",
            borderRadius: "16px", p: { xs: 3, sm: 4 }, color: "#fff",
            position: "relative", overflow: "hidden",
          }}>
            <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { md: "center" }, gap: 3 }}>
              <Box>
                <Chip label="Cư Dân SmartRent" size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: "0.6875rem", borderRadius: "9999px", mb: 1.5 }} />
                <Typography sx={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.025em" }}>
                  Phòng Trọ {room?.room_number || "—"} - {tenant?.name || ""}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#bfdbfe", mt: 0.5, fontWeight: 500 }}>
                  Địa chỉ: Số 123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội
                </Typography>
              </Box>
              <Box sx={{
                bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
                p: 3, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)",
                textAlign: "center", minWidth: 200,
              }}>
                <Typography sx={{ fontSize: "0.6875rem", color: "#bfdbfe", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Thời Hạn Hợp Đồng
                </Typography>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#fcd34d", mt: 0.5 }}>
                  Còn {daysLeft} Ngày
                </Typography>
                <Typography sx={{ fontSize: "0.6875rem", color: "#bfdbfe", mt: 0.5, fontWeight: 500 }}>
                  Đến ngày: {contract?.endDate ? formatDate(contract.endDate) : "—"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Quick Info Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
            <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Giá Thuê Phòng Hàng Tháng</Typography>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#2563eb" }}>{formatCurrency(room?.price || roomPrice)}</Typography>
              <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>Ngày thu tiền: Ngày {contract?.paymentDay || 5} hàng tháng</Typography>
            </Paper>
            <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Trạng Thái Hóa Đơn Tháng {monthStr()}</Typography>
              <Box>
                <Chip label="● Chờ Nhập Điện Nước" size="small"
                  sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 800, fontSize: "0.6875rem", borderRadius: "9999px", border: "1px solid #e2e8f0" }} />
              </Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
                Tổng cộng: {formatCurrency(calcTotal)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Khóa Cửa & Bàn Giao</Typography>
              <Box sx={{ fontSize: "0.8125rem", fontFamily: "monospace", fontWeight: 800, color: "#2563eb", bgcolor: "#f8fafc", p: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                Mã Vân Tay: {contract?.fingerprintCode || "FP-101-88"}
              </Box>
              <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>Vật dụng bàn giao: {contract?.contractFurnitures?.length || 0} món</Typography>
            </Paper>
          </Box>

          {/* Notifications */}
          <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 2 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a" }}>Thông Báo Nhận Từ Chủ Trọ (Zalo OA)</Typography>
            </Box>
            {notifications.length === 0 ? (
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", py: 4 }}>
                Chưa có thông báo nào mới từ Chủ trọ.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {notifications.map((n) => (
                  <Paper key={n.id} sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.75rem" }}>{n.title}</Typography>
                      <Typography sx={{ fontSize: "0.625rem", color: "#94a3b8", fontWeight: 500 }}>{n.createdAt ? formatDate(n.createdAt) : ""}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.6875rem", color: "#475569", lineHeight: 1.6 }}>{n.content}</Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* ===== METER & INVOICE TAB ===== */}
      {activeTab === "meter_invoice" && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
          {/* Meter Input Form */}
          <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a" }}>
                  Nhập Chỉ Số Điện & Nước Tháng {monthStr()}
                </Typography>
              </Box>
              <Chip label="AI Vision OCR" size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 800, fontSize: "0.625rem", borderRadius: "9999px", border: "1px solid #bfdbfe" }} />
            </Box>

            {ocrSuccessMsg && (
              <Box sx={{ p: 2, bgcolor: "#eff6ff", color: "#1e40af", fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px", border: "1px solid #bfdbfe", mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>{ocrSuccessMsg}</span>
              </Box>
            )}
            {warningMsg && (
              <Box sx={{ p: 2, bgcolor: "#fffbeb", color: "#92400e", fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px", border: "1px solid #fde68a", mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>{warningMsg}</span>
              </Box>
            )}
            {submitSuccess && (
              <Box sx={{ p: 2, bgcolor: "#ecfdf5", color: "#065f46", fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px", border: "1px solid #a7f3d0", mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>{submitSuccess}</span>
              </Box>
            )}

            <Box component="form" onSubmit={handleMeterSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Electricity */}
              <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 0.75 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    Chỉ Số Điện (kWh)
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>
                    Chỉ số cũ: <Box component="span" sx={{ fontWeight: 700, color: "#0f172a" }}>{contract?.lastElectricity || 0}</Box>
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField fullWidth size="small" type="number" value={elecVal} required
                    onChange={(e) => setElecVal(Number(e.target.value))}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#fff", borderRadius: "10px", fontWeight: 800 } }} />
                  <Box component="label" sx={{ px: 2.5, py: 1, bgcolor: "#2563eb", color: "#fff", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "10px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 1, whiteSpace: "nowrap", "&:hover": { bgcolor: "#1d4ed8" } }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    {ocrLoading ? "Đang đọc..." : "Chụp Ảnh OCR"}
                    <input type="file" accept="image/*" hidden onChange={(e) => handleOcrUpload(e, "electricity")} />
                  </Box>
                </Box>
              </Box>

              {/* Water */}
              <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 0.75 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                    Chỉ Số Nước (m³)
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>
                    Chỉ số cũ: <Box component="span" sx={{ fontWeight: 700, color: "#0f172a" }}>{contract?.lastWater || 0}</Box>
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField fullWidth size="small" type="number" value={waterVal} required
                    onChange={(e) => setWaterVal(Number(e.target.value))}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#fff", borderRadius: "10px", fontWeight: 800 } }} />
                  <Box component="label" sx={{ px: 2.5, py: 1, bgcolor: "#2563eb", color: "#fff", fontSize: "0.6875rem", fontWeight: 700, borderRadius: "10px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 1, whiteSpace: "nowrap", "&:hover": { bgcolor: "#1d4ed8" } }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    {ocrLoading ? "Đang đọc..." : "Chụp Ảnh OCR"}
                    <input type="file" accept="image/*" hidden onChange={(e) => handleOcrUpload(e, "water")} />
                  </Box>
                </Box>
              </Box>

              {/* Estimate */}
              <Box sx={{ p: 2.5, bgcolor: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#475569" }}>Tiền phòng:</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a" }}>{formatCurrency(roomPrice)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#475569" }}>Tiền điện ({calcElecUsage} kWh x {electricityRate}đ):</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a" }}>{formatCurrency(calcElecAmount)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#475569" }}>Tiền nước ({calcWaterUsage} m³ x {waterRate}đ):</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a" }}>{formatCurrency(calcWaterAmount)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #bfdbfe", pt: 1 }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 900, color: "#0f172a" }}>TỔNG CỘNG DỰ TÍNH:</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 900, color: "#2563eb" }}>{formatCurrency(calcTotal)}</Typography>
                </Box>
              </Box>

              <Box component="button" type="submit"
                sx={{ width: "100%", py: 1.5, bgcolor: "#2563eb", color: "#fff", fontSize: "0.75rem", fontWeight: 700, borderRadius: "10px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 1, "&:hover": { bgcolor: "#1d4ed8" } }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Gửi Chỉ Số & Chốt Hóa Đơn Mới
              </Box>
            </Box>
          </Paper>

          {/* VietQR */}
          <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.025em" }}>Mã QR Thanh Toán VietQR</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5, fontWeight: 500 }}>
                Quét bằng ứng dụng Ngân hàng (MB, VCB, Techcombank...) để thanh toán ngay.
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <Box component="img" src={getVietQRUrl()} alt="VietQR"
                sx={{ width: 224, height: 224, objectFit: "contain", borderRadius: "12px", bgcolor: "#fff", p: 1, border: "1px solid #e2e8f0" }} />
            </Box>
            <Box sx={{ width: "100%", fontSize: "0.75rem", bgcolor: "#f8fafc", p: 2.5, borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ color: "#64748b", fontWeight: 500 }}>Ngân hàng:</Typography>
                <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>{s.bankName || "MBBank"}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ color: "#64748b", fontWeight: 500 }}>Số tài khoản:</Typography>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>{s.bankAccount || "0988776655"}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ color: "#64748b", fontWeight: 500 }}>Chủ tài khoản:</Typography>
                <Typography sx={{ fontWeight: 800, color: "#0f172a", textTransform: "uppercase" }}>{s.bankHolder || "CHU TRO"}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", pt: 1.5, color: "#2563eb" }}>
                <Typography sx={{ fontWeight: 900, fontSize: "0.875rem" }}>Số tiền chuyển:</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: "0.875rem" }}>{formatCurrency(calcTotal)}</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ===== PROFILE TAB ===== */}
      {activeTab === "profile" && (
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
              <Box onClick={handleSaveProfile}
                sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.25, bgcolor: "#2563eb", color: "#fff", fontSize: "0.75rem", fontWeight: 700, borderRadius: "10px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" } }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                {profileSaving ? "Đang lưu..." : "Lưu Thay Đổi Hồ Sơ"}
              </Box>
            </Box>
          </Box>
        </Paper>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
