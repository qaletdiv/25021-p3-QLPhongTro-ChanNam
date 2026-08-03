"use client";

import { Box, Card, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList,
} from "recharts";
import { formatCurrency } from "../../utils/format";

export default function RevenueChart({ data }) {
  return (
    <Card sx={{ borderRadius: "16px", p: 3 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" }, gap: 1, mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Doanh Thu 6 Tháng Gần Nhất
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
            Thống kê doanh thu thực nhận định kỳ
          </Typography>
        </Box>
      </Box>
      <Box sx={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="revenue" position="top" fill="#0f172a" fontSize={11} fontWeight={700} formatter={(v) => formatCurrency(v)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
