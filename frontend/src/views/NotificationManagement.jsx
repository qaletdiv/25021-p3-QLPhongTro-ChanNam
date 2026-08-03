"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, CircularProgress, Paper, TextField, Button, Autocomplete,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import MessageDialog from "../components/MessageDialog";
import notificationApi from "../api/notificationApi";
import roomApi from "../api/roomApi";
import settingApi from "../api/settingApi";
import { resolveNotificationTemplate } from "../utils/notificationTemplate";

const VARIABLES = ["TENKHACH", "MAPHONG", "TONG_TIEN", "HAN_THANH_TOAN"];
const AUTO_VARIABLES = ["TENKHACH", "MAPHONG", "TONG_TIEN", "THANG", "HAN_THANH_TOAN"];

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(
    "Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}),\n Cảm ơn!"
  );
  const [targetRoom, setTargetRoom] = useState("all");
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [autoTemplate, setAutoTemplate] = useState("");
  const [autoSavedMsg, setAutoSavedMsg] = useState("");
  const leftColRef = useRef(null);
  const [leftColHeight, setLeftColHeight] = useState(null);

  useEffect(() => {
    if (!leftColRef.current) return;
    const el = leftColRef.current;
    const measure = () => setLeftColHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading]);

  const fetchData = useCallback(async () => {
    try {
      const [notifRes, roomRes, setRes] = await Promise.all([notificationApi.getAll(), roomApi.getAll(), settingApi.getAll("")]);
      setNotifications(notifRes.data.notifications || []);
      setRooms(roomRes.data.rooms || []);
      setAutoTemplate(setRes.data.settings?.autoReminderTemplate || "");
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
      fetchData();
      setTimeout(() => setSuccessMsg("Đã tự động gửi thông báo Telegram thành công tới danh sách khách hàng!"), 300);
      setTimeout(() => setSuccessMsg(""), 4300);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi gửi thông báo", severity: "error" });
    } finally { setIsSending(false); }
  };

  const rentedRooms = (rooms || []).filter(r => r.status === "rented");
  const sentNotifications = (notifications || []).filter(n => n.status === "sent");
  const roomOptions = [{ id: "all", label: "Tất Cả Các Phòng Đang Cho Thuê" }, ...rentedRooms.map((r) => {
    const tenant = r.contracts?.[0]?.tenant;
    return { id: r.id, label: `Phòng ${r.room_number} - ${tenant?.name || "—"} (${tenant?.phone || "—"})` };
  })];

  const parseRoomIds = (log) => {
    return typeof log.targetRoomIds === "string" ? JSON.parse(log.targetRoomIds) : log.targetRoomIds || [];
  };

  const resolveLogContent = (log) => {
    const monthStr = (() => {
      const d = log.sentAt || log.createdAt;
      if (!d) return "";
      const dt = new Date(d);
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      return `${mm}/${dt.getFullYear()}`;
    })();
    const roomIds = parseRoomIds(log);
    if (roomIds.length === 0) return resolveNotificationTemplate(log.content, { THANG: monthStr });
    return roomIds.map((id) => {
      const room = rooms.find((r) => String(r.id) === String(id));
      const activeContract = room?.contracts?.find((c) => c.status === "active");
      return resolveNotificationTemplate(log.content, {
        TENKHACH: activeContract?.tenant?.name || "",
        MAPHONG: room?.room_number || "",
        TONG_TIEN: room?.price != null ? String(room.price) : "",
        THANG: monthStr,
        HAN_THANH_TOAN: activeContract?.paymentDay ? String(activeContract.paymentDay + 5) : "",
      });
    }).join("\n\n─────\n\n");
  };

  const insertAutoVariable = (varName) => {
    setAutoTemplate((prev) => prev + `{{${varName}}}`);
  };

  const handleSaveAutoTemplate = async () => {
    const invalid = /[`$]/.test(autoTemplate)
      ? "Mẫu không được chứa backtick (`) hoặc ${...}"
      : null;
    if (invalid) {
      setSnack({ open: true, message: invalid, severity: "error" });
      return;
    }
    try {
      await settingApi.save({ autoReminderTemplate: autoTemplate }, "");
      setAutoSavedMsg("Đã lưu mẫu thông báo nhắc nợ tự động!");
      setTimeout(() => setAutoSavedMsg(""), 4000);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi lưu mẫu", severity: "error" });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" fontWeight="bold">Quản Lý Thông Báo Telegram</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Soạn mẫu thông báo tự động cá nhân hóa biến động và gửi đồng loạt qua Telegram Bot.
        </Typography>
      </Box>

      {loading ? <CircularProgress /> : (
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, alignItems: { lg: "flex-start" } }}>
          {/* Left column: Form + Auto template */}
          <Box ref={leftColRef} sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Left: Form */}
          <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
              <SendIcon sx={{ fontSize: 18, color: "#2563eb" }} />
              <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>Gửi Thông Báo Mới Telegram</Typography>
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
                <Autocomplete
                  fullWidth size="small" disableClearable
                  options={roomOptions}
                  getOptionLabel={(o) => o.label}
                  value={roomOptions.find((o) => String(o.id) === String(targetRoom)) || null}
                  onChange={(e, o) => setTargetRoom(o ? o.id : "all")}
                  renderInput={(params) => <TextField {...params} />}
                />
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
                <span>{isSending ? "Đang Gửi..." : "Lưu Dữ Liệu & Gửi Telegram Ngay"}</span>
              </Button>
            </Box>
          </Box>

          {/* Auto reminder template editor (left column) */}
          <Box sx={{ bgcolor: "#fff", p: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 2.5 }}>
              <BoltIcon sx={{ fontSize: 18, color: "#d97706" }} />
              <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>Mẫu Thông Báo Nhắc Nợ Tự Động</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: 2 }}>
              Nội dung này sẽ được hệ thống dùng để <b>tự động gửi nhắc nợ</b> qua Telegram vào đúng <b>ngày thu tiền</b> của từng phòng. Nếu để trống, hệ thống dùng mẫu mặc định.
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
              {AUTO_VARIABLES.map((v) => (
                <Box key={v} onClick={() => insertAutoVariable(v)}
                  sx={{ px: 1.25, py: 0.5, bgcolor: "#fff7ed", color: "#b45309", border: "1px solid #fed7aa", fontSize: "0.6875rem", fontFamily: "monospace", fontWeight: 700, borderRadius: "8px", cursor: "pointer", "&:hover": { bgcolor: "#ffedd5" } }}
                >
                  + {`{{${v}}}`}
                </Box>
              ))}
            </Box>

            <TextField
              fullWidth multiline minRows={4} value={autoTemplate} onChange={(e) => setAutoTemplate(e.target.value)}
              placeholder="Kính gửi {{TENKHACH}} (Phòng {{MAPHONG}}), đến kỳ thu tiền nhà tháng {{THANG}}. Vui lòng thanh toán trước ngày {{HAN_THANH_TOAN}}. Cảm ơn!"
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" }, lineHeight: 1.6 } }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
              <Button variant="contained" onClick={handleSaveAutoTemplate}
                sx={{ py: 1, px: 3, fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px", textTransform: "none", bgcolor: "#d97706", "&:hover": { bgcolor: "#b45309" } }}>
                Lưu Mẫu Nhắc Nợ Tự Động
              </Button>
              {autoSavedMsg && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75, bgcolor: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: 700, borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                  <span>{autoSavedMsg}</span>
                </Box>
              )}
            </Box>
          </Box>
          </Box>

          {/* Right: History (stretches to match left column height) */}
          <Box sx={{ flex: 1, minWidth: 0, bgcolor: "#fff", p: 3, borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", height: leftColHeight ? `${leftColHeight}px` : "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid #f1f5f9", pb: 2, mb: 3 }}>
              <HistoryIcon sx={{ fontSize: 18, color: "#64748b" }} />
              <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>
                Lịch Sử Đã Gửi Telegram ({sentNotifications.length})
              </Typography>
            </Box>

            <Box sx={{ flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: 1.5, pr: 0.5 }}>
              {sentNotifications.map((log) => (
                <Paper key={log.id} sx={{ p: 1.75, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.75rem" }}>
                      {(() => {
                        const roomIds = parseRoomIds(log);
                        if (roomIds.length === 0) return "Tất cả phòng";
                        const roomNames = roomIds.map((id) => {
                          const room = rooms.find((r) => String(r.id) === String(id));
                          return room ? room.room_number : id;
                        });
                        return `Phòng ${roomNames.join(", ")}`;
                      })()}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.75 }}>
                      {log.source === "auto" && (
                        <Typography sx={{ px: 1.5, py: 0.25, bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.625rem", borderRadius: "9999px", border: "1px solid #fde68a" }}>
                          Tự động
                        </Typography>
                      )}
                      <Typography sx={{ px: 1.5, py: 0.25, bgcolor: "#d1fae5", color: "#065f46", fontWeight: 700, fontSize: "0.625rem", borderRadius: "9999px", border: "1px solid #a7f3d0" }}>
                        Gửi thành công
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                    Ngày gửi: {new Date(log.sentAt).toLocaleString("vi-VN")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.6875rem", mt: 0.5 }}>{log.title}</Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#475569", fontStyle: "italic", bgcolor: "#fff", p: 1.25, borderRadius: "12px", border: "1px solid #e2e8f0", mt: 0.75, lineHeight: 1.5 }}>
                    "{resolveLogContent(log)}"
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

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
