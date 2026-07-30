import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Chip, IconButton, TextField, Alert, CircularProgress, Snackbar, Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import EyeIcon from "@mui/icons-material/Visibility";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import roomApi from "../api/roomApi";

const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [detailRoom, setDetailRoom] = useState(null);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ room_number: "", floor: 1, area: 25, price: 3000000, default_payment_day: 5 });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchRooms = useCallback(async () => {
    try { const res = await roomApi.getAll(); setRooms(res.data.rooms); }
    catch { setSnack({ open: true, message: "Lỗi tải danh sách phòng", severity: "error" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const filteredRooms = rooms.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.room_number.toLowerCase().includes(q) && !r.contracts?.[0]?.tenant?.name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openAdd = () => { setEditRoom(null); setForm({ room_number: "", floor: 1, area: 25, price: 3000000, default_payment_day: 5 }); setOpenCreate(true); };
  const openEdit = (room) => { setEditRoom(room); setForm({ room_number: room.room_number, floor: room.floor, area: room.area, price: room.price, default_payment_day: room.default_payment_day }); setOpenCreate(true); };

  const handleSave = async () => {
    try {
      if (editRoom) { await roomApi.update(editRoom.id, form); setSnack({ open: true, message: "Cập nhật phòng thành công", severity: "success" }); }
      else { await roomApi.create(form); setSnack({ open: true, message: "Thêm phòng thành công", severity: "success" }); }
      setOpenCreate(false); fetchRooms();
    } catch (err) { setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này?")) return;
    try { await roomApi.delete(id); setSnack({ open: true, message: "Xóa phòng thành công", severity: "success" }); fetchRooms(); }
    catch (err) { setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" }); }
  };

  if (loading) return <CircularProgress />;

  const getContract = (room) => room.contracts?.[0];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.025em" }}>Quản Lý Danh Sách Phòng Trọ</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
            Theo dõi trạng thái phòng, doanh thu dự kiến và vật dụng bàn giao chi tiết.
          </Typography>
        </Box>
        <Box
          onClick={openAdd}
          sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 1.25, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", alignSelf: "flex-start" }}
        >
          <AddIcon sx={{ fontSize: 16 }} />
          <span>Thêm Phòng Mới</span>
        </Box>
      </Box>

      {/* Filter & Search Bar */}
      <Paper sx={{ p: 2, borderRadius: "16px", display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, gap: 2, justifyContent: "space-between", border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", gap: 0.5, bgcolor: "#f1f5f9", p: 0.5, borderRadius: "12px", width: { xs: "100%", md: "auto" } }}>
          {[
            { key: "all", label: `Tất Cả (${rooms.length})`, activeColor: "#2563eb" },
            { key: "empty", label: `Trống (${rooms.filter(r => r.status === "empty").length})`, activeColor: "#d97706" },
            { key: "rented", label: `Đã Thuê (${rooms.filter(r => r.status === "rented").length})`, activeColor: "#059669" },
          ].map((f) => (
            <Box key={f.key} onClick={() => setFilter(f.key)}
              sx={{ px: 1.75, py: 0.9, borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", bgcolor: filter === f.key ? f.activeColor : "transparent", color: filter === f.key ? "#fff" : "#475569", boxShadow: filter === f.key ? "0 1px 2px rgba(0,0,0,0.05)" : "none", transition: "all 0.15s", whiteSpace: "nowrap" }}
            >{f.label}</Box>
          ))}
        </Box>
        <Box sx={{ position: "relative", width: { xs: "100%", md: 280 } }}>
          <SearchIcon sx={{ position: "absolute", left: 10, top: 9, fontSize: 16, color: "#94a3b8", zIndex: 1 }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo số phòng hoặc tên khách..."
            style={{
              width: "100%", padding: "8.5px 12px 8.5px 34px", fontSize: "0.75rem",
              border: "1px solid #e2e8f0", borderRadius: "12px", outline: "none", boxSizing: "border-box",
              backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.backgroundColor = "#fff"; e.target.style.boxShadow = "0 0 0 2px rgba(37,99,235,0.2)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.backgroundColor = "#f8fafc"; e.target.style.boxShadow = "none"; }}
          />
        </Box>
      </Paper>

      {/* Room Cards Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2.5 }}>
        {filteredRooms.map((room) => {
          const contract = getContract(room);
          const tenant = contract?.tenant;
          return (
            <Paper
              key={room.id}
              sx={{
                borderRadius: "16px", p: 2.5, position: "relative", overflow: "hidden",
                border: room.status === "empty" ? "1px solid #fde68a" : "1px solid #e2e8f0",
                bgcolor: room.status === "empty" ? "rgba(255,251,235,0.5)" : "#fff",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
                transition: "all 0.2s",
              }}
            >
              {/* Status Pill & Floor */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Chip
                  size="small"
                  label={room.status === "rented" ? "\u25CF Đã Cho Thuê" : "\u25CB Còn Trống"}
                  sx={{
                    fontWeight: 700, fontSize: "0.6875rem", borderRadius: "9999px",
                    bgcolor: room.status === "rented" ? "#d1fae5" : "#fef3c7",
                    color: room.status === "rented" ? "#065f46" : "#92400e",
                    border: room.status === "rented" ? "1px solid #a7f3d0" : "1px solid #fde68a",
                  }}
                />
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, bgcolor: "#f1f5f9", px: 1, py: 0.25, borderRadius: "8px" }}>
                  Tầng {room.floor}
                </Typography>
              </Box>

              {/* Room Number & Price */}
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 2 }}>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.025em" }}>
                  Phòng {room.room_number}
                </Typography>
                <Typography sx={{ fontSize: "1.125rem", fontWeight: 800, color: "#2563eb" }}>
                  {formatCurrency(room.price)}
                  <Typography component="span" sx={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 400 }}>/tháng</Typography>
                </Typography>
              </Box>

              {/* Meta details */}
              <Paper sx={{ p: 1.75, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9", mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Diện tích:</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{room.area} m²</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Ngày thu tiền:</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>Ngày {room.default_payment_day} hàng tháng</Typography>
                </Box>
                {room.status === "rented" && tenant && (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", pt: 0.75, mt: 0.75 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Khách thuê:</Typography>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#059669" }}>{tenant.name}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Số điện thoại:</Typography>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#0f172a" }}>{tenant.phone}</Typography>
                    </Box>
                    {contract?.fingerprintCode && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 0.5, mt: 0.5 }}>
                        <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>Mã số vân tay:</Typography>
                        <Typography sx={{ fontFamily: "monospace", fontSize: "0.6875rem", fontWeight: 700, bgcolor: "#e2e8f0", px: 0.75, py: 0.25, borderRadius: "6px" }}>
                          {contract.fingerprintCode}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Paper>

              {/* Card Actions */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", pt: 1.5 }}>
                <Box onClick={() => setDetailRoom(room)} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", cursor: "pointer", "&:hover": { color: "#1d4ed8" } }}>
                  <EyeIcon sx={{ fontSize: 16 }} />
                  <span>Xem vật dụng & chi tiết</span>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton size="small" onClick={() => openEdit(room)} sx={{ color: "#64748b", "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" } }}>
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(room.id)} disabled={room.status !== "empty"}
                    sx={{ color: "#64748b", "&:hover": { color: "#e11d48", bgcolor: "#ffe4e6" }, "&.Mui-disabled": { opacity: 0.3 } }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {filteredRooms.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8", fontSize: "0.75rem" }}>
          Không tìm thấy phòng nào.
        </Box>
      )}

      {/* Create / Edit Room Modal */}
      {openCreate && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 460, overflow: "hidden" }}>
            {/* Header */}
            <Box sx={{ bgcolor: "#0f172a", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <MeetingRoomIcon sx={{ color: "#fcd34d", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
                  {editRoom ? "Cập Nhật Phòng" : "Thêm Phòng Trọ Mới"}
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenCreate(false)} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </IconButton>
            </Box>

            {/* Form */}
            <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số / Tên Phòng *</Typography>
                <TextField fullWidth size="small" placeholder="Ví dụ: 301" value={form.room_number}
                  onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" }, "&:hover fieldset": { borderColor: "#cbd5e1" }, "&.Mui-focused fieldset": { borderColor: "#2563eb" } } }} />
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tầng</Typography>
                  <TextField fullWidth size="small" type="number" value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Diện Tích (m²)</Typography>
                  <TextField fullWidth size="small" type="number" value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
                </Box>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Giá Thuê (VND/Tháng)</Typography>
                  <TextField fullWidth size="small" type="number" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ngày Thu Tiền</Typography>
                  <TextField fullWidth size="small" type="number" value={form.default_payment_day}
                    onChange={(e) => setForm({ ...form, default_payment_day: e.target.value })} inputProps={{ min: 1, max: 31 }}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
                </Box>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Box onClick={() => setOpenCreate(false)} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
              <Box onClick={handleSave} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
                {editRoom ? "Cập Nhật" : "Lưu Phòng Mới"}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Room Detail Modal */}
      {detailRoom && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 520, overflow: "hidden" }}>
            {/* Header */}
            <Box sx={{ bgcolor: "#0f172a", px: 3, py: 2.5, borderBottom: "1px solid #1e293b" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>Chi Tiết Phòng {detailRoom.room_number}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.25 }}>Danh sách vật dụng bàn giao theo hợp đồng hiện tại</Typography>
                </Box>
                <IconButton onClick={() => setDetailRoom(null)} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Status & Fingerprint Header */}
              <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8" }}>Trạng thái:</Typography>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 800, color: detailRoom.status === "rented" ? "#059669" : "#d97706" }}>
                    {detailRoom.status === "rented" ? "Đã Cho Thuê" : "Đang Trống"}
                  </Typography>
                </Box>
                {(getContract(detailRoom)?.fingerprintCode) && (
                  <Box sx={{ fontSize: "0.75rem", color: "#0f172a" }}>
                    Mã Vân Tay: <Box component="span" sx={{ fontFamily: "monospace", fontWeight: 800, bgcolor: "#0f172a", color: "#fcd34d", px: 1, py: 0.25, borderRadius: "6px", ml: 0.5 }}>{getContract(detailRoom).fingerprintCode}</Box>
                  </Box>
                )}
              </Paper>

              {/* Inventory Items */}
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5 }}>
                  Danh Sách Vật Dụng Trong Phòng
                </Typography>
                <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                  {(getContract(detailRoom)?.contractFurnitures?.length > 0) ? (
                    <Box>
                      {getContract(detailRoom).contractFurnitures.map((cf, idx) => (
                        <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.75, borderBottom: idx < getContract(detailRoom).contractFurnitures.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8125rem" }}>{cf.furniture?.name || `Vật dụng #${cf.furnitureId}`}</Typography>
                          <Chip label={`SL: ${cf.quantity}`} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, borderRadius: "8px", fontSize: "0.6875rem", border: "1px solid #fde68a" }} />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ p: 3, textAlign: "center", color: "#64748b", fontSize: "0.75rem" }}>
                      Phòng hiện chưa có hợp đồng bàn giao vật dụng riêng.
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
              <Box onClick={() => setDetailRoom(null)} sx={{ px: 4, py: 1.25, fontSize: "0.75rem", fontWeight: 800, bgcolor: "#0f172a", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1e293b" }, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                Đóng Chi Tiết
              </Box>
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
