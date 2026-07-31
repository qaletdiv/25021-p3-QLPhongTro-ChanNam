"use client";

import { Box, Card, Typography, Chip } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/format";

export default function RevenueChart({ data, monthlyRevenue }) {
  return (
    <Card sx={{ borderRadius: "16px", p: 3 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" }, gap: 1, mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Doanh Thu 6 Tháng Gần Nhất
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
            Thống kê doanh thu thực nhận định kỳ
          </Typography>
        </Box>
        <Chip
          label={`Thực thu T07/26: ${formatCurrency(monthlyRevenue)}`}
          size="small"
          sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, borderRadius: "12px", fontSize: "0.6875rem", border: "1px solid #bfdbfe", alignSelf: "flex-start" }}
        />
      </Box>
      <Box sx={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Doanh Thu"]}
              contentStyle={{ backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "12px", fontSize: "12px", border: "1px solid #334155" }}
            />
            <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
