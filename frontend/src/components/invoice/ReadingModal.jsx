"use client";

import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import ModalShell from "../ui/ModalShell";

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
    <ModalShell open={!!invoice} onClose={onClose}
      header={
        <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
          Nhập Chỉ Số - Phòng {invoice.contract?.room?.room_number || ""}
        </Typography>
      }
      body={
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
      }
    />
  );
}
