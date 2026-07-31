"use client";

import { Box, Typography, TextField } from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ModalShell from "../ui/ModalShell";
import { inputSx } from "../../utils/styles";

export default function RoomFormModal({ open, editRoom, form, setForm, onClose, onSave }) {
  if (!open) return null;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <ModalShell open={open} onClose={onClose} headerBg="#0f172a"
      header={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <MeetingRoomIcon sx={{ color: "#fcd34d", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
            {editRoom ? "Cập Nhật Phòng" : "Thêm Phòng Trọ Mới"}
          </Typography>
        </Box>
      }
      body={
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
      }
      footer={
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Box onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
          <Box onClick={onSave} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            {editRoom ? "Cập Nhật" : "Lưu Phòng Mới"}
          </Box>
        </Box>
      }
    />
  );
}
