"use client";

import { Box, Typography, TextField, IconButton } from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

const inputSx = {
  "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" }, "&:hover fieldset": { borderColor: "#cbd5e1" }, "&.Mui-focused fieldset": { borderColor: "#2563eb" } },
};

export default function RoomFormModal({ open, editRoom, form, setForm, onClose, onSave }) {
  if (!open) return null;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
      <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 460, overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{ bgcolor: "#0f172a", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MeetingRoomIcon sx={{ color: "#fcd34d", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
              {editRoom ? "Cập Nhật Phòng" : "Thêm Phòng Trọ Mới"}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </IconButton>
        </Box>

        {/* Form */}
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số / Tên Phòng *</Typography>
            <TextField fullWidth size="small" placeholder="Ví dụ: 301" value={form.room_number}
              onChange={set("room_number")}
              sx={inputSx} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tầng</Typography>
              <TextField fullWidth size="small" type="number" value={form.floor}
                onChange={set("floor")}
                sx={inputSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Diện Tích (m²)</Typography>
              <TextField fullWidth size="small" type="number" value={form.area}
                onChange={set("area")}
                sx={inputSx} />
            </Box>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Giá Thuê (VND/Tháng)</Typography>
              <TextField fullWidth size="small" type="number" value={form.price}
                onChange={set("price")}
                sx={inputSx} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ngày Thu Tiền</Typography>
              <TextField fullWidth size="small" type="number" value={form.default_payment_day}
                onChange={set("default_payment_day")} slotProps={{ htmlInput: { min: 1, max: 31 } }}
                sx={inputSx} />
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Box onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
          <Box onClick={onSave} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            {editRoom ? "Cập Nhật" : "Lưu Phòng Mới"}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
