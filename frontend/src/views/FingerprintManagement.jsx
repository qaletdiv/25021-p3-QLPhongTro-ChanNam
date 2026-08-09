"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Paper, Typography, TextField, Select, MenuItem, InputAdornment, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import fingerprintApi from "../api/fingerprintApi";
import buildingApi from "../api/buildingApi";
import { formatDateTime } from "../utils/format";

export default function FingerprintManagement() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (buildingFilter && buildingFilter !== "all") params.buildingId = buildingFilter;
      if (search) params.search = search;
      const res = await fingerprintApi.getHistory(params);
      setHistory(res.data.history || []);
    } catch (e) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [buildingFilter, search]);

  const currentStatusByCode = {};
  for (const h of history) currentStatusByCode[h.fingerprintCode] = h.action;

  const sortedHistory = [...history].sort((a, b) => a.fingerprintCode.localeCompare(b.fingerprintCode));

  const filteredHistory = sortedHistory.filter((h) => {
    if (actionFilter !== "all" && h.action !== actionFilter) return false;
    if (statusFilter !== "all" && currentStatusByCode[h.fingerprintCode] !== statusFilter) return false;
    return true;
  });

  useEffect(() => {
    buildingApi.getAll().then((res) => setBuildings(res.data.buildings || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchHistory, 250);
    return () => clearTimeout(t);
  }, [fetchHistory]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Quản Lý Vân Tay</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
            Theo dõi lịch sử gán / thay đổi / thu hồi vân tay.
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 200, flex: 1, maxWidth: 320 }}>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Theo Tòa Nhà</Typography>
            <Select
              fullWidth size="small" value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem" }, "& .MuiSelect-select": { fontSize: "0.75rem", py: 1.1 } }}
            >
              <MenuItem value="all">Tất cả tòa nhà</MenuItem>
              {buildings.map((b) => (
                <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ minWidth: 260, flex: 1, maxWidth: 320 }}>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Tìm Kiếm</Typography>
            <TextField
              fullWidth size="small" placeholder="Tìm theo mã vân tay hoặc tên người..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "#94a3b8", fontSize: 16 }} /></InputAdornment>) } }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "0.75rem", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
            />
          </Box>
          <Box sx={{ minWidth: 200, flex: 1, maxWidth: 240 }}>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Hành Động</Typography>
            <Select
              fullWidth size="small" value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem" }, "& .MuiSelect-select": { fontSize: "0.75rem", py: 1.1 } }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="assigned">Gán</MenuItem>
              <MenuItem value="removed">Thu hồi</MenuItem>
            </Select>
          </Box>
          <Box sx={{ minWidth: 200, flex: 1, maxWidth: 240 }}>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Trạng Thái Hiện Tại</Typography>
            <Select
              fullWidth size="small" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem" }, "& .MuiSelect-select": { fontSize: "0.75rem", py: 1.1 } }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="assigned">Đang gán</MenuItem>
              <MenuItem value="removed">Đã thu hồi</MenuItem>
            </Select>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>
      ) : filteredHistory.length === 0 ? (
        <Paper sx={{ p: 6, borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <FingerprintIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
          <Typography sx={{ mt: 1, fontSize: "0.8125rem", color: "#64748b" }}>
            Chưa có dữ liệu lịch sử vân tay. Lịch sử sẽ được ghi lại khi bạn lập hợp đồng hoặc gán vân tay cho khách.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>STT</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Mã Vân Tay</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Trạng Thái Hiện Tại</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Hành Động</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Được Gán Cho</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Loại</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Phòng</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Thời Điểm</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((h, idx) => (
                <TableRow key={h.id} hover>
                  <TableCell sx={{ fontSize: "0.75rem", color: "#64748b" }}>{idx + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <FingerprintIcon sx={{ color: "#2563eb", fontSize: 16 }} />
                      <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#0f172a" }}>{h.fingerprintCode}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {currentStatusByCode[h.fingerprintCode] === "assigned" ? (
                      <Chip size="small" label="Đang gán" sx={{ fontSize: "0.625rem", fontWeight: 700, bgcolor: "#dcfce7", color: "#15803d" }} />
                    ) : (
                      <Chip size="small" label="Đã thu hồi" sx={{ fontSize: "0.625rem", fontWeight: 700, bgcolor: "#e2e8f0", color: "#475569" }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {h.action === "assigned" ? (
                      <Chip size="small" icon={<CheckCircleIcon />} label="Gán" sx={{ fontSize: "0.625rem", fontWeight: 700, bgcolor: "#dcfce7", color: "#15803d" }} />
                    ) : (
                      <Chip size="small" icon={<CancelIcon />} label="Thu hồi" sx={{ fontSize: "0.625rem", fontWeight: 700, bgcolor: "#ffe4e6", color: "#e11d48" }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>{h.ownerName || "-"}</TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    {h.ownerType === "tenant" ? "Khách chính" : "Người đi kèm"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    {h.room ? `${h.room.room_number}${h.room.building ? ` • ${h.room.building.name}` : ""}` : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", color: "#64748b" }}>{formatDateTime(h.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}