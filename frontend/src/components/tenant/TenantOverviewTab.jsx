"use client";

import { useState, useMemo } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { formatCurrency, formatDate } from "../../utils/format";
import { resolveNotificationTemplate } from "../../utils/notificationTemplate";
import ModalShell from "../ui/ModalShell";
import TenantUtilityUsageChart from "./TenantUtilityUsageChart";
import { tokens as t } from "../../design/tokens";

const LeaseGauge = ({ daysLeft, startDate, endDate }) => {
  const { pct, urgent } = useMemo(() => {
    const total = endDate && startDate
      ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
      : 365;
    const left = Math.abs(daysLeft);
    const p = Math.min(100, Math.max(3, Math.round((left / total) * 100)));
    return { pct: p, urgent: daysLeft <= 30 };
  }, [daysLeft, startDate, endDate]);

  const R = 52;
  const C = 2 * Math.PI * R;
  const ringColor = urgent ? t.colors.amber : t.colors.accentStrong;
  const bgTrack = "rgba(255,255,255,0.16)";

  return (
    <Box
      role="img"
      aria-label={`Còn ${daysLeft} ngày trong thời hạn hợp đồng, tương đương ${pct}% thời gian còn lại`}
      sx={{ position: "relative", width: 148, height: 148, mx: "auto", my: 1 }}
    >
      <svg width="148" height="148" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx="60" cy="60" r={R} fill="none" stroke={bgTrack} strokeWidth="8" />
        <circle
          cx="60" cy="60" r={R} fill="none"
          stroke={ringColor} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct / 100)}
        />
        <circle cx="60" cy="60" r="47" fill="rgba(255,255,255,0.12)" />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <Typography className="font-mono" sx={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1, color: urgent ? "#fde68a" : "#fff" }}>
          {Math.abs(daysLeft)}
        </Typography>
        <Typography sx={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.75)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", mt: 0.5 }}>
          ngày còn lại
        </Typography>
      </Box>
    </Box>
  );
};

export default function TenantOverviewTab({ room, tenant, contract, daysLeft, notifications, calcTotal, monthStr, roomPrice, latestInvoice, landlordAddress, companions }) {
  const [furnitureOpen, setFurnitureOpen] = useState(false);
  const handoverItems = contract?.contractFurnitures || [];

  const statusInfo = useMemo(() => !latestInvoice
    ? { label: "Chờ Nhập Điện Nước", fg: t.colors.muted, bg: "#eef2f7", hair: t.colors.hair, dot: "#94a3b8" }
    : latestInvoice.status === "paid"
      ? { label: "Đã Thanh Toán", fg: "#065f46", bg: "#d1fae5", hair: "#a7f3d0", dot: "#059669" }
      : latestInvoice.status === "submitted"
        ? { label: "Đã Gửi Chỉ Số", fg: "#92400e", bg: "#fef3c7", hair: "#fde68a", dot: "#d97706" }
        : { label: "Chờ Thu Tiền", fg: t.colors.muted, bg: "#eef2f7", hair: t.colors.hair, dot: "#64748b" },
  [latestInvoice]);

  const resolveContent = (content) => resolveNotificationTemplate(content, {
    TENKHACH: tenant?.name || "",
    MAPHONG: room?.room_number || "",
    THANG: monthStr || "",
    TONG_TIEN: contract?.price != null ? String(contract.price) : room?.price != null ? String(room.price) : "",
    HAN_THANH_TOAN: contract?.paymentDay ? String(contract.paymentDay + 5) : "",
  });

  const people = useMemo(() => [
    { name: tenant?.name, fingerprintCode: contract?.fingerprintCode, key: "main" },
    ...(companions || []).map((c) => ({ name: c.name, fingerprintCode: c.fingerprintCode, key: c.id })),
  ].filter((p) => p.name), [tenant, companions, contract]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Signature banner: editorial masthead + lease gauge */}
      <Box
        className="reveal"
        sx={{
          background: `linear-gradient(160deg, #053b2c 0%, ${t.colors.accentStrong} 100%)`,
          borderRadius: t.radius.xl, p: { xs: 3, sm: 4 },
          color: "#fff", position: "relative", overflow: "hidden",
          boxShadow: t.shadow.lift,
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none", backgroundImage: "radial-gradient(120% 120% at 100% -10%, rgba(255,255,255,0.18) 0%, transparent 55%)" }} />
        <Box sx={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" }, gap: 3, alignItems: "center" }}>
          <Box>
            <Chip label="Cư Dân SmartRent"
              sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "#d1fae5", fontWeight: 700, fontSize: "0.625rem", borderRadius: t.radius.pill, letterSpacing: "0.06em", textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.22)", mb: 2 }} />
            <Typography className="font-display" sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" }, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              Phòng Trọ {room?.room_number || "—"}
            </Typography>
            <Typography sx={{ fontSize: t.type.sm, color: "#a7f3d0", mt: 0.75, fontWeight: 500 }}>
              {landlordAddress || "—"}
            </Typography>
            <Box sx={{ mt: 2.5, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Box sx={{ px: 1.5, py: 0.75, bgcolor: "rgba(255,255,255,0.14)", borderRadius: t.radius.sm, fontSize: "0.6875rem", fontWeight: 700, border: "1px solid rgba(255,255,255,0.18)" }}>
                Hợp đồng đến {contract?.endDate ? formatDate(contract.endDate) : "—"}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <LeaseGauge daysLeft={daysLeft} startDate={contract?.startDate} endDate={contract?.endDate} />
          </Box>
        </Box>
      </Box>

      {/* Quick info ledger grid */}
      <Box className="reveal"
        sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, "& > *": { animationDelay: "80ms" } }}>
        <Box sx={{ p: 3, borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}`, bgcolor: t.colors.surface, boxShadow: t.shadow.sm, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: t.colors.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Giá Thuê Phòng
          </Typography>
          <Typography className="font-display" sx={{ fontSize: "1.75rem", fontWeight: 600, color: t.colors.accent, lineHeight: 1.15 }}>
            {formatCurrency(room?.price || roomPrice)}
          </Typography>
          <Typography sx={{ fontSize: t.type.xs, color: t.colors.muted, fontWeight: 500 }}>
            Thu tiền ngày {contract?.paymentDay || 5} hàng tháng
          </Typography>
        </Box>

        <Box sx={{ p: 3, borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}`, bgcolor: t.colors.surface, boxShadow: t.shadow.sm, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: t.colors.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Hóa Đơn {monthStr} · {latestInvoice?.status || "chưa chốt"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: t.radius.pill, bgcolor: statusInfo.dot }} />
            <Chip label={statusInfo.label} size="small"
              sx={{ bgcolor: statusInfo.bg, color: statusInfo.fg, fontWeight: 700, fontSize: "0.6875rem", borderRadius: t.radius.pill, border: `1px solid ${statusInfo.hair}` }} />
          </Box>
          <Typography sx={{ fontSize: t.type.xs, color: t.colors.muted, fontWeight: 500 }}>
            Tổng cộng <Box component="span" sx={{ fontWeight: 800, color: t.colors.ink }}>{formatCurrency(calcTotal)}</Box>
          </Typography>
        </Box>

        <Box sx={{ p: 3, borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}`, bgcolor: t.colors.surface, boxShadow: t.shadow.sm }}>
          <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: t.colors.muted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 1 }}>
            Mã Vân Tay & Bàn Giao
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {people.length === 0 ? (
              <Typography sx={{ fontSize: t.type.xs, color: t.colors.muted, py: 1 }}>Chưa có thông tin người thuê.</Typography>
            ) : people.map((p) => (
              <Box key={p.key} sx={{ py: 1, borderBottom: `1px solid ${t.colors.hairSoft}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, "&:last-child": { borderBottom: "none" } }}>
                <Typography sx={{ fontSize: t.type.sm, fontWeight: 700, color: t.colors.ink, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name}
                </Typography>
                <Typography className="font-mono" sx={{ fontSize: "0.6875rem", fontWeight: 700, color: t.colors.accentStrong, flexShrink: 0 }}>
                  {p.fingerprintCode || "—"}
                </Typography>
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: t.type.xs, color: t.colors.muted, fontWeight: 500, mt: 1.5 }}>
            Vật dụng bàn giao:{" "}
            <Box component="span" onClick={() => setFurnitureOpen(true)} tabIndex={0} role="button" aria-label={`Xem chi tiết ${handoverItems.length} vật dụng bàn giao`}
              sx={{ color: t.colors.accentStrong, fontWeight: 800, textDecoration: "underline", textUnderlineOffset: "3px", cursor: "pointer", "&:focus-visible": { outline: `2px solid ${t.colors.focus}`, outlineOffset: "2px", borderRadius: 4 } }}>
              {handoverItems.length} món
            </Box>
          </Typography>
        </Box>
      </Box>

      {/* Utility usage chart */}
      <TenantUtilityUsageChart />

      {/* Notifications */}
      <Box className="reveal" sx={{ p: 3, borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}`, bgcolor: t.colors.surface, boxShadow: t.shadow.sm }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 2, mb: 2, borderBottom: `1px solid ${t.colors.hairSoft}` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.colors.accentStrong} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <Typography className="font-display" sx={{ fontSize: "1.0625rem", fontWeight: 600, color: t.colors.ink }}>
            Thông báo từ Chủ Trọ
          </Typography>
        </Box>
        {notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.colors.hair} strokeWidth="1.5" style={{ margin: "0 auto 8px", display: "block" }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <Typography sx={{ fontSize: t.type.sm, color: t.colors.muted, fontWeight: 600 }}>Chưa có thông báo nào mới từ Chủ trọ.</Typography>
            <Typography sx={{ fontSize: t.type.xs, color: "#94a3b8", mt: 0.5 }}>Khi Chủ trọ gửi thông báo qua Telegram, chúng sẽ hiển thị ở đây.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: 245, maxHeight: 245, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
            {notifications.map((n) => (
              <Box key={n.id} sx={{ p: 2, bgcolor: t.colors.surface2, borderRadius: t.radius.md, border: `1px solid ${t.colors.hair}`, transition: t.transitions.fast, "&:hover": { borderColor: "#cbd5e1", bgcolor: "#ffffff", boxShadow: t.shadow.sm } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, color: t.colors.ink, fontSize: "0.75rem" }}>{n.title}</Typography>
                  <Typography sx={{ fontSize: "0.625rem", color: "#94a3b8", fontWeight: 500 }}>{n.createdAt ? formatDate(n.createdAt) : ""}</Typography>
                </Box>
                <Typography sx={{ fontSize: "0.6875rem", color: t.colors.muted, lineHeight: 1.6 }}>{resolveContent(n.content)}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <ModalShell open={furnitureOpen} onClose={() => setFurnitureOpen(false)} maxWidth={480}
        headerBg={t.colors.accentStrong}
        header={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M3 7V5a2 2 0 0 1 2-2h4l2 3h6a2 2 0 0 1 2 2v2"/></svg>
            <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>
              Vật Dụng Bàn Giao · Phòng {room?.room_number || "—"}
            </Typography>
          </Box>
        }
        body={
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {handoverItems.length === 0 ? (
              <Typography sx={{ fontSize: "0.75rem", color: t.colors.muted, textAlign: "center", py: 3 }}>
                Không có vật dụng bàn giao.
              </Typography>
            ) : (
              handoverItems.map((item) => (
                <Box key={item.id} sx={{ p: 2, bgcolor: t.colors.surface2, borderRadius: t.radius.md, border: `1px solid ${t.colors.hair}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: t.colors.ink }}>{item.furniture?.name || "—"}</Typography>
                    {item.furniture?.note && (
                      <Typography sx={{ fontSize: "0.6875rem", color: t.colors.muted, mt: 0.25 }}>{item.furniture.note}</Typography>
                    )}
                  </Box>
                  <Chip label={`x${item.quantity || 1}`} size="small"
                    sx={{ bgcolor: t.colors.infoSoft, color: t.colors.info, fontWeight: 700, fontSize: "0.6875rem", borderRadius: t.radius.pill, border: `1px solid #bfdbfe`, flexShrink: 0 }} />
                </Box>
              ))
            )}
          </Box>
        }
      />
    </Box>
  );
}