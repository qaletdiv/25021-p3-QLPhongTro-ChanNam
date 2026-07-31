"use client";

import { useState, useEffect } from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";

const inputSx = {
  "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" }, "&:hover fieldset": { borderColor: "#cbd5e1" }, "&.Mui-focused fieldset": { borderColor: "#2563eb" } },
};

export default function FurnitureModal({ open, editItem, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", note: "", default_quantity: 1 });

  useEffect(() => {
    if (open) {
      setForm(editItem
        ? { name: editItem.name, note: editItem.note || "", default_quantity: editItem.default_quantity }
        : { name: "", note: "", default_quantity: 1 });
    }
  }, [open, editItem]);

  if (!open) return null;

  const handleSave = () => {
    onSave(editItem, form);
  };

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
      <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 460, overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{ bgcolor: "#2563eb", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <InventoryIcon sx={{ color: "#fff", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
              {editItem ? "Sửa Vật Dụng" : "Thêm Vật Dụng Mới"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </IconButton>
        </Box>

        {/* Form */}
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tên Vật Dụng *</Typography>
            <TextField fullWidth size="small" placeholder="Ví dụ: Điều hòa Inverter 1.5 HP"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={inputSx} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ghi Chú Mô Tả</Typography>
            <TextField fullWidth size="small" placeholder="Ví dụ: Mới 99%, đầy đủ phụ kiện"
              value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
              sx={inputSx} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số Lượng Mặc Định</Typography>
            <TextField fullWidth size="small" type="number" slotProps={{ htmlInput: { min: 1 } }}
              value={form.default_quantity} onChange={(e) => setForm({ ...form, default_quantity: Number(e.target.value) })}
              sx={inputSx} />
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Box onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
          <Box onClick={handleSave} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            Lưu Thông Tin
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
