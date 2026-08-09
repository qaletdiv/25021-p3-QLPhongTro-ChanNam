"use client";

import { useState } from "react";
import { Box, Typography, Checkbox } from "@mui/material";
import ModalShell from "../ui/ModalShell";

export default function CheckoutSelectionModal({ data, onClose, onConfirm }) {
  const [leavingIds, setLeavingIds] = useState(() => new Set(["main"]));

  if (!data) return null;

  const companions = data.activeCompanions || [];
  const toggle = (key) => {
    const next = new Set(leavingIds);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setLeavingIds(next);
  };
  const mainLeaves = leavingIds.has("main");
  const leavingCompanions = companions.filter((c) => leavingIds.has(c.id));
  const stayingCompanions = companions.filter((c) => !leavingIds.has(c.id));
  const nothingSelected = !mainLeaves && leavingCompanions.length === 0;

  const PersonRow = ({ checked, onChange, name, sub, disabled, checkColor = "#e11d48" }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1, py: 0.75, borderBottom: "1px solid #eef2f7" }}>
      <Checkbox checked={checked} onChange={onChange} disabled={disabled} sx={{ p: 0.5, color: checkColor, "&.Mui-checked": { color: checkColor } }} />
      <Box>
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>{name}</Typography>
        {sub && <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>{sub}</Typography>}
      </Box>
    </Box>
  );

  let hint;
  if (mainLeaves && stayingCompanions.length > 0) {
    hint = (
      <Box sx={{ p: 2, bgcolor: "#eff6ff", borderRadius: "16px", border: "1px solid #bfdbfe", fontSize: "0.75rem", color: "#1e40af" }}>
        Khách thuê chính rời phòng và còn người ở lại → Hợp đồng được chuyển sang khách thuê mới, phòng giữ trạng thái <strong>Đang Cho Thuê</strong>.
      </Box>
    );
  } else if (mainLeaves) {
    hint = (
      <Box sx={{ p: 2, bgcolor: "#fffbeb", borderRadius: "16px", border: "1px solid #fde68a", fontSize: "0.75rem", color: "#92400e" }}>
        Tất cả mọi người rời phòng → Phòng sẽ chuyển sang trạng thái <strong>Còn Trống</strong>, kiểm tra công nợ và hoàn trả cọc.
      </Box>
    );
  } else if (leavingCompanions.length > 0) {
    hint = (
      <Box sx={{ p: 2, bgcolor: "#ecfdf5", borderRadius: "16px", border: "1px solid #a7f3d0", fontSize: "0.75rem", color: "#065f46" }}>
        Khách thuê chính vẫn ở lại, chỉ những người được tích sẽ <strong>rời phòng</strong>.
      </Box>
    );
  } else {
    hint = (
      <Box sx={{ p: 2, bgcolor: "#f1f5f9", borderRadius: "16px", border: "1px solid #e2e8f0", fontSize: "0.75rem", color: "#475569" }}>
        Chưa chọn người nào trả phòng.
      </Box>
    );
  }

  const buttonLabel = mainLeaves && stayingCompanions.length > 0 ? "Tiếp Tục" : !mainLeaves ? "Xác Nhận" : "Xác Nhận Trả Phòng";

  return (
    <ModalShell open={!!data} onClose={onClose} headerBg="#2563eb" maxWidth={440}
      header={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/></svg>
          <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>
            Chọn Người Trả Phòng {data.roomNumber}
          </Typography>
        </Box>
      }
      body={
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.6 }}>
            Tích vào những người sẽ <strong>trả phòng</strong>. Người không tích sẽ ở lại phòng.
          </Typography>
          <Box sx={{ border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden" }}>
            <PersonRow
              checked={mainLeaves}
              onChange={() => toggle("main")}
              name={data.tenantName}
              sub="Khách thuê chính"
            />
            {companions.map((c) => (
              <PersonRow
                key={c.id}
                checked={leavingIds.has(c.id)}
                onChange={() => toggle(c.id)}
                name={c.name}
                sub={c.relationship ? `Người đi kèm - ${c.relationship}` : "Người đi kèm"}
              />
            ))}
          </Box>
          {hint}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1 }}>
            <Box onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
            <Box
              onClick={() => !nothingSelected && onConfirm([...leavingIds])}
              sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: nothingSelected ? "#cbd5e1" : "#2563eb", color: "#fff", borderRadius: "12px", cursor: nothingSelected ? "not-allowed" : "pointer", "&:hover": nothingSelected ? {} : { bgcolor: "#1d4ed8" }, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
              {buttonLabel}
            </Box>
          </Box>
        </Box>
      }
    />
  );
}