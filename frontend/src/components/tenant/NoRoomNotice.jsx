"use client";

import { Box, Typography } from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { tokens as t } from "../../design/tokens";

export default function NoRoomNotice({
  title = "Bạn chưa được gán phòng",
  subtitle = "Vui lòng liên hệ chủ trọ để được thêm vào phòng và lập hợp đồng.",
}) {
  return (
    <Box
      className="reveal"
      sx={{
        p: 5,
        borderRadius: t.radius.xl,
        border: `1px dashed ${t.colors.hair}`,
        bgcolor: t.colors.surface,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: t.colors.accentSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.colors.accentStrong,
        }}
      >
        <HomeWorkIcon sx={{ fontSize: 28 }} />
      </Box>
      <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: t.colors.ink }}>{title}</Typography>
      <Typography sx={{ fontSize: "0.8125rem", color: t.colors.muted, maxWidth: 420, fontWeight: 500 }}>
        {subtitle}
      </Typography>
    </Box>
  );
}
