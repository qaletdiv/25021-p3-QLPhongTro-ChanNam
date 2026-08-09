"use client";

import { Box, Typography } from "@mui/material";
import { tokens as t } from "../../design/tokens";

export default function TenantPageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <Box
      className="reveal"
      sx={{
        mb: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography
            sx={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: t.colors.accentStrong,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 0.75,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography
          className="font-display"
          sx={{
            fontSize: { xs: "1.6rem", sm: "2rem" },
            fontWeight: 600,
            color: t.colors.ink,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: t.type.sm, color: t.colors.muted, mt: 0.5, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box className="reveal">{action}</Box>}
    </Box>
  );
}