"use client";

import { useEffect, useState } from "react";
import { Box, Card, Typography, CircularProgress, Alert } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList,
} from "recharts";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { viVN } from "@mui/x-date-pickers/locales";
import dashboardApi from "../../api/dashboardApi";

dayjs.locale("vi");

export default function UtilityUsageChart({ buildingId = "" }) {
  const [monthValue, setMonthValue] = useState(() => dayjs());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    dashboardApi.getUtilityUsage(buildingId ? Number(buildingId) : null, monthValue.format("MM/YYYY"))
      .then((res) => { if (active) setData(res.data.chartData || []); })
      .catch(() => { if (active) setError("Lỗi tải dữ liệu điện nước"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [buildingId, monthValue]);

  return (
    <Card sx={{ borderRadius: "16px", p: 3 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, gap: 1.5, mb: 2 }}>
        <Box sx={{ flex: { sm: 1 }, display: "flex", alignItems: "center", justifyContent: { xs: "space-between", sm: "flex-start" }, gap: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Điện Nước Tiêu Thụ Theo Phòng
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
              Mức tiêu thụ mới nhất của từng phòng (điện kWh, nước m³)
            </Typography>
          </Box>
        </Box>
        <Box sx={{ flex: 1, textAlign: { sm: "center" }, display: "flex", justifyContent: "center" }}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="vi"
            localeText={viVN.components.MuiLocalizationProvider.defaultProps.localeText}
          >
            <DatePicker
              views={["month", "year"]}
              label="Tháng"
              value={monthValue}
              onChange={(d) => d && setMonthValue(d)}
              format="MM/YYYY"
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: 150, "& .MuiOutlinedInput-root": { fontSize: "0.8125rem", bgcolor: "#f8fafc", borderRadius: "10px", "& fieldset": { borderColor: "#e2e8f0" } } },
                },
              }}
            />
          </LocalizationProvider>
        </Box>
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