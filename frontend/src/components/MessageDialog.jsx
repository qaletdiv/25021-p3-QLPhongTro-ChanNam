"use client";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

const config = {
  success: { icon: <CheckCircleIcon sx={{ fontSize: 52, color: "#059669" }} />, title: "Thành công", color: "success" },
  warning: { icon: <WarningAmberOutlinedIcon sx={{ fontSize: 52, color: "#d97706" }} />, title: "Cảnh báo", color: "warning" },
  error: { icon: <ErrorOutlinedIcon sx={{ fontSize: 52, color: "#e11d48" }} />, title: "Lỗi", color: "error" },
};

export default function MessageDialog({ open, severity = "success", message, onClose }) {
  const cfg = config[severity] || config.success;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pb: 0, bgcolor: "#ffffff", color: "#0f172a" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 1 }}>
          {cfg.icon}
          <Typography sx={{ fontSize: "1.125rem", fontWeight: 700 }}>{cfg.title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", pt: "24px !important", bgcolor: "#ffffff" }}>
        <Typography sx={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.6 }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", bgcolor: "#ffffff" }}>
        <Button
          variant="contained"
          color={cfg.color}
          onClick={onClose}
          sx={{ minWidth: 120, borderRadius: "10px", fontWeight: 700 }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
