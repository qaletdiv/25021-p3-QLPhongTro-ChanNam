"use client";

import { Box, Typography, Paper, IconButton } from "@mui/material";
import PrinterIcon from "@mui/icons-material/Print";
import { formatCurrency } from "../../utils/format";

const CloseIcon = ({ onClick, color }) => (
  <IconButton onClick={onClick} sx={{ color: color || "#94a3b8", "&:hover": { color: "#fff" } }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  </IconButton>
);

const Row = (inv) => [
  { label: "Tiền phòng", detail: "1 Tháng", amount: inv.roomPrice },
  { label: `Tiền điện (${formatCurrency(inv.electricityRate || 0)}/kWh)`, detail: `${inv.oldElectricity || 0} → ${inv.newElectricity || 0} (${(inv.newElectricity || 0) - (inv.oldElectricity || 0)} kWh)`, amount: inv.electricityCost },
  { label: `Tiền nước (${formatCurrency(inv.waterRate || 0)}/m³)`, detail: `${inv.oldWater || 0} → ${inv.newWater || 0} (${(inv.newWater || 0) - (inv.oldWater || 0)} m³)`, amount: inv.waterCost },
  { label: "Phí dịch vụ & rác", detail: "Cố định", amount: inv.serviceFee + inv.otherFees },
];

export default function PrintableInvoiceModal({ invoice, settings, onClose }) {
  if (!invoice) return null;

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
      <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box sx={{ bgcolor: "#0f172a", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>Phiếu Bảng Kê Thanh Toán & VietQR</Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Box onClick={() => window.print()} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.5, py: 0.9, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
              <PrinterIcon sx={{ fontSize: 14 }} />
              <span>In PDF</span>
            </Box>
            <CloseIcon onClick={onClose} />
          </Box>
        </Box>
        <Box sx={{ p: 3, overflow: "auto" }}>
          <Box sx={{ textAlign: "center", borderBottom: "1px solid #e2e8f0", pb: 2, mb: 3 }}>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>BẢNG KÊ TIỀN PHÒNG</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>Tháng {invoice.month}</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, p: 2, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", mb: 3, fontSize: "0.75rem" }}>
            <Box><span style={{ color: "#94a3b8" }}>Phòng:</span> <strong style={{ color: "#0f172a" }}>{invoice.contract?.room?.room_number || "—"}</strong></Box>
            <Box><span style={{ color: "#94a3b8" }}>Khách thuê:</span> <strong style={{ color: "#0f172a" }}>{invoice.contract?.tenant?.name || "—"}</strong></Box>
            <Box><span style={{ color: "#94a3b8" }}>Hạn thanh toán:</span> <strong style={{ color: "#0f172a" }}>Cuối tháng</strong></Box>
            <Box>
              <span style={{ color: "#94a3b8" }}>Trạng thái:</span>{" "}
              <strong style={{ color: invoice.status === "paid" ? "#059669" : "#d97706" }}>
                {invoice.status === "paid" ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
              </strong>
            </Box>
          </Box>
          <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", mb: 3 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#0f172a", color: "#fff" }}>
                  <th style={{ padding: "10px 14px", fontWeight: 800, textAlign: "left" }}>Khoản Mục</th>
                  <th style={{ padding: "10px 14px", fontWeight: 800, textAlign: "center" }}>Chỉ Số / Chi Tiết</th>
                  <th style={{ padding: "10px 14px", fontWeight: 800, textAlign: "right" }}>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {Row(invoice).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0f172a" }}>{row.label}</td>
                    <td style={{ padding: "10px 14px", textAlign: "center", color: "#64748b" }}>{row.detail}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>{formatCurrency(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#eff6ff", borderTop: "2px solid #bfdbfe" }}>
                  <td colSpan={2} style={{ padding: "10px 14px", textAlign: "right", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase" }}>TỔNG CỘNG THANH TOÁN:</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 900, fontSize: "0.9375rem", color: "#1d4ed8" }}>{formatCurrency(invoice.total)}</td>
                </tr>
              </tfoot>
            </table>
          </Paper>
          <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mb: 2 }}>
              Quét Mã VietQR Chuyển Khoản Tự Động
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Box component="img"
                src={`https://img.vietqr.io/image/${settings?.bankName || "MBBank"}-${settings?.bankAccountNo || "0988776655"}-compact2.png?amount=${invoice.total}&addInfo=${encodeURIComponent(`Thanh toan phong ${invoice.contract?.room?.room_number || ""} thang ${invoice.month}`)}&accountName=${encodeURIComponent(settings?.bankAccountOwner || "")}`}
                alt="VietQR"
                sx={{ width: 180, height: 180, objectFit: "contain", border: "1px solid #e2e8f0", borderRadius: "16px", bgcolor: "#fff", p: 1 }}
              />
            </Box>
            <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
              Ngân hàng: <strong style={{ color: "#0f172a" }}>{settings?.bankName || "MBBank"}</strong> | Số TK: <strong style={{ color: "#0f172a" }}>{settings?.bankAccountNo || "0988776655"}</strong><br />
              Chủ TK: <strong style={{ color: "#0f172a" }}>{settings?.bankAccountOwner || "—"}</strong>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
