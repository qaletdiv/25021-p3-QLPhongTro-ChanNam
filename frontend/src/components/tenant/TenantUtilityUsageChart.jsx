"use client";

import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Tooltip } from "recharts";
import tenantDashboardApi from "../../api/tenantDashboardApi";
import { tokens as t } from "../../design/tokens";

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: t.colors.ink, color: "#fff", borderRadius: t.radius.sm, px: 1.5, py: 1, fontSize: t.type.xs, boxShadow: t.shadow.lift }}>
      {payload.map((p) => (
        <Box key={p.dataKey} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <span>{p.dataKey === "electricity" ? "Điện" : "Nước"}:</span>
          <Box component="span" sx={{ fontWeight: 700 }}>{p.value} {p.dataKey === "electricity" ? "kWh" : "m³"}</Box>
        </Box>
      ))}
    </Box>
  );
}

export default function TenantUtilityUsageChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    tenantDashboardApi.getUtilityUsage()
      .then((res) => { if (active) setData(res.data.chartData || []); })
      .catch(() => { if (active) setError("Không tải được dữ liệu điện nước. Vui lòng quay lại sau."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <Box className="reveal" sx={{ p: 3, borderRadius: t.radius.lg, border: `1px solid ${t.colors.hair}`, bgcolor: t.colors.surface, boxShadow: t.shadow.sm }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, mb: 2 }}>
        <Box>
          <Typography className="font-display" sx={{ fontSize: "1.0625rem", fontWeight: 600, color: t.colors.ink }}>
            Điện Nước Tiêu Thụ Theo Tháng
          </Typography>
          <Typography sx={{ fontSize: t.type.sm, color: t.colors.muted }}>
            12 tháng kể từ khi chuyển vào — điện (kWh), nước (m³)
          </Typography>
        </Box>
        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <BoltIcon sx={{ fontSize: 15, color: t.colors.amber }} />
            <Typography sx={{ fontSize: "0.72rem", color: t.colors.muted }}>Điện (kWh)</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <WaterDropIcon sx={{ fontSize: 15, color: t.colors.accentStrong }} />
            <Typography sx={{ fontSize: "0.72rem", color: t.colors.muted }}>Nước (m³)</Typography>
          </Box>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={28} /></Box>
      ) : error ? (
        <Box role="alert" sx={{ py: 6, textAlign: "center" }}>
          <Typography sx={{ fontSize: t.type.sm, color: t.colors.danger, fontWeight: 700, mb: 0.5 }}>Không thể tải biểu đồ</Typography>
          <Typography sx={{ fontSize: t.type.xs, color: t.colors.muted }}>{error}</Typography>
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center", border: `1.5px dashed ${t.colors.hair}`, borderRadius: t.radius.md }}>
          <Typography sx={{ fontSize: t.type.sm, color: t.colors.muted, fontWeight: 600 }}>Chưa có dữ liệu chỉ số điện nước.</Typography>
          <Typography sx={{ fontSize: t.type.xs, color: "#94a3b8", mt: 0.5 }}>Dữ liệu sẽ xuất hiện sau tháng đầu tiên bạn gửi chỉ số.</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.colors.hairSoft} />
                <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: t.colors.muted, fontWeight: 600 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: t.colors.muted }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(2,6,23,0.04)" }} />
                <Bar dataKey="electricity" fill="#d97706" radius={[5, 5, 0, 0]} maxBarSize={34}>
                  <LabelList dataKey="electricity" position="top" fill="#92400e" fontSize={9} fontWeight={700} formatter={(v) => (v > 0 ? v : "")} />
                </Bar>
                <Bar dataKey="water" fill="#047857" radius={[5, 5, 0, 0]} maxBarSize={34}>
                  <LabelList dataKey="water" position="top" fill="#065f46" fontSize={9} fontWeight={700} formatter={(v) => (v > 0 ? v : "")} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ display: { sm: "none" }, gap: 2, mt: 1.5, justifyContent: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <BoltIcon sx={{ fontSize: 15, color: t.colors.amber }} />
              <Typography sx={{ fontSize: "0.72rem", color: t.colors.muted }}>Điện (kWh)</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <WaterDropIcon sx={{ fontSize: 15, color: t.colors.accentStrong }} />
              <Typography sx={{ fontSize: "0.72rem", color: t.colors.muted }}>Nước (m³)</Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}