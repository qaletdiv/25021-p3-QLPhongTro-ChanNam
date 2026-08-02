"use client";

import { useState } from "react";
import { Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { VietQR } from "@viet-qr/react";
import InitialMeterForm from "./InitialMeterForm";
import { resolveBankInfo } from "../../utils/vietqr";
import { formatCurrency } from "../../utils/format";

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
      <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.025em" }}>
            Mã QR Thanh Toán Tiền Phòng
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5, fontWeight: 500 }}>
            Quét để thanh toán tiền thuê phòng tháng đầu khi nhận phòng (chưa gồm tiền điện, nước).
          </Typography>
        </Box>
        <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
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
            <Typography sx={{ fontWeight: 900, fontSize: "0.875rem" }}>{formatCurrency(roomPrice)}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Nhập chỉ số ban đầu */}
      <InitialMeterForm roomNumber={roomNumber} onSaved={beginSave} />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", color: "#0f172a", fontWeight: 800, fontSize: "1rem" }}>
          Bạn đã thanh toán tiền phòng chưa?
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", color: "#475569", fontSize: "0.875rem", lineHeight: 1.6 }}>
          Vui lòng quét mã QR bên trái và chuyển khoản đúng số tiền{" "}
          <Box component="span" sx={{ fontWeight: 800, color: "#2563eb" }}>{formatCurrency(roomPrice)}</Box> cho tháng
          đầu nhận phòng trước khi lưu chỉ số ban đầu.
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2.5 }}>
          <Button variant="outlined" color="warning" sx={{ borderRadius: "10px", fontWeight: 700 }} onClick={() => confirmSave(false)}>
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