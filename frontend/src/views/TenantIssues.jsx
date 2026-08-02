"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BugReportIcon from "@mui/icons-material/BugReport";
import MessageDialog from "../components/MessageDialog";
import tenantIssueApi from "../api/tenantIssueApi";

const statusLabel = { pending: "Chờ xử lý", resolved: "Đã xử lý" };

export default function TenantIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const fetchIssues = useCallback(async () => {
    try {
      const res = await tenantIssueApi.getAll();
      setIssues(res.data.issues);
    } catch {
      setSnack({ open: true, message: "Lỗi tải danh sách", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleCreate = async () => {
    try {
      await tenantIssueApi.create(form);
      setOpenCreate(false);
      fetchIssues();
      setTimeout(() => setSnack({ open: true, message: "Gửi báo cáo thành công", severity: "success" }), 300);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#0f172a">Báo hỏng</Typography>
          <Typography variant="body2" color="#64748b" mt={0.5}>Theo dõi và gửi báo cáo các vấn đề hỏng hóc</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ title: "", description: "" }); setOpenCreate(true); }}
          sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#065f46" }, borderRadius: "12px", textTransform: "none" }}>
          Gửi báo cáo mới
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f1f5f9" }}>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Tiêu đề</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Phòng</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Ngày gửi</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell sx={{ color: "#0f172a" }}>{issue.title}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{issue.description || "-"}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>Phòng {issue.room?.room_number || "-"}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{new Date(issue.createdAt).toLocaleString("vi-VN")}</TableCell>
                <TableCell>
                  <Chip label={statusLabel[issue.status]}
                    size="small"
                    sx={{
                      borderRadius: "12px", fontWeight: 600,
                      bgcolor: issue.status === "resolved" ? "#d1fae5" : "#fef3c7",
                      color: issue.status === "resolved" ? "#065f46" : "#d97706",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {issues.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "#64748b" }}>Chưa có báo cáo nào</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: "bold", color: "#0f172a", borderBottom: "1px solid #e2e8f0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BugReportIcon sx={{ color: "#059669", fontSize: 20 }} />
            Gửi báo cáo hỏng hóc
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Tiêu đề" margin="normal" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          <TextField fullWidth label="Mô tả chi tiết" margin="normal" multiline rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setOpenCreate(false)} sx={{ borderRadius: "12px", textTransform: "none", color: "#64748b" }}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}
            sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#065f46" }, borderRadius: "12px", textTransform: "none" }}>Gửi</Button>
        </DialogActions>
      </Dialog>

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
