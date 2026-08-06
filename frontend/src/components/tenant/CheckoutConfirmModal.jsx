"use client";

import { Box, Typography } from "@mui/material";
import ModalShell from "../ui/ModalShell";
import { formatCurrency } from "../../utils/format";

export default function CheckoutConfirmModal({ checkoutConfirm, onClose, onConfirm }) {
  if (!checkoutConfirm) return null;

  return (
    <ModalShell open={!!checkoutConfirm} onClose={onClose} headerBg="#e11d48" maxWidth={440}
      header={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>
            Xác Nhận Trả Phòng {checkoutConfirm.roomNumber}
          </Typography>
        </Box>
      }
      body={
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn làm thủ tục <strong>Trả phòng {checkoutConfirm.roomNumber}</strong> cho khách hàng <strong>{checkoutConfirm.tenantName}</strong>?
          </Typography>
          {checkoutConfirm.activeCompanions?.length > 0 ? (
            <Box sx={{ p: 2, bgcolor: "#eff6ff", borderRadius: "16px", border: "1px solid #bfdbfe", fontSize: "0.75rem", color: "#1e40af", display: "flex", flexDirection: "column", gap: 1 }}>
              <div><strong>• Người đi kèm {checkoutConfirm.activeCompanions[0].name} sẽ trở thành khách thuê chính</strong></div>
              <div>• Hợp đồng {checkoutConfirm.roomNumber} sẽ được chuyển sang cho khách thuê mới</div>
              <div>• Phòng vẫn giữ trạng thái <strong>Đang Cho Thuê</strong>, cọc được chuyển tiếp</div>
            </Box>
          ) : (
            <Box sx={{ p: 2, bgcolor: "#fffbeb", borderRadius: "16px", border: "1px solid #fde68a", fontSize: "0.75rem", color: "#92400e", display: "flex", flexDirection: "column", gap: 1 }}>
              <div><strong>• Kiểm tra công nợ và hoàn trả cọc: {formatCurrency(checkoutConfirm.deposit)}</strong></div>
              <div>• Chuyển trạng thái phòng sang <strong>Còn Trống</strong></div>
              <div>• Tự động dừng gửi thông báo theo lịch</div>
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1 }}>
            <Box onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
            <Box onClick={onConfirm} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#e11d48", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#be123c" }, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
              Xác Nhận Trả Phòng
            </Box>
          </Box>
        </Box>
      }
    />
  );
}
