"use client";

import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, IconButton } from "@mui/material";

const CloseIcon = ({ onClick }) => (
  <IconButton onClick={onClick} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </IconButton>
);

export default function ReadingModal({ invoice, onClose, onSave }) {
  const [elec, setElec] = useState(0);
  const [water, setWater] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (invoice) {
      setElec(invoice.newElectricity || invoice.oldElectricity || 0);
      setWater(invoice.newWater || invoice.oldWater || 0);
      setError("");
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (elec < (invoice.oldElectricity || 0)) {
      setError("Chỉ số điện mới không được nhỏ hơn chỉ số cũ!");
      return;
    }
    if (water < (invoice.oldWater || 0)) {
      setError("Chỉ số nước mới không được nhỏ hơn chỉ số cũ!");
      return;
    }
    try {
      await onSave(invoice.id, elec, water);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi lưu chỉ số");
    }
  };

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
      <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 460, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "#2563eb", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
            Nhập Chỉ Số - Phòng {invoice.contract?.room?.room_number || ""}
          </Typography>
          <CloseIcon onClick={onClose} />
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {error && (
            <Box sx={{ p: 1.5, bgcolor: "#ffe4e6", color: "#be123c", fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px", border: "1px solid #fecaca" }}>{error}</Box>
          )}
          <Box sx={{ p: 1.75, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", fontSize: "0.75rem", color: "#475569" }}>
            Chỉ số tháng trước: Điện: <strong style={{ color: "#0f172a" }}>{invoice.oldElectricity || 0} kWh</strong> | Nước: <strong style={{ color: "#0f172a" }}>{invoice.oldWater || 0} m³</strong>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Chỉ Số Điện Mới (kWh)</Typography>
            <TextField fullWidth size="small" type="number" required value={elec}
              onChange={(e) => setElec(Number(e.target.value))}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Chỉ Số Nước Mới (m³)</Typography>
            <TextField fullWidth size="small" type="number" required value={water}
              onChange={(e) => setWater(Number(e.target.value))}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1 }}>
            <Button onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px" }}>Hủy</Button>
            <Button type="submit" variant="contained" sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px" }}>
              Tính & Gửi Hóa Đơn
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
