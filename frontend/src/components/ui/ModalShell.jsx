"use client";

import { Box, IconButton } from "@mui/material";

const CloseIconButton = ({ color = "rgba(255,255,255,0.7)", hoverColor = "#fff", onClick }) => (
  <IconButton onClick={onClick} sx={{ color, "&:hover": { color: hoverColor } }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </IconButton>
);

export default function ModalShell({
  open, onClose, headerBg = "#2563eb", maxWidth = 460,
  headerColor = "#fff", closeColor, closeHoverColor, headerRight,
  header, body, footer,
}) {
  if (!open) return null;

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
      <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {header && (
          <Box sx={{ bgcolor: headerBg, px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", color: headerColor }}>
            {header}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {headerRight}
              <CloseIconButton color={closeColor} hoverColor={closeHoverColor} onClick={onClose} />
            </Box>
          </Box>
        )}
        {body}
        {footer}
      </Box>
    </Box>
  );
}
