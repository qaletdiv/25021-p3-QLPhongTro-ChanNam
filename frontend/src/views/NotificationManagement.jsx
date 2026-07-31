"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Snackbar, Alert, CircularProgress, Paper, Select, MenuItem, TextField, Button, FormControl,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import notificationApi from "../api/notificationApi";
import roomApi from "../api/roomApi";

const VARIABLES = ["TENKHACH", "MAPHONG", "TONG_TIEN", "HAN_THANH_TOAN"];

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [title, setTitle] = useState("Thông báo thu tiền phòng tháng 07/2026");
  const [content, setContent] = useState(
    "Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}), hóa đơn tháng này là {{TONG_TIEN}}₫. Vui lòng thanh toán trước ngày {{HAN_THANH_TOAN}}. Cảm ơn!"
  );
  const [targetRoom, setTargetRoom] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [notifRes, roomRes] = await Promise.all([notificationApi.getAll(), roomApi.getAll()]);
      setNotifications(notifRes.data.notifications || []);
      setRooms(roomRes.data.rooms || []);
    } catch {
      setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const insertVariable = (varName) => {
    setContent(prev => prev + `{{${varName}}}`);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsSending(true);
    setSuccessMsg("");
    try {
      const payload = { title, content, targetType: targetRoom === "all" ? "all" : "specific_rooms", targetRoomIds: targetRoom === "all" ? [] : [targetRoom] };
      await notificationApi.create(payload);
      setSuccessMsg("");
      fetchData();
      setTimeout(() => setSuccessMsg("Đã tự động gửi thông báo Zalo OA thành công tới danh sách khách hàng!"), 300);
      setTimeout(() => setSuccessMsg(""), 4300);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi gửi thông báo", severity: "error" });
    } finally { setIsSending(false); }
  };

  const rentedRooms = (rooms || []).filter(r => r.status === "rented");
  const sentNotifications = (notifications || []).filter(n => n.status === "sent");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.025em" }}>Quản Lý Thông Báo Zalo OA</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Soạn mẫu thông báo tự động cá nhân hóa biến động và gửi đồng loạt qua Zalo OA (ZBS API).
        </Typography>
      </Box>

      {loading ? <CircularProgress /> : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
          {/* Left: Form */}
          <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
              <SendIcon sx={{ fontSize: 18, color: "#2563eb" }} />
              <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.875rem" }}>Gửi Thông Báo Mới Zalo OA</Typography>
            </Box>

            {successMsg && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.75, bgcolor: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px", border: "1px solid #a7f3d0", mb: 2.5 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: "#059669" }} />
                <span>{successMsg}</span>
              </Box>
            )}

            <Box component="form" onSubmit={handleSend} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Target */}
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Đối Tượng Nhận Thông Báo *</Typography>
                <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}>
                  <Select value={targetRoom} onChange={(e) => setTargetRoom(e.target.value)}>
                    <MenuItem value="all">Tất Cả Các Phòng Đang Cho Thuê</MenuItem>
                    {rentedRooms.map((r) => {
                      const tenant = r.contracts?.[0]?.tenant;
                      return (
                        <MenuItem key={r.id} value={r.id}>
                          Phòng {r.room_number} - {tenant?.name || "—"} ({tenant?.phone || "—"})
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>

              {/* Title */}
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tiêu Đề Thông Báo *</Typography>
                <TextField fullWidth required value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Nhắc tiền phòng tháng 07/2026"
                  sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
                />
              </Box>

              {/* Content */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Nội Dung Tin Nhắn Mẫu *</Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8" }}>Click để chèn biến:</Typography>
                </Box>

                {/* Variable Chips */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
                  {VARIABLES.map((v) => (
                    <Box key={v} onClick={() => insertVariable(v)}
                      sx={{ px: 1.25, py: 0.5, bgcolor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: "0.6875rem", fontFamily: "monospace", fontWeight: 700, borderRadius: "8px", cursor: "pointer", "&:hover": { bgcolor: "#dbeafe" } }}
                    >
                      + {`{{${v}}}`}
                    </Box>
                  ))}
                </Box>

                <TextField
                  fullWidth multiline minRows={4} required value={content}
                  onChange={(e) => setContent(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" }, lineHeight: 1.6 } }}
                />
              </Box>

              {/* Submit */}
              <Button type="submit" variant="contained" disabled={isSending}
                sx={{ width: "100%", py: 1.5, fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
              >
                <BoltIcon sx={{ fontSize: 16 }} />
                <span>{isSending ? "Đang Gửi..." : "Lưu Dữ Liệu & Gửi Zalo OA Ngay"}</span>
              </Button>
            </Box>
          </Box>

          {/* Right: History */}
          <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
              <HistoryIcon sx={{ fontSize: 18, color: "#64748b" }} />
              <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.875rem" }}>
                Lịch Sử Đã Gửi Zalo OA ({sentNotifications.length})
              </Typography>
            </Box>

            <Box sx={{ maxHeight: 440, overflow: "auto", display: "flex", flexDirection: "column", gap: 1.5, pr: 0.5 }}>
              {sentNotifications.map((log) => (
                <Paper key={log.id} sx={{ p: 1.75, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.75rem" }}>
                      {log.targetRoomIds?.length > 0 ? `Phòng ${log.targetRoomIds.join(", ")}` : "Tất cả phòng"}
                    </Typography>
                    <Typography sx={{ px: 1.5, py: 0.25, bgcolor: "#d1fae5", color: "#065f46", fontWeight: 800, fontSize: "0.625rem", borderRadius: "9999px", border: "1px solid #a7f3d0" }}>
                      Gửi thành công
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                    Ngày gửi: {new Date(log.sentAt).toLocaleString("vi-VN")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.6875rem", mt: 0.5 }}>{log.title}</Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#475569", fontStyle: "italic", bgcolor: "#fff", p: 1.25, borderRadius: "12px", border: "1px solid #e2e8f0", mt: 0.75, lineHeight: 1.5 }}>
                    "{log.content}"
                  </Typography>
                </Paper>
              ))}
              {sentNotifications.length === 0 && (
                <Typography sx={{ textAlign: "center", color: "#94a3b8", fontSize: "0.75rem", py: 6 }}>
                  Chưa có thông báo nào được gửi.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
