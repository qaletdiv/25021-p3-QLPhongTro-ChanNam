"use client";

import { Box, Typography } from "@mui/material";
import ModalShell from "./ModalShell";

export default function ConfirmDialog({ open, title, message, confirmText = "Xóa", onClose, onConfirm, danger = true }) {
  if (!open) return null;

  return (
    <ModalShell open={open} onClose={onClose} headerBg={danger ? "#e11d48" : "#0f172a"} maxWidth={440}
      header={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
            {title}
          </Typography>
        </Box>
      }
      body={
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.6 }}>
            {message}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1 }}>
            <Box onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
            <Box onClick={onConfirm} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 800, bgcolor: danger ? "#e11d48" : "#0f172a", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: danger ? "#be123c" : "#1e293b" }, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
              {confirmText}
            </Box>
          </Box>
        </Box>
      }
    />
  );
}
