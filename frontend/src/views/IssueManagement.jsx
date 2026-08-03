"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, Chip, CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MessageDialog from "../components/MessageDialog";
import issueApi from "../api/issueApi";

const statusLabel = { pending: "Chờ xử lý", resolved: "Đã xử lý" };

export default function IssueManagement() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchData = useCallback(async () => {
    try {
      const listRes = await issueApi.getAll();
      setIssues(listRes.data.issues || []);
    } catch {
      setSnack({ open: true, message: "Lỗi tải danh sách báo hỏng", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleResolve = async (id) => {
    try {
      await issueApi.updateStatus(id, "resolved");
      fetchData();
      setSnack({ open: true, message: "Đã đánh dấu báo hỏng là đã xử lý", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Cập nhật thất bại", severity: "error" });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box>
        <Typography variant="h5" fontWeight="bold">Quản Lý Báo Hỏng</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Các báo cáo hỏng hóc từ khách thuê được gửi đến chủ trọ.
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f1f5f9" }}>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Phòng / Nhà</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Khách thuê</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Tiêu đề</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Mô tả</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Hình ảnh</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Ngày gửi</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => {
              let images = [];
              try { images = issue.images ? JSON.parse(issue.images) : []; } catch { images = []; }
              return (
                <TableRow key={issue.id} sx={{ bgcolor: issue.status === "pending" ? "#fffbeb" : "inherit" }}>
                  <TableCell sx={{ color: "#0f172a", fontWeight: 700 }}>
                    Phòng {issue.room?.room_number || "-"}
                    <Box component="span" sx={{ display: "block", fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>
                      {issue.room?.building?.name || "—"}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#334155" }}>
                    {issue.tenant?.name || "-"}
                    <Box component="span" sx={{ display: "block", fontSize: "0.6875rem", color: "#64748b", fontWeight: 500 }}>
                      {issue.tenant?.phone || ""}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "#0f172a", fontWeight: 700 }}>{issue.title}</TableCell>
                  <TableCell sx={{ color: "#64748b", maxWidth: 260 }}>{issue.description || "-"}</TableCell>
                  <TableCell>
                    {images.length > 0 ? (
                      <Box sx={{ display: "flex", gap: 0.75 }}>
                        {images.slice(0, 3).map((img, idx) => (
                          <Box key={idx} component="img" src={img} alt=""
                            sx={{ width: 44, height: 44, objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0", cursor: "zoom-in" }}
                            onClick={() => window.open(img, "_blank")} />
                        ))}
                      </Box>
                    ) : "-"}
                  </TableCell>
                  <TableCell sx={{ color: "#64748b", whiteSpace: "nowrap" }}>{new Date(issue.createdAt).toLocaleString("vi-VN")}</TableCell>
                  <TableCell>
                    <Chip label={statusLabel[issue.status]} size="small"
                      sx={{ borderRadius: "12px", fontWeight: 600, bgcolor: issue.status === "resolved" ? "#d1fae5" : "#fef3c7", color: issue.status === "resolved" ? "#065f46" : "#d97706" }} />
                  </TableCell>
                  <TableCell>
                    {issue.status === "pending" ? (
                      <Button size="small" startIcon={<CheckCircleIcon sx={{ fontSize: 15 }} />} onClick={() => handleResolve(issue.id)}
                        sx={{ fontSize: "0.6875rem", fontWeight: 700, borderRadius: "10px", color: "#059669", bgcolor: "#d1fae5", "&:hover": { bgcolor: "#a7f3d0" }, textTransform: "none", px: 1.5, py: 0.5 }}>
                        Đã xử lý
                      </Button>
                    ) : (
                      <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 600 }}>Hoàn tất</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {issues.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: "#64748b", py: 6 }}>
                  Chưa có báo hỏng nào từ khách thuê.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
