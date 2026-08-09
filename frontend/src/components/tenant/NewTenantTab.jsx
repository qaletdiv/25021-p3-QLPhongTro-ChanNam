"use client";

import { useState } from "react";
import { Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { VietQR } from "@viet-qr/react";
import InitialMeterForm from "./InitialMeterForm";
import { resolveBankInfo } from "../../utils/vietqr";
import { formatCurrency } from "../../utils/format";
import { tokens as t } from "../../design/tokens";

const LedgerRow = ({ label, value, mono }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
    <Typography sx={{ color: t.colors.muted, fontWeight: 500 }}>{label}</Typography>
    <Typography className={mono ? "font-mono" : undefined} sx={{ fontWeight: 700, color: t.colors.ink }}>{value}</Typography>
  </Box>
);

export default function NewTenantTab({ settings, roomPrice, roomNumber, onSaveMeter }) {
  const s = settings?.settings || {};
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const beginSave = (payload) => {
    setPendingPayload(payload);
    setConfirmOpen(true);
  };

  const confirmSave = async (paid) => {
    setConfirmOpen(false);
    if (!paid || !pendingPayload) return;
    await onSaveMeter(pendingPayload);
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
      {/* VietQR - Tiền phòng tháng đầu */}
      <Paper className="reveal" sx={{ p: 3, borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}`, boxShadow: t.shadow.sm, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography className="font-display" sx={{ fontSize: "1.0625rem", fontWeight: 600, color: t.colors.ink }}>
            Mã QR Thanh Toán Tiền Phòng
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: t.colors.muted, mt: 0.5, fontWeight: 500 }}>
            Quét để thanh toán tiền thuê phòng tháng đầu khi nhận phòng (chưa gồm tiền điện, nước).
          </Typography>
        </Box>
        <Box sx={{ p: 2, bgcolor: t.colors.surface2, borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}` }}>
          <VietQR
            bankId={resolveBankInfo(s.bankName)?.bin || "970422"}
            accountNo={s.bankAccount || "0988776655"}
            accountName={s.bankHolder || "CHU TRO"}
            amount={roomPrice}
            content={`Thanh toan tien phong ${roomNumber || ""} thang dau`}
            renderAs="svg"
            size={224}
          />
        </Box>
        <Box sx={{ width: "100%", fontSize: "0.75rem", bgcolor: t.colors.surface2, p: 2.5, borderRadius: t.radius.md, border: `1px solid ${t.colors.hair}` }}>
          <LedgerRow label="Ngân hàng:" value={s.bankName || "MBBank"} />
          <LedgerRow label="Số tài khoản:" value={s.bankAccount || "0988776655"} mono />
          <LedgerRow label="Chủ tài khoản:" value={s.bankHolder || "CHU TRO"} />
          <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${t.colors.hair}`, pt: 1.5, color: t.colors.accent }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>Số tiền chuyển:</Typography>
            <Typography className="font-mono" sx={{ fontWeight: 700, fontSize: "0.875rem" }}>{formatCurrency(roomPrice)}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Nhập chỉ số ban đầu */}
      <InitialMeterForm roomNumber={roomNumber} onSaved={beginSave} />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", color: "#0f172a", fontWeight: 700, fontSize: "1rem" }}>
          Bạn đã thanh toán tiền phòng chưa?
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", color: "#475569", fontSize: "0.875rem", lineHeight: 1.6 }}>
          Vui lòng quét mã QR bên trái và chuyển khoản đúng số tiền{" "}
          <Box component="span" sx={{ fontWeight: 700, color: t.colors.accent }}>{formatCurrency(roomPrice)}</Box> cho tháng
          đầu nhận phòng trước khi lưu chỉ số ban đầu.
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2.5 }}>
          <Button color="inherit" sx={{ borderRadius: "10px", fontWeight: 700, color: "#64748b" }} onClick={() => confirmSave(false)}>
            Chưa thanh toán
          </Button>
          <Button variant="contained" color="success" sx={{ borderRadius: "10px", fontWeight: 700 }} onClick={() => confirmSave(true)}>
            Đã thanh toán
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}