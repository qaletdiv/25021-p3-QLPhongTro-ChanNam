"use client";

import { useState } from "react";
import { Box, Paper, IconButton } from "@mui/material";
import PrinterIcon from "@mui/icons-material/Print";
import { formatCurrency } from "../../utils/format";

const HEADERS = ["Phòng / Khách", "Tiền Phòng", "Tiền Điện (kWh)", "Hình Điện T.Này", "Hình Điện T.Trước", "Tiền Nước (m³)", "Hình Nước T.Này", "Hình Nước T.Trước", "Dịch Vụ", "Tổng Cộng", "Trạng Thái", ""];

const StatusBadge = ({ status }) => {
  if (status === "paid") {
    return (
      <span style={{ padding: "4px 10px", backgroundColor: "#d1fae5", color: "#065f46", fontSize: "0.6875rem", fontWeight: 800, borderRadius: "9999px", border: "1px solid #a7f3d0", display: "inline-flex", alignItems: "center", gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#059669", display: "inline-block" }} />
        Đã Thanh Toán
      </span>
    );
  }
  if (status === "submitted") {
    return (
      <span style={{ padding: "4px 10px", backgroundColor: "#fef3c7", color: "#92400e", fontSize: "0.6875rem", fontWeight: 800, borderRadius: "9999px", border: "1px solid #fde68a", display: "inline-flex", alignItems: "center", gap: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#d97706", display: "inline-block" }} />
        Đã Gửi Chỉ Số
      </span>
    );
  }
  return (
    <span style={{ padding: "4px 10px", backgroundColor: "#f1f5f9", color: "#475569", fontSize: "0.6875rem", fontWeight: 800, borderRadius: "9999px", border: "1px solid #e2e8f0" }}>
      ○ Chờ Thu Tiền
    </span>
  );
};

const ActionButton = ({ label, bgcolor, hover, onClick, disabled }) => (
  <Box onClick={disabled ? undefined : onClick} sx={{ display: "inline-flex", px: 1.25, py: 0.75, bgcolor: disabled ? "#cbd5e1" : bgcolor, color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", "&:hover": disabled ? {} : { bgcolor: hover }, mr: 0.5 }}>
    {label}
  </Box>
);

const PhotoCell = ({ photo, alt, onView }) => (
  <td style={{ padding: "12px 16px" }}>
    {photo ? (
      <img
        src={photo}
        alt={alt}
        onClick={() => onView(photo, alt)}
        style={{ width: 64, height: 64, objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0", display: "block", cursor: "zoom-in", transition: "transform 0.15s" }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      />
    ) : (
      <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>—</span>
    )}
  </td>
);

const PhotoLightbox = ({ photo, alt, onClose }) => (
  <Box
    onClick={onClose}
    sx={{ position: "fixed", inset: 0, zIndex: 1400, bgcolor: "rgba(2,6,23,0.8)", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}
  >
    <IconButton
      onClick={onClose}
      sx={{ position: "absolute", top: 16, right: 16, bgcolor: "#e11d48", color: "#fff", width: 40, height: 40, boxShadow: "0 4px 12px rgba(225,29,72,0.4)", "&:hover": { bgcolor: "#be123c" } }}
      title="Đóng"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </IconButton>
    <Box sx={{ maxWidth: "min(85vw, 640px)", maxHeight: "min(80vh, 520px)", overflow: "hidden", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.6)" }}>
      <img src={photo} alt={alt} style={{ maxWidth: "min(85vw, 640px)", maxHeight: "min(80vh, 520px)", objectFit: "contain", display: "block", background: "#0f172a" }} />
    </Box>
  </Box>
);

const InvoiceRow = ({ inv, prev, onMarkPaid, onRemind, onPrint, onViewPhoto }) => (
  <tr style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
  >
    <td style={{ padding: "12px 16px" }}>
      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.8125rem" }}>Phòng {inv.contract?.room?.room_number || "—"}</div>
      <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>{inv.contract?.tenant?.name || "—"} ({inv.month})</div>
      {inv.contract?.room?.building?.name && (
        <div style={{ fontSize: "0.625rem", color: "#2563eb", fontWeight: 600 }}>{inv.contract.room.building.name}</div>
      )}
    </td>
    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>{formatCurrency(inv.roomPrice)}</td>
    <td style={{ padding: "12px 16px" }}>
      <div style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(Math.round(Number(inv.electricityCost || 0)))}</div>
      <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontFamily: "monospace" }}>
        {Math.round(Number(inv.electricityOld || 0))} → {Math.round(Number(inv.electricityNew || 0))} ({Math.round(Number(inv.electricityNew || 0)) - Math.round(Number(inv.electricityOld || 0))} kWh)
      </div>
    </td>
    <PhotoCell photo={inv.electricityPhoto} alt="Ảnh đồng hồ điện" onView={onViewPhoto} />
    <PhotoCell photo={prev?.electricityPhoto || inv.contract?.initialElectricityPhoto} alt="Ảnh đồng hồ điện tháng trước" onView={onViewPhoto} />
    <td style={{ padding: "12px 16px" }}>
      <div style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(Math.round(Number(inv.waterCost || 0)))}</div>
      <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontFamily: "monospace" }}>
        {Math.round(Number(inv.waterOld || 0))} → {Math.round(Number(inv.waterNew || 0))} ({Math.round(Number(inv.waterNew || 0)) - Math.round(Number(inv.waterOld || 0))} m³)
      </div>
    </td>
    <PhotoCell photo={inv.waterPhoto} alt="Ảnh đồng hồ nước" onView={onViewPhoto} />
    <PhotoCell photo={prev?.waterPhoto || inv.contract?.initialWaterPhoto} alt="Ảnh đồng hồ nước tháng trước" onView={onViewPhoto} />
    <td style={{ padding: "12px 16px", color: "#475569" }}>{formatCurrency(inv.serviceFee + inv.otherFees)}</td>
    <td style={{ padding: "12px 16px", fontWeight: 800, color: "#2563eb", fontSize: "0.8125rem" }}>{formatCurrency(inv.total)}</td>
    <td style={{ padding: "12px 16px" }}>
      <StatusBadge status={inv.status} />
    </td>
    <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
      {inv.status !== "paid" && (
        <>
          <ActionButton label="Thu Tiền" bgcolor="#059669" hover="#047857" onClick={() => onMarkPaid(inv.id)} />
          <ActionButton label="Nhắc Zalo" bgcolor="#d97706" hover="#b45309" onClick={() => onRemind(inv.id)} />
        </>
      )}
      <IconButton size="small" onClick={() => onPrint(inv)} sx={{ color: "#64748b", "&:hover": { color: "#0f172a", bgcolor: "#f1f5f9" } }}>
        <PrinterIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </td>
  </tr>
);

export default function InvoiceTable({ invoices, onMarkPaid, onRemind, onPrint }) {
  const [lightbox, setLightbox] = useState(null);

  const handleViewPhoto = (photo, alt) => setLightbox({ photo, alt });

  return (
    <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {HEADERS.map((h) => (
                <th key={h} style={{ padding: "12px 16px", fontWeight: 700, color: "#475569", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "" ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, idx) => {
              let prev = null;
              for (let j = idx + 1; j < invoices.length; j++) {
                if (invoices[j].contractId === inv.contractId) { prev = invoices[j]; break; }
              }
              return (
                <InvoiceRow key={inv.id} inv={inv} prev={prev} onMarkPaid={onMarkPaid} onRemind={onRemind} onPrint={onPrint} onViewPhoto={handleViewPhoto} />
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={12} style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>Chưa có hóa đơn nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
      {lightbox && (
        <PhotoLightbox photo={lightbox.photo} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </Paper>
  );
}
