"use client";

import { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import GaugeIcon from "@mui/icons-material/Speed";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const cardSx = {
  bgcolor: "#fff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  mb: 3,
};

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function InitialMeterForm({ roomNumber, onSaved }) {
  const [elec, setElec] = useState("");
  const [water, setWater] = useState("");
  const [elecPreview, setElecPreview] = useState("");
  const [waterPreview, setWaterPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await readFileAsBase64(file);
    if (type === "elec") setElecPreview(base64);
    else setWaterPreview(base64);
  };

  const handleSubmit = async () => {
    setError("");
    if (!elec || !water) {
      setError("Vui lòng nhập chỉ số ban đầu của cả điện và nước.");
      return;
    }
    if (!elecPreview || !waterPreview) {
      setError("Vui lòng chụp/upload ảnh đồng hồ điện và đồng hồ nước.");
      return;
    }
    try {
      setSaving(true);
      await onSaved({ electricity: Number(elec), water: Number(water), electricityPhoto: elecPreview, waterPhoto: waterPreview });
    } catch {
      setError("Lưu không thành công. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const photoBox = (preview, label, onPick) => (
    <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mb: 1.5 }}>{label}</Typography>
      {preview ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box component="img" src={preview} alt={label}
            sx={{ width: 88, height: 88, objectFit: "cover", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
          <CheckCircleIcon sx={{ color: "#059669", fontSize: 20 }} />
        </Box>
      ) : (
        <Button component="label" variant="outlined" startIcon={<CameraAltIcon />} fullWidth
          sx={{ borderRadius: "12px", textTransform: "none", fontSize: "0.75rem", py: 1 }}>
          Chụp / Upload ảnh
          <input type="file" accept="image/*" hidden onChange={onPick} />
        </Button>
      )}
    </Box>
  );

  return (
    <Paper sx={cardSx}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1, mb: 2, borderBottom: "1px solid #e2e8f0" }}>
          <GaugeIcon sx={{ color: "#059669", fontSize: 20 }} />
          <Typography variant="h6" fontWeight="bold" color="#0f172a">
            Nhập chỉ số ban đầu{roomNumber ? ` - Phòng ${roomNumber}` : ""}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: 2, lineHeight: 1.6 }}>
          Bạn đang là khách thuê mới. Vui lòng nhập chỉ số điện, nước ban đầu khi nhận phòng và upload ảnh chụp đồng hồ
          làm bằng chứng. Các chỉ số này sẽ được dùng làm <b>chỉ số cũ</b> cho các kỳ hóa đơn tiếp theo.
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
          <TextField fullWidth label="Chỉ số điện ban đầu (kWh)" type="number" value={elec}
            onChange={(e) => setElec(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          <TextField fullWidth label="Chỉ số nước ban đầu (m³)" type="number" value={water}
            onChange={(e) => setWater(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
          {photoBox(elecPreview, "Ảnh đồng hồ điện", (e) => handleFile(e, "elec"))}
          {photoBox(waterPreview, "Ảnh đồng hồ nước", (e) => handleFile(e, "water"))}
        </Box>

        {error && (
          <Typography sx={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600, mb: 1.5 }}>⚠ {error}</Typography>
        )}

        <Box sx={{ textAlign: "right" }}>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}
            sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#065f46" }, borderRadius: "12px", textTransform: "none", px: 4 }}>
            {saving ? "Đang lưu..." : "Lưu chỉ số ban đầu"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
