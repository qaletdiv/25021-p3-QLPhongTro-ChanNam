"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, TextField, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BugReportIcon from "@mui/icons-material/BugReport";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MessageDialog from "../components/MessageDialog";
import tenantIssueApi from "../api/tenantIssueApi";
import { resizeImage } from "../utils/image";

const statusLabel = { pending: "Chờ xử lý", resolved: "Đã xử lý" };

export default function TenantIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [images, setImages] = useState([]);

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

  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files || []);
    const next = [...images];
    for (const file of files) {
      if (next.length >= 5) break;
      try {
        const resized = await resizeImage(file);
        next.push(resized);
      } catch { /* skip invalid file */ }
    }
    setImages(next);
    e.target.value = "";
  };

  const handleCreate = async () => {
    try {
      await tenantIssueApi.create({ ...form, images });
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ title: "", description: "" }); setImages([]); setOpenCreate(true); }}
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
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Hình ảnh</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Ngày gửi</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => {
              let issueImages = [];
              try { issueImages = issue.images ? JSON.parse(issue.images) : []; } catch { issueImages = []; }
              return (
              <TableRow key={issue.id}>
                <TableCell sx={{ color: "#0f172a" }}>{issue.title}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>{issue.description || "-"}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>Phòng {issue.room?.room_number || "-"}</TableCell>
                <TableCell>
                  {issueImages.length > 0 ? (
                    <Box sx={{ display: "flex", gap: 0.75 }}>
                      {issueImages.slice(0, 3).map((img, idx) => (
                        <Box key={idx} component="img" src={img} alt=""
                          sx={{ width: 44, height: 44, objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0", cursor: "zoom-in" }}
                          onClick={() => window.open(img, "_blank")} />
                      ))}
                      {issueImages.length > 3 && (
                        <Typography sx={{ fontSize: "0.625rem", color: "#64748b", alignSelf: "center" }}>+{issueImages.length - 3}</Typography>
                      )}
                    </Box>
                  ) : "-"}
                </TableCell>
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
              );
            })}
            {issues.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "#64748b" }}>Chưa có báo cáo nào</TableCell>
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

          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 1 }}>Ảnh bằng chứng (tối đa 5 ảnh)</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "center" }}>
              {images.map((img, idx) => (
                <Box key={idx} sx={{ position: "relative", width: 88, height: 88 }}>
                  <Box component="img" src={img} alt=""
                    sx={{ width: 88, height: 88, objectFit: "cover", borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  <Box onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    sx={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", bgcolor: "#ef4444", color: "#fff", fontSize: "0.75rem", lineHeight: "20px", textAlign: "center", cursor: "pointer", fontWeight: 700, boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
                    ×
                  </Box>
                </Box>
              ))}
              {images.length < 5 && (
                <Button component="label" variant="outlined" startIcon={<CameraAltIcon />} sx={{ borderRadius: "12px", textTransform: "none", fontSize: "0.75rem", py: 1.25, minWidth: 140 }}>
                  Upload ảnh
                  <input type="file" accept="image/*" multiple hidden onChange={handleAddImages} />
                </Button>
              )}
            </Box>
          </Box>
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
