"use client";

import { useState, useEffect } from "react";
import { Box, Typography, TextField } from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ModalShell from "../ui/ModalShell";
import { inputSx } from "../../utils/styles";

export default function BuildingModal({ open, editItem, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", address: "" });

  useEffect(() => {
    if (open) {
      setForm(editItem
        ? { name: editItem.name, address: editItem.address || "" }
        : { name: "", address: "" });
    }
  }, [open, editItem]);

  if (!open) return null;

  const handleSave = () => {
    onSave(editItem, form);
  };

  return (
    <ModalShell open={open} onClose={onClose}
      header={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ApartmentIcon sx={{ color: "#fff", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>
            {editItem ? "Sửa Nhà Trọ" : "Thêm Nhà Trọ Mới"}
          </Typography>
        </Box>
      }
      body={
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tên Nhà *</Typography>
            <TextField fullWidth size="small" placeholder="Ví dụ: Nhà 15 Nguyễn Văn Cừ"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={inputSx} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Địa Chỉ</Typography>
            <TextField fullWidth size="small" placeholder="Ví dụ: 15 Nguyễn Văn Cừ, Q.5, TP.HCM"
              value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              sx={inputSx} />
          </Box>
        </Box>
      }
      footer={
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Box onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
          <Box onClick={handleSave} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            {editItem ? "Cập Nhật" : "Lưu Nhà Mới"}
          </Box>
        </Box>
      }
    />
  );
}
