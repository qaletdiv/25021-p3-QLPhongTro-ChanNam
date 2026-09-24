"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Box, IconButton } from "@mui/material";
import { resolveImageSrc } from "../../utils/imageUrl";

// Thumbnail ảnh đơn hồ + lightbox phóng to. Dùng cho bảng lịch sử hóa đơn của
// tenant (sửa BUG_009: ảnh chỉ số điện/nước đã gửi không hiển thị ở các màn).
export default function TenantInvoicePhoto({ photo, alt }) {
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(false);
  if (!photo || failed) {
    return <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>—</span>;
  }
  return (
    <>
      <Box
        component="img"
        src={resolveImageSrc(photo)}
        alt={alt}
        onError={() => setFailed(true)}
        onClick={() => setZoom(true)}
        sx={{
          width: 56, height: 56, objectFit: "cover", borderRadius: "8px",
          border: "1px solid #e2e8f0", display: "block", cursor: "zoom-in",
          transition: "transform 0.15s", "&:hover": { transform: "scale(1.05)" },
        }}
      />
      {zoom && createPortal(
        <Box
          onClick={() => setZoom(false)}
          sx={{ position: "fixed", inset: 0, zIndex: 2000, bgcolor: "rgba(2,6,23,0.85)", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}
        >
          <IconButton
            onClick={() => setZoom(false)}
            sx={{ position: "absolute", top: 16, right: 16, bgcolor: "#e11d48", color: "#fff", "&:hover": { bgcolor: "#be123c" } }}
            title="Đóng"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </IconButton>
          <Box
            component="img"
            src={resolveImageSrc(photo)}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            sx={{ maxWidth: "min(85vw, 640px)", maxHeight: "min(80vh, 520px)", objectFit: "contain", display: "block", bgcolor: "#0f172a", borderRadius: "16px" }}
          />
        </Box>,
        document.body
      )}
    </>
  );
}
