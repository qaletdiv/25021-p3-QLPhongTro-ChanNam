import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Snackbar, Alert, TableContainer, Paper, Chip, FormControl, InputLabel, Select,
} from "@mui/material";
import notificationApi from "../api/notificationApi";
import roomApi from "../api/roomApi";

const statusConfig = {
  sent: { label: "Đã gửi", bg: "#d1fae5", color: "#059669" },
  draft: { label: "Nháp", bg: "#fef3c7", color: "#d97706" },
};

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", targetType: "all", targetRoomIds: [] });
  const [rooms, setRooms] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data.notifications);
    } catch {
      setSnack({ open: true, message: "Lỗi tải danh sách thông báo", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const openCreateDialog = async () => {
    try {
      const res = await roomApi.getAll();
      setRooms(res.data.rooms);
    } catch {}
    setForm({ title: "", content: "", targetType: "all", targetRoomIds: [] });
    setOpenCreate(true);
  };

  const handleCreate = async () => {
    try {
      await notificationApi.create(form);
      setSnack({ open: true, message: "Tạo thông báo thành công", severity: "success" });
      setOpenCreate(false);
      fetchNotifications();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    }
  };

  const getStatusChip = (status) => {
    const cfg = statusConfig[status] || { label: status, bg: "#f1f5f9", color: "#64748b" };
    return (
      <Chip
        label={cfg.label}
        size="small"
        sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, borderRadius: "12px" }}
      />
    );
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Quản lý thông báo</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>Quản lý và gửi thông báo đến các phòng</Typography>
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          onClick={openCreateDialog}
          sx={{ borderRadius: "12px", bgcolor: "#2563eb", textTransform: "none", fontWeight: 600 }}
        >
          Tạo thông báo mới
        </Button>
      </Box>

      {loading ? null : (
        <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Tiêu đề</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Ngày gửi</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Số người nhận</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{n.title}</TableCell>
                    <TableCell>{new Date(n.sentAt).toLocaleString("vi-VN")}</TableCell>
                    <TableCell>{n.recipientCount}</TableCell>
                    <TableCell>{getStatusChip(n.status)}</TableCell>
                  </TableRow>
                ))}
                {notifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Chưa có thông báo nào</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>Tạo thông báo mới</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Tiêu đề" margin="normal" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          <TextField fullWidth label="Nội dung" margin="normal" multiline rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Đối tượng</InputLabel>
            <Select value={form.targetType} label="Đối tượng" onChange={(e) => setForm({ ...form, targetType: e.target.value, targetRoomIds: [] })} sx={{ borderRadius: "12px" }}>
              <MenuItem value="all">Tất cả phòng</MenuItem>
              <MenuItem value="specific_rooms">Chọn phòng cụ thể</MenuItem>
            </Select>
          </FormControl>
          {form.targetType === "specific_rooms" && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Chọn phòng</InputLabel>
              <Select multiple value={form.targetRoomIds} label="Chọn phòng" onChange={(e) => setForm({ ...form, targetRoomIds: e.target.value })} sx={{ borderRadius: "12px" }}>
                {rooms.map((r) => <MenuItem key={r.id} value={r.id}>Phòng {r.room_number}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)} sx={{ borderRadius: "12px", textTransform: "none", color: "#64748b" }}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate} sx={{ borderRadius: "12px", bgcolor: "#2563eb", textTransform: "none", fontWeight: 600 }}>Gửi thông báo</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
