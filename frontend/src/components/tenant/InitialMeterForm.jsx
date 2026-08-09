"use client";

import { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import GaugeIcon from "@mui/icons-material/Speed";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { resizeImage } from "../../utils/image";
import { tokens as t } from "../../design/tokens";

export default function InitialMeterForm({ roomNumber, onSaved }) {
  const [elec, setElec] = useState("");
  const [water, setWater] = useState("");
  const [elecPreview, setElecPreview] = useState("");
  const [waterPreview, setWaterPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handlePhoto = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      if (type === "elec") setElecPreview(resized);
      else setWaterPreview(resized);
    } catch {
      setError("Không đọc được ảnh, vui lòng thử lại.");
    } finally {
      e.target.value = "";
    }
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
    <Box sx={{ p: 2, bgcolor: t.colors.surface2, borderRadius: t.radius.md, border: `1px solid ${t.colors.hair}` }}>
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: t.colors.ink, mb: 1.5 }}>{label}</Typography>
      {preview ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box component="img" src={preview} alt={label}
            sx={{ width: 88, height: 88, objectFit: "cover", borderRadius: t.radius.md, border: `1px solid ${t.colors.hair}` }} />
          <CheckCircleIcon sx={{ color: t.colors.accentStrong, fontSize: 20 }} />
        </Box>
      ) : (
        <Button component="label" variant="outlined" startIcon={<CameraAltIcon />} fullWidth
          sx={{ borderRadius: t.radius.md, textTransform: "none", fontSize: "0.75rem", py: 1 }}>
          Chụp / Upload ảnh
          <input type="file" accept="image/*" hidden onChange={onPick} />
        </Button>
      )}
    </Box>
  );

  return (
    <Paper className="reveal" sx={{ borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}`, boxShadow: t.shadow.sm }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1, mb: 2, borderBottom: `1px solid ${t.colors.hairSoft}` }}>
          <GaugeIcon sx={{ color: t.colors.accent, fontSize: 20 }} />
          <Typography className="font-display" sx={{ fontSize: "1.0625rem", fontWeight: 600, color: t.colors.ink }}>
            Nhập chỉ số ban đầu{roomNumber ? ` - Phòng ${roomNumber}` : ""}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.75rem", color: t.colors.muted, mb: 2, lineHeight: 1.6 }}>
          Bạn đang là khách thuê mới. Vui lòng nhập chỉ số điện, nước ban đầu khi nhận phòng và upload ảnh chụp đồng hồ
          làm bằng chứng. Các chỉ số này sẽ được dùng làm <b>chỉ số cũ</b> cho các kỳ hóa đơn tiếp theo.
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
          {photoBox(elecPreview, "Ảnh đồng hồ điện", (e) => handlePhoto(e, "elec"))}
          {photoBox(waterPreview, "Ảnh đồng hồ nước", (e) => handlePhoto(e, "water"))}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
          <TextField fullWidth label="Chỉ số điện ban đầu (kWh)" type="number" value={elec}
            onChange={(e) => setElec(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          <TextField fullWidth label="Chỉ số nước ban đầu (m³)" type="number" value={water}
            onChange={(e) => setWater(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
        </Box>

        {error && (
          <Typography role="alert" sx={{ fontSize: "0.75rem", color: t.colors.danger, fontWeight: 600, mb: 1.5 }}>⚠ {error}</Typography>
        )}

        <Box sx={{ textAlign: "center" }}>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}
            sx={{ bgcolor: t.colors.accent, "&:hover": { bgcolor: t.colors.accentStrong }, borderRadius: t.radius.md, textTransform: "none", px: 4 }}>
            {saving ? "Đang lưu..." : "Lưu chỉ số ban đầu"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}