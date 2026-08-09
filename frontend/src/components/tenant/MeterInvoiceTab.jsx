"use client";

import { Box, Typography, TextField, Paper, Button } from "@mui/material";
import { VietQR } from "@viet-qr/react";
import { formatCurrency } from "../../utils/format";
import { resolveBankInfo } from "../../utils/vietqr";
import { tokens as t } from "../../design/tokens";

const PhotoPreview = ({ photo, label }) => (
  <Box sx={{ mt: 1.5, border: "1.5px dashed", borderColor: photo ? t.colors.accentHair : t.colors.hair, borderRadius: t.radius.md, p: 1, bgcolor: photo ? t.colors.accentSoft : "#fff", height: 200, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    {photo ? (
      <img src={photo} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }} />
    ) : (
      <Box sx={{ textAlign: "center", color: "#94a3b8" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 6px", display: "block" }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
        <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600 }}>Chưa có ảnh {label}</Typography>
      </Box>
    )}
  </Box>
);

const MeterBox = ({ icon, title, unit, oldValue, photo, photoLabel, value, setValue, handlePhotoUpload, type }) => (
  <Paper sx={{ p: 2.5, bgcolor: t.colors.surface2, borderRadius: t.radius.md, border: `1px solid ${t.colors.hair}` }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: t.colors.ink, display: "flex", alignItems: "center", gap: 0.75 }}>
        {icon}
        {title}
      </Typography>
      <Typography sx={{ fontSize: "0.6875rem", color: t.colors.muted, fontWeight: 500 }}>
        Chỉ số cũ: <Box component="span" className="font-mono" sx={{ fontWeight: 700, color: t.colors.ink }}>{Math.round(Number(oldValue || 0))}</Box>
      </Typography>
    </Box>
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button component="label" variant="contained" color="success" sx={{ px: 2.5, py: 1, fontSize: "0.6875rem", fontWeight: 700, borderRadius: "10px", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 1 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        Chụp / Upload ảnh
        <input type="file" accept="image/*" hidden onChange={(e) => handlePhotoUpload(e, type)} />
      </Button>
      <TextField fullWidth size="small" type="number" value={value} required
        onChange={(e) => setValue(Math.max(0, Number(e.target.value) || 0))}
        inputProps={{ min: 0, step: 1 }}
        placeholder={unit}
        sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#fff", borderRadius: "10px", fontWeight: 700 } }} />
    </Box>
    <PhotoPreview photo={photo} label={photoLabel} />
  </Paper>
);

const LedgerRow = ({ label, value, mono }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
    <Typography sx={{ color: t.colors.muted, fontWeight: 500 }}>{label}</Typography>
    <Typography className={mono ? "font-mono" : undefined} sx={{ fontWeight: 700, color: t.colors.ink }}>{value}</Typography>
  </Box>
);

export default function MeterInvoiceTab({
  contract, settings, monthStr,
  elecVal, setElecVal, waterVal, setWaterVal,
  warningMsg, submitSuccess,
  calcElecUsage, calcWaterUsage, calcElecAmount, calcWaterAmount, calcTotal,
  electricityRate, waterRate, roomPrice, serviceFee,
  handlePhotoUpload, handleMeterSubmit,
  getVietQRContent,
  submitting, elecPhoto, waterPhoto,
}) {
  const s = settings?.settings || {};

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Top panel: electricity (left) + water (right) */}
      <Paper className="reveal" sx={{ p: 3, borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}`, boxShadow: t.shadow.sm }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${t.colors.hairSoft}`, pb: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.colors.accent} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <Typography className="font-display" sx={{ fontSize: "1.0625rem", fontWeight: 600, color: t.colors.ink }}>
              Nhập Chỉ Số Điện & Nước Tháng {monthStr}
            </Typography>
          </Box>
        </Box>

        {warningMsg && (
          <Box role="alert" sx={{ p: 2, bgcolor: t.colors.amberSoft, color: "#92400e", fontSize: "0.75rem", fontWeight: 700, borderRadius: t.radius.md, border: `1px solid #fde68a`, mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.colors.amber} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>{warningMsg}</span>
          </Box>
        )}
        {submitSuccess && (
          <Box role="status" sx={{ p: 2, bgcolor: t.colors.accentSoft, color: t.colors.accent, fontSize: "0.75rem", fontWeight: 700, borderRadius: t.radius.md, border: `1px solid ${t.colors.accentHair}`, mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.colors.accentStrong} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>{submitSuccess}</span>
          </Box>
        )}

        <Box component="form" id="meter-form" onSubmit={handleMeterSubmit}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
            <MeterBox
              type="electricity"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.colors.amber} strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
              title="Chỉ Số Điện (kWh)" unit="kWh"
              oldValue={contract?.lastElectricity}
              photo={elecPhoto} photoLabel="đồng hồ điện"
              value={elecVal} setValue={setElecVal} handlePhotoUpload={handlePhotoUpload}
            />
            <MeterBox
              type="water"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.colors.accentStrong} strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>}
              title="Chỉ Số Nước (m³)" unit="m³"
              oldValue={contract?.lastWater}
              photo={waterPhoto} photoLabel="đồng hồ nước"
              value={waterVal} setValue={setWaterVal} handlePhotoUpload={handlePhotoUpload}
            />
          </Box>
        </Box>
      </Paper>

      {/* Bottom panel: QR code (left) + bank info & submit (right) */}
      <Paper className="reveal" sx={{ p: 3, borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}`, boxShadow: t.shadow.sm }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3, alignItems: "center" }}>
          {/* Left: QR code */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
            <Typography className="font-display" sx={{ fontSize: "1.0625rem", fontWeight: 600, color: t.colors.ink }}>Mã QR Thanh Toán VietQR</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: t.colors.muted, fontWeight: 500, textAlign: "center" }}>
              Quét bằng ứng dụng Ngân hàng (MB, VCB, Techcombank...) để thanh toán ngay.
            </Typography>
            <Box sx={{ p: 2, bgcolor: t.colors.surface2, borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}` }}>
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
          </Box>

          {/* Right: bank info + amount + submit */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ width: "100%", fontSize: "0.75rem", bgcolor: t.colors.surface2, p: 2.5, borderRadius: t.radius.md, border: `1px solid ${t.colors.hair}` }}>
              <LedgerRow label="Ngân hàng:" value={s.bankName || "MBBank"} />
              <LedgerRow label="Số tài khoản:" value={s.bankAccount || "0988776655"} mono />
              <LedgerRow label="Chủ tài khoản:" value={s.bankHolder || "CHU TRO"} />
              <LedgerRow label="Tiền phòng:" value={formatCurrency(roomPrice)} />
              <LedgerRow label={`Tiền điện (${Math.round(calcElecUsage)} kWh x ${formatCurrency(electricityRate)}):`} value={formatCurrency(Math.round(calcElecAmount))} />
              <LedgerRow label={`Tiền nước (${Math.round(calcWaterUsage)} m³ x ${formatCurrency(waterRate)}):`} value={formatCurrency(Math.round(calcWaterAmount))} />
              <LedgerRow label="Tiền dịch vụ:" value={formatCurrency(serviceFee)} />
              <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${t.colors.hair}`, pt: 1.5, color: t.colors.accent }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>Số tiền chuyển:</Typography>
                <Typography className="font-mono" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>{formatCurrency(calcTotal)}</Typography>
              </Box>
            </Box>

            <Button type="submit" form="meter-form" variant="contained" color="success" disabled={submitting}
              sx={{ width: "100%", py: 1.5, fontSize: "0.75rem", fontWeight: 700, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {submitting ? "Đang gửi..." : "Thanh toán và gửi chỉ số"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}