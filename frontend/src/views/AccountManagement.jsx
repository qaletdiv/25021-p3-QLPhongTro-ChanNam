"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Paper, Typography, TextField, Select, MenuItem, InputAdornment, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Snackbar, Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LockResetIcon from "@mui/icons-material/LockReset";
import BlockIcon from "@mui/icons-material/Block";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import KeyIcon from "@mui/icons-material/Key";
import adminUserApi from "../api/adminUserApi";
import { useAuth } from "../contexts/AuthContext";

const timeStr = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function AccountManagement() {
  const { user: me } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [banner, setBanner] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.active = statusFilter;
      const res = await adminUserApi.getUsers(params);
      setUsers(res.data.users || []);
    } catch (e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 250);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const runAction = async (fn, successMsg) => {
    try {
      await fn();
      setBanner(successMsg);
      await fetchUsers();
    } catch (e) {
      setErrorMsg(e.response?.data?.message || "Thao tác thất bại");
    }
  };

  const submitChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    try {
      await adminUserApi.changePassword(passwordTarget.id, newPassword);
      setBanner("Đã đổi mật khẩu và thu hồi phiên đăng nhập hiện tại.");
      setPasswordTarget(null);
      setNewPassword("");
      await fetchUsers();
    } catch (e) {
      setErrorMsg(e.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  const filtered = users.filter((u) => u.role !== "landlord");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight="bold">Quản Lý Tài Khoản</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Quản lý tài khoản khách thuê: thu hồi phiên đăng nhập, vô hiệu hóa hoặc đổi mật khẩu từ xa. Không áp dụng cho chính tài khoản admin.
        </Typography>
      </Box>

      <Paper sx={{ p: 2, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 260, flex: 1, maxWidth: 360 }}>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Tìm Kiếm</Typography>
            <TextField
              fullWidth size="small" placeholder="Tìm theo tên, email hoặc SĐT..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "#94a3b8", fontSize: 16 }} /></InputAdornment>) } }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "0.75rem", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
            />
          </Box>
          <Box sx={{ minWidth: 200, flex: 1, maxWidth: 260 }}>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Trạng Thái</Typography>
            <Select
              fullWidth size="small" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem" }, "& .MuiSelect-select": { fontSize: "0.75rem", py: 1.1 } }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="true">Đang hoạt động</MenuItem>
              <MenuItem value="false">Đã vô hiệu hóa</MenuItem>
            </Select>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 6, borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
          <Typography sx={{ mt: 1, fontSize: "0.8125rem", color: "#64748b" }}>Chưa có tài khoản nào.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Người Dùng</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Vai Trò</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Trạng Thái</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Hoạt Động</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Tham Gia</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.6875rem", color: "#64748b" }}>Thao Tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => {
                const isSelf = me && String(me.id) === String(u.id);
                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: u.role === "landlord" ? "#2563eb" : "#14b8a6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8125rem", flexShrink: 0 }}>
                          {(u.name || "?").charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", color: "#0f172a" }}>{u.name} {isSelf && <Typography component="span" sx={{ fontSize: "0.625rem", color: "#2563eb", fontWeight: 700 }}>(bạn)</Typography>}</Typography>
                          <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>{u.email} • {u.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={u.role === "landlord" ? "Chủ trọ" : "Khách thuê"} sx={{ fontSize: "0.625rem", fontWeight: 700, bgcolor: u.role === "landlord" ? "#eff6ff" : "#f0fdfa", color: u.role === "landlord" ? "#2563eb" : "#0f766e" }} />
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Chip size="small" label="Hoạt động" sx={{ fontSize: "0.625rem", fontWeight: 700, bgcolor: "#dcfce7", color: "#15803d" }} />
                      ) : (
                        <Chip size="small" label="Vô hiệu hóa" sx={{ fontSize: "0.625rem", fontWeight: 700, bgcolor: "#ffe4e6", color: "#e11d48" }} />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>
                      {u.online ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#22c55e" }} />
                          <Typography sx={{ fontSize: "0.75rem", color: "#15803d", fontWeight: 600 }}>Đang trực tuyến</Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>Đang ngoại tuyến</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "#64748b" }}>{timeStr(u.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.75 }}>
                        <Tooltip title={isSelf ? "Không thể thao tác trên chính mình" : "Thu hồi phiên đăng nhập từ xa"}>
                          <span>
                            <IconButton size="small" disabled={isSelf} onClick={() => runAction(() => adminUserApi.revokeSession(u.id), "Đã thu hồi phiên đăng nhập.")} sx={{ color: "#2563eb", "&.Mui-disabled": { opacity: 0.35 } }}>
                              <LockResetIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        {u.isActive ? (
                          <Tooltip title={isSelf ? "Không thể thao tác trên chính mình" : "Vô hiệu hóa tài khoản"}>
                            <span>
                              <IconButton size="small" disabled={isSelf} onClick={() => runAction(() => adminUserApi.disableAccount(u.id), "Đã vô hiệu hóa tài khoản.")} sx={{ color: "#e11d48", border: "1px solid #fecdd3", "&.Mui-disabled": { opacity: 0.35 } }}>
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Kích hoạt lại tài khoản">
                            <IconButton size="small" onClick={() => runAction(() => adminUserApi.enableAccount(u.id), "Đã kích hoạt lại tài khoản.")} sx={{ color: "#15803d", border: "1px solid #bbf7d0" }}>
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={isSelf ? "Dùng trang Cài Đặt để đổi mật khẩu chính mình" : "Đổi mật khẩu cho tài khoản này"}>
                          <span>
                            <IconButton size="small" disabled={isSelf} onClick={() => { setPasswordTarget(u); setNewPassword(""); }} sx={{ color: "#7c3aed", border: "1px solid #ddd6fe", "&.Mui-disabled": { opacity: 0.35 } }}>
                              <KeyIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(passwordTarget)} onClose={() => setPasswordTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: "0.9375rem", fontWeight: 700 }}>Đổi Mật Khẩu Cho {passwordTarget?.name}</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: 1.5 }}>
            Sau khi đổi, phiên đăng nhập hiện tại của tài khoản này sẽ bị thu hồi.
          </Typography>
          <TextField
            fullWidth size="small" type="password" label="Mật khẩu mới" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" onClick={() => setPasswordTarget(null)} color="inherit">Hủy</Button>
          <Button size="small" variant="contained" onClick={submitChangePassword}>Xác Nhận</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(banner)} autoHideDuration={3000} onClose={() => setBanner(null)}>
        <Alert severity="success" variant="filled" onClose={() => setBanner(null)} sx={{ width: "100%" }}>{banner}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={() => setErrorMsg(null)}>
        <Alert severity="error" variant="filled" onClose={() => setErrorMsg(null)} sx={{ width: "100%" }}>{errorMsg}</Alert>
      </Snackbar>
    </Box>
  );
}