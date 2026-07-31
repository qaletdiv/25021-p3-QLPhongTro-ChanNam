"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Snackbar, Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BoltIcon from "@mui/icons-material/Bolt";
import MessageIcon from "@mui/icons-material/Message";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import settingApi from "../api/settingApi";

export default function Settings() {
  const [form, setForm] = useState({});
  const [savedMsg, setSavedMsg] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    settingApi.getAll().then((res) => setForm(res.data.settings || {})).catch(() => {});
  }, []);

  const set = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await settingApi.save(form);
      setSavedMsg("Cấu hình chung hệ thống đã được lưu cập nhật thành công!");
      setTimeout(() => setSavedMsg(""), 4000);
    } catch {
      setSnack({ open: true, message: "Lỗi lưu cài đặt", severity: "error" });
    }
  };

  const inputSx = {
    width: "100%", px: 1.75, py: 1.5, fontSize: "0.75rem", bgcolor: "#f8fafc",
    border: "1px solid #e2e8f0", borderRadius: "12px", outline: "none", boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
    "&:focus": { bgcolor: "#fff", borderColor: "#2563eb", boxShadow: "0 0 0 2px rgba(37,99,235,0.2)" },
  };

  const sectionSx = { bgcolor: "#fff", p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.025em" }}>Cài Đặt Cấu Hình Hệ Thống Chung</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Cấu hình đơn giá tiện ích điện nước, tài khoản ngân hàng VietQR, token kết nối Zalo OA và thông tin vận hành.
        </Typography>
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
            <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.875rem" }}>1. Đơn Giá Tiện Ích & Dịch Vụ Mặc Định</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Đơn Giá Điện (đ/kWh)</Typography>
              <Box component="input" type="number" value={form.electricityRate || ""} onChange={(e) => set("electricityRate", e.target.value)} sx={inputSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Đơn Giá Nước (đ/m³)</Typography>
              <Box component="input" type="number" value={form.waterRate || ""} onChange={(e) => set("waterRate", e.target.value)} sx={inputSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Phí Dịch Vụ & Rác (đ/tháng)</Typography>
              <Box component="input" type="number" value={form.serviceFee || ""} onChange={(e) => set("serviceFee", e.target.value)} sx={inputSx} />
            </Box>
          </Box>
        </Box>

        {/* 2. Ngân hàng VietQR */}
        <Box sx={sectionSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
            <CreditCardIcon sx={{ fontSize: 18, color: "#2563eb" }} />
            <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.875rem" }}>2. Thông Tin Ngân Hàng Tích Hợp VietQR Automate</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tên Ngân Hàng (Mã BIN)</Typography>
              <Box component="input" placeholder="MBBank / Vietcombank / Techcombank" value={form.bankName || ""} onChange={(e) => set("bankName", e.target.value)} sx={inputSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số Tài Khoản</Typography>
              <Box component="input" placeholder="0988776655" value={form.bankAccount || ""} onChange={(e) => set("bankAccount", e.target.value)} sx={{ ...inputSx, fontFamily: "monospace" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tên Chủ Tài Khoản (VIETIN)</Typography>
              <Box component="input" placeholder="NGUYEN VAN A" value={form.bankHolder || ""} onChange={(e) => set("bankHolder", e.target.value)} sx={{ ...inputSx, textTransform: "uppercase", fontWeight: 800 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Chi Nhánh Ngân Hàng</Typography>
              <Box component="input" placeholder="Chi nhánh Hà Nội" value={form.bankBranch || ""} onChange={(e) => set("bankBranch", e.target.value)} sx={inputSx} />
            </Box>
          </Box>
        </Box>

        {/* 3. Zalo OA */}
        <Box sx={sectionSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
            <MessageIcon sx={{ fontSize: 18, color: "#2563eb" }} />
            <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.875rem" }}>3. Cấu Hình Tự Động Hóa Zalo Official Account (Zalo OA)</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Zalo Official Account ID</Typography>
              <Box component="input" value={form.zaloOaId || ""} onChange={(e) => set("zaloOaId", e.target.value)} sx={inputSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Zalo Access Token</Typography>
              <Box component="input" type="password" value={form.zaloAccessToken || ""} onChange={(e) => set("zaloAccessToken", e.target.value)} sx={{ ...inputSx, fontFamily: "monospace" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ngày Chốt Hóa Đơn Hàng Tháng</Typography>
              <Box component="input" type="number" min="1" max="31" value={form.invoiceClosingDay || ""} onChange={(e) => set("invoiceClosingDay", e.target.value)} sx={inputSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ngày Nhắc Nợ Tự Động</Typography>
              <Box component="input" type="number" min="1" max="31" value={form.defaultRemindDay || ""} onChange={(e) => set("defaultRemindDay", e.target.value)} sx={inputSx} />
            </Box>
          </Box>
        </Box>

        {/* 4. Chủ trọ */}
        <Box sx={sectionSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
            <PersonIcon sx={{ fontSize: 18, color: "#2563eb" }} />
            <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.875rem" }}>4. Thông Tin Chủ Trọ Quản Lý</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Họ & Tên Chủ Trọ</Typography>
              <Box component="input" value={form.landlordName || ""} onChange={(e) => set("landlordName", e.target.value)} sx={inputSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số Điện Thoại Liên Hệ</Typography>
              <Box component="input" value={form.landlordPhone || ""} onChange={(e) => set("landlordPhone", e.target.value)} sx={inputSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Email Thông Báo</Typography>
              <Box component="input" type="email" value={form.landlordEmail || ""} onChange={(e) => set("landlordEmail", e.target.value)} sx={inputSx} />
            </Box>
          </Box>
        </Box>

        {/* Save */}
        <Box sx={{ textAlign: "right" }}>
          <Box component="button" type="submit"
            sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 4, py: 1.5, bgcolor: "#2563eb", color: "#fff", fontWeight: 700, fontSize: "0.75rem", borderRadius: "12px", border: "none", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}
          >
            <SaveIcon sx={{ fontSize: 16 }} />
            <span>Lưu Cập Nhật Cấu Hình Hệ Thống</span>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
