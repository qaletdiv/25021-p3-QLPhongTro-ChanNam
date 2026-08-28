"use client";

import { useEffect, useState } from "react";
import { Box, Card, Typography, CircularProgress, Alert } from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Tooltip, Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import dashboardApi from "../../api/dashboardApi";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ChartDataLabels);

const KEY_LABELS = {
  electricityRate: "Điện (đ/kWh)",
  waterRate: "Nước (đ/m³)",
  serviceFee: "Phí DV & rác (đ/tháng)",
};

const KEY_COLORS = {
  electricityRate: "#f59e0b",
  waterRate: "#3b82f6",
  serviceFee: "#8b5cf6",
};

const formatDate = (d) => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

const formatVal = (v) => (Number(v) / 1000).toLocaleString("vi-VN");

export default function PriceHistoryChart({ buildingId = "" }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    dashboardApi.getRateHistory(buildingId ? Number(buildingId) : null)
      .then((res) => { if (active) setHistory(res.data.history || []); })
      .catch(() => { if (active) setError("Lỗi tải dữ liệu lịch sử giá"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [buildingId]);

  return (
    <Card sx={{ borderRadius: "16px", p: 3 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, gap: 1.5, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>Lịch Sử Thay Đổi Giá</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Điện, nước, phí dịch vụ</Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: "12px" }}>{error}</Alert>
      ) : history.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center", color: "#94a3b8", fontSize: "0.75rem", border: "1px dashed #e2e8f0", borderRadius: "12px" }}>
          Chưa có dữ liệu lịch sử. Cập nhật giá điện/nước tại trang Cài đặt để bắt đầu theo dõi.
        </Box>
      ) : (
        <>
          <Box sx={{ height: 260 }}>
            <Line
              data={(() => {
                const dates = [...new Set(history.map((r) => formatDate(r.createdAt)))];
                const datedData = {};
                Object.keys(KEY_LABELS).forEach((key) => {
                  datedData[key] = dates.map((d) => {
                    const rows = history.filter((r) => r.key === key && formatDate(r.createdAt) === d);
                    return rows.length > 0 ? Number(rows[rows.length - 1].value) : null;
                  });
                });
                const datasets = Object.keys(KEY_LABELS).map((key) => ({
                  label: KEY_LABELS[key],
                  data: datedData[key],
                  borderColor: KEY_COLORS[key],
                  backgroundColor: KEY_COLORS[key],
                  tension: 0.3,
                  pointRadius: 4,
                  pointHoverRadius: 5,
                }));
                return { labels: dates, datasets };
              })()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom", labels: { color: "#334155", usePointStyle: true, boxWidth: 8, font: { size: 11, weight: 600 } } },
                  tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatVal(ctx.parsed.y)}` } },
                  datalabels: {
                    display: (ctx) => ctx.dataset.data[ctx.dataIndex] != null,
                    anchor: "end",
                    align: "top",
                    offset: 4,
                    color: (ctx) => {
                      const hit = Object.entries(KEY_LABELS).find(([, lbl]) => lbl === ctx.dataset.label);
                      return hit ? KEY_COLORS[hit[0]] : "#334155";
                    },
                    font: { size: 10, weight: 700 },
                    formatter: (v) => formatVal(v),
                  },
                },
                layout: { padding: { top: 24 } },
                scales: {
                  x: { grid: { color: "#f1f5f9" }, ticks: { color: "#64748b", font: { size: 10 } } },
                  y: { grid: { color: "#f1f5f9" }, ticks: { color: "#64748b", font: { size: 10 }, callback: (v) => `${formatVal(v)}` } },
                },
              }}
            />
          </Box>
          <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", textAlign: "right", mt: 1 }}>
            Đơn vị: ngàn đồng.
          </Typography>
        </>
      )}
    </Card>
  );
}