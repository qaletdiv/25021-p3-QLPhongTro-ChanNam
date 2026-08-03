"use client";

import { useEffect, useState } from "react";
import { Box, Card, Typography, Tabs, Tab, CircularProgress, Alert } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import OpacityIcon from "@mui/icons-material/Opacity";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Legend,
} from "recharts";
import dashboardApi from "../../api/dashboardApi";
import buildingApi from "../../api/buildingApi";

export default function UtilityUsageChart() {
  const [buildings, setBuildings] = useState([]);
  const [selected, setSelected] = useState("all");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    buildingApi.getAll()
      .then((res) => setBuildings(res.data.buildings || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    dashboardApi.getUtilityUsage(selected === "all" ? null : Number(selected))
      .then((res) => { if (active) setData(res.data.chartData || []); })
      .catch(() => { if (active) setError("Lỗi tải dữ liệu điện nước"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selected]);

  const buildingOptions = [{ id: "all", label: "Tất cả nhà" }, ...buildings.map((b) => ({ id: b.id, label: b.name }))];

  return (
    <Card sx={{ borderRadius: "16px", p: 3 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" }, gap: 1.5, mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Điện Nước Tiêu Thụ Theo Phòng
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
            Mức tiêu thụ mới nhất của từng phòng (điện kWh, nước m³)
          </Typography>
        </Box>
        <Tabs
          value={selected}
          onChange={(e, v) => setSelected(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{ minHeight: "auto", "& .MuiTab-root": { fontSize: "0.6875rem" } }}
        >
          {buildingOptions}
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: "12px" }}>{error}</Alert>
      ) : data.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center", color: "#94a3b8", fontSize: "0.75rem", border: "1px dashed #e2e8f0", borderRadius: "12px" }}>
          Chưa có dữ liệu chỉ số điện nước cho khu vực này.
        </Box>
      ) : (
        <Box sx={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="room" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Legend
                iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                formatter={(value) => <span style={{ color: "#475569", fontWeight: 600 }}>{value === "electricity" ? "Điện (kWh)" : "Nước (m³)"}</span>}
              />
              <Bar dataKey="electricity" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="electricity" position="top" fill="#92400e" fontSize={10} fontWeight={700} formatter={(v) => (v > 0 ? v : "")} />
              </Bar>
              <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="water" position="top" fill="#1d4ed8" fontSize={10} fontWeight={700} formatter={(v) => (v > 0 ? v : "")} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2.5, mt: 2, justifyContent: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <BoltIcon sx={{ fontSize: 15, color: "#f59e0b" }} />
          <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>Điện (kWh)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <WaterDropIcon sx={{ fontSize: 15, color: "#3b82f6" }} />
          <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>Nước (m³)</Typography>
        </Box>
      </Box>
    </Card>
  );
}