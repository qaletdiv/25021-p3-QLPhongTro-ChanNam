"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Paper, Typography, TextField, Select, MenuItem, InputAdornment, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, CircularProgress,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import auditApi from "../api/auditApi";
import { formatDateTime } from "../utils/format";

const ACTION_LABELS = {
  "auth.login": "Đăng nhập",
  "auth.logout": "Đăng xuất",
  "user.disable": "Vô hiệu hóa tài khoản",
  "user.enable": "Kích hoạt tài khoản",
  "user.change_password": "Đổi mật khẩu",
  "account.revoke_session": "Thu hồi phiên đăng nhập",
};

const actionLabel = (action) => ACTION_LABELS[action] || action;

export default function AuditLogView({ initialLogs = [], initialTotal = 0 }) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (actionFilter !== "all") params.action = actionFilter;
      const res = await auditApi.getLogs(params);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, page]);

  // Dữ liệu ban đầu được fetch server-side; chỉ refetch (debounce) khi đổi filter/search/page
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const t = setTimeout(fetchLogs, 250);
    return () => clearTimeout(t);
  }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight="bold">Nhật Ký Hoạt Động (Audit)</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Lịch sử các hành động quan trọng: đăng nhập, đăng xuất, vô hiệu hóa / kích hoạt tài khoản, đổi mật khẩu và thu hồi phiên.
        </Typography>
      </Box>

      <Paper sx={{ p: 2, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 260, flex: 1, maxWidth: 360 }}>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Tìm Kiếm</Typography>
            <TextField
              fullWidth size="small" placeholder="Tìm theo mã hành động (vd: auth.login)..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "#94a3b8", fontSize: 16 }} /></InputAdornment>) } }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "0.75rem", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
            />
          </Box>
          <Box sx={{ minWidth: 220, flex: 1, maxWidth: 280 }}>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Hành Động</Typography>
            <Select
              fullWidth size="small" value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem" }, "& .MuiSelect-select": { fontSize: "0.75rem", py: 1.1 } }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <MenuItem key={k} value={k}>{v}</MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>
      ) : logs.length === 0 ? (
        <Paper sx={{ p: 6, borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <HistoryIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
          <Typography sx={{ mt: 1, fontSize: "0.8125rem", color: "#64748b" }}>Chưa có dữ liệu nhật ký.</Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Thời Gian</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Người Thực Hiện</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Hành Động</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Đối Tượng</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((l, idx) => (
                  <TableRow key={l.id} hover>
                    <TableCell sx={{ fontSize: "0.75rem", color: "#64748b" }}>{idx + 1 + (page - 1) * 50}</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{formatDateTime(l.createdAt, true)}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#0f172a" }}>{l.actor?.name || "Hệ thống"}</Typography>
                      {l.actor?.email && <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>{l.actor.email}</Typography>}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={actionLabel(l.action)} sx={{ fontSize: "0.625rem", fontWeight: 700, bgcolor: "#eff6ff", color: "#2563eb" }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {l.entityType === "user" && l.target
                        ? (
                          <Box>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#0f172a" }}>{l.target.name}</Typography>
                            {l.target.email && <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>{l.target.email}</Typography>}
                          </Box>
                        )
                        : (
                          <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                            {l.entityType} #{l.entityId}
                          </Typography>
                        )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "#64748b" }}>{l.ipAddress || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" size="small" />
          </Box>
        </>
      )}
    </Box>
  );
}