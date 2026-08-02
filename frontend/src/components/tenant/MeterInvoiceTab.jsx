"use client";

import { Box, Typography, TextField, Paper, Button } from "@mui/material";
import { VietQR } from "@viet-qr/react";
import { formatCurrency } from "../../utils/format";
import { resolveBankInfo } from "../../utils/vietqr";

export default function MeterInvoiceTab({
  contract, settings, monthStr,
  elecVal, setElecVal, waterVal, setWaterVal,
  warningMsg, submitSuccess,
  calcElecUsage, calcWaterUsage, calcElecAmount, calcWaterAmount, calcTotal,
  electricityRate, waterRate, roomPrice,
  handlePhotoUpload, handleMeterSubmit,
  getVietQRContent,
  submitting, elecPhoto, waterPhoto,
}) {
  const s = settings?.settings || {};

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
      {/* Meter Input Form */}
      <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a" }}>
              Nhập Chỉ Số Điện & Nước Tháng {monthStr}
            </Typography>
          </Box>
        </Box>

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
                Chỉ số cũ: <Box component="span" sx={{ fontWeight: 700, color: "#0f172a" }}>{Math.round(Number(contract?.lastElectricity || 0))}</Box>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button component="label" variant="contained" sx={{ px: 2.5, py: 1, fontSize: "0.6875rem", fontWeight: 700, borderRadius: "10px", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Chụp / Upload ảnh
                <input type="file" accept="image/*" hidden onChange={(e) => handlePhotoUpload(e, "electricity")} />
              </Button>
              <TextField fullWidth size="small" type="number" value={elecVal} required
                onChange={(e) => setElecVal(Number(e.target.value))}
                sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#fff", borderRadius: "10px", fontWeight: 800 } }} />
            </Box>
            {elecPhoto && (
              <Typography sx={{ mt: 1, fontSize: "0.625rem", color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Đã có ảnh đồng hồ điện
              </Typography>
            )}
          </Box>

          {/* Water */}
          <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 0.75 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                Chỉ Số Nước (m³)
              </Typography>
              <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>
                Chỉ số cũ: <Box component="span" sx={{ fontWeight: 700, color: "#0f172a" }}>{Math.round(Number(contract?.lastWater || 0))}</Box>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button component="label" variant="contained" sx={{ px: 2.5, py: 1, fontSize: "0.6875rem", fontWeight: 700, borderRadius: "10px", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Chụp / Upload ảnh
                <input type="file" accept="image/*" hidden onChange={(e) => handlePhotoUpload(e, "water")} />
              </Button>
              <TextField fullWidth size="small" type="number" value={waterVal} required
                onChange={(e) => setWaterVal(Number(e.target.value))}
                sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#fff", borderRadius: "10px", fontWeight: 800 } }} />
            </Box>
            {waterPhoto && (
              <Typography sx={{ mt: 1, fontSize: "0.625rem", color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Đã có ảnh đồng hồ nước
              </Typography>
            )}
          </Box>

          {/* Estimate */}
          <Box sx={{ p: 2.5, bgcolor: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#475569" }}>Tiền phòng:</Typography>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a" }}>{formatCurrency(roomPrice)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#475569" }}>Tiền điện ({Math.round(calcElecUsage)} kWh x {formatCurrency(electricityRate)}):</Typography>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a" }}>{formatCurrency(Math.round(calcElecAmount))}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#475569" }}>Tiền nước ({Math.round(calcWaterUsage)} m³ x {formatCurrency(waterRate)}):</Typography>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a" }}>{formatCurrency(Math.round(calcWaterAmount))}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #bfdbfe", pt: 1 }}>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 900, color: "#0f172a" }}>TỔNG CỘNG DỰ TÍNH:</Typography>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 900, color: "#2563eb" }}>{formatCurrency(calcTotal)}</Typography>
            </Box>
          </Box>

          <Button type="submit" variant="contained" disabled={submitting}
            sx={{ width: "100%", py: 1.5, fontSize: "0.75rem", fontWeight: 700, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            {submitting ? "Đang gửi..." : "Gửi Chỉ Số & Chốt Hóa Đơn Mới"}
          </Button>
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
          <VietQR
            bankId={resolveBankInfo(s.bankName)?.bin || "970422"}
            accountNo={s.bankAccount || "0988776655"}
            accountName={s.bankHolder || "CHU TRO"}
            amount={calcTotal}
            content={getVietQRContent()}
            renderAs="svg"
            size={224}
          />
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
  );
}
