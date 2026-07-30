import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Card, CardContent, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress, Snackbar, Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import EyeIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import roomApi from "../api/roomApi";

const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN");

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [detailRoom, setDetailRoom] = useState(null);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ room_number: "", floor: "", area: "", price: "", default_payment_day: 5 });
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
      const matchRoom = r.room_number.toLowerCase().includes(q);
      const matchTenant = r.contracts?.[0]?.tenant?.name?.toLowerCase().includes(q);
      if (!matchRoom && !matchTenant) return false;
    }
    return true;
  });

  const openCreate = () => { setEditRoom(null); setForm({ room_number: "", floor: 1, area: 25, price: 3000000, default_payment_day: 5 }); setOpen(true); };
  const openEdit = (room) => { setEditRoom(room); setForm({ room_number: room.room_number, floor: room.floor, area: room.area, price: room.price, default_payment_day: room.default_payment_day }); setOpen(true); };

  const handleSave = async () => {
    try {
      if (editRoom) { await roomApi.update(editRoom.id, form); setSnack({ open: true, message: "Cập nhật phòng thành công", severity: "success" }); }
      else { await roomApi.create(form); setSnack({ open: true, message: "Thêm phòng thành công", severity: "success" }); }
      setOpen(false); fetchRooms();
    } catch (err) { setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này?")) return;
    try { await roomApi.delete(id); setSnack({ open: true, message: "Xóa phòng thành công", severity: "success" }); fetchRooms(); }
    catch (err) { setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" }); }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4">Quản Lý Danh Sách Phòng Trọ</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>Xem danh sách phòng, trạng thái cho thuê và quản lý thông tin.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Thêm Phòng Mới</Button>
      </Box>

      {/* Filter & Search Bar */}
      <Paper sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 0.5, bgcolor: "#f1f5f9", p: 0.5, borderRadius: "12px" }}>
          {[
            { key: "all", label: `Tất Cả (${rooms.length})` },
            { key: "empty", label: `Trống (${rooms.filter(r => r.status === "empty").length})` },
            { key: "rented", label: `Đã Thuê (${rooms.filter(r => r.status === "rented").length})` },
          ].map((f) => (
            <Box
              key={f.key}
              onClick={() => setFilter(f.key)}
              sx={{
                px: 1.5, py: 0.7, borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                bgcolor: filter === f.key ? (f.key === "empty" ? "#d97706" : f.key === "rented" ? "#059669" : "#fff") : "transparent",
                color: filter === f.key ? "#fff" : "#475569",
                boxShadow: filter === f.key ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.15s",
              }}
            >{f.label}</Box>
          ))}
        </Box>
        <Box sx={{ position: "relative", width: { xs: "100%", md: 280 } }}>
          <SearchIcon sx={{ position: "absolute", left: 10, top: 8, fontSize: 16, color: "#94a3b8" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo số phòng hoặc tên khách..."
            style={{
              width: "100%", padding: "8px 12px 8px 34px", fontSize: "0.75rem",
              border: "1px solid #cbd5e1", borderRadius: "12px", outline: "none", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.boxShadow = "0 0 0 2px rgba(37,99,235,0.2)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.boxShadow = "none"; }}
          />
        </Box>
      </Paper>

      {/* Room Cards Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
        {filteredRooms.map((room) => (
          <Card
            key={room.id}
            sx={{
              borderRadius: "16px", p: 2, position: "relative",
              borderColor: room.status === "empty" ? "#fde68a" : "#e2e8f0",
              bgcolor: room.status === "empty" ? "#fffbeb" : "#fff",
              "&:hover": { boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" },
              transition: "all 0.2s",
            }}
          >
            {/* Status & Floor */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Chip
                size="small"
                label={room.status === "rented" ? "\u25CF Đã Thuê" : "\u25CB Còn Trống"}
                sx={{
                  fontWeight: 700, fontSize: "0.6875rem", borderRadius: "9999px",
                  bgcolor: room.status === "rented" ? "#d1fae5" : "#fef3c7",
                  color: room.status === "rented" ? "#065f46" : "#92400e",
                }}
              />
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                Tầng {room.floor}
              </Typography>
            </Box>

            {/* Room Number & Price */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1.5 }}>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 900, color: "#0f172a" }}>
                Phòng {room.room_number}
              </Typography>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#2563eb" }}>
                {formatCurrency(room.price)}đ
                <Typography component="span" sx={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 400 }}>/tháng</Typography>
              </Typography>
            </Box>

            {/* Meta */}
            <Paper sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9", mb: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Diện tích:</Typography>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#0f172a" }}>{room.area} m²</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Ngày thu tiền:</Typography>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#0f172a" }}>Ngày {room.default_payment_day}</Typography>
              </Box>
              {room.status === "rented" && room.contracts?.[0]?.tenant && (
                <>
                  <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", pt: 0.75, mt: 0.75 }}>
                    <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Khách thuê:</Typography>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669" }}>{room.contracts[0].tenant.name}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>SĐT:</Typography>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 500, color: "#0f172a" }}>{room.contracts[0].tenant.phone}</Typography>
                  </Box>
                </>
              )}
            </Paper>

            {/* Actions */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", pt: 1.5 }}>
              <Button size="small" startIcon={<EyeIcon />} onClick={() => setDetailRoom(room)}
                sx={{ color: "#2563eb", fontSize: "0.75rem", fontWeight: 600, "&:hover": { bgcolor: "#eff6ff" } }}
              >
                Xem chi tiết
              </Button>
              <Box>
                <IconButton size="small" onClick={() => openEdit(room)} sx={{ "&:hover": { bgcolor: "#f1f5f9" } }}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => handleDelete(room.id)} disabled={room.status !== "empty"}
                  sx={{ "&:hover": { bgcolor: "#ffe4e6" }, "&.Mui-disabled": { opacity: 0.3 } }}
                ><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {filteredRooms.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8, color: "#64748b", fontSize: "0.875rem" }}>
          Không tìm thấy phòng nào.
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editRoom ? "Cập nhật phòng" : "Thêm Phòng Trọ Mới"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField fullWidth label="Số / Tên Phòng *" value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} placeholder="Ví dụ: 301" required />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField fullWidth label="Tầng" type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
              <TextField fullWidth label="Diện Tích (m²)" type="number" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField fullWidth label="Giá Thuê (VND/Tháng)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <TextField fullWidth label="Ngày Thu Tiền" type="number" value={form.default_payment_day} onChange={(e) => setForm({ ...form, default_payment_day: e.target.value })} inputProps={{ min: 1, max: 31 }} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>{editRoom ? "Cập Nhật" : "Lưu Phòng Mới"}</Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailRoom} onClose={() => setDetailRoom(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box>
            <Typography variant="h6" sx={{ color: "#fff" }}>Chi Tiết Phòng {detailRoom?.room_number}</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>Danh sách vật dụng bàn giao theo hợp đồng</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailRoom && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Trạng thái:</Typography>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: detailRoom.status === "rented" ? "#059669" : "#d97706" }}>
                    {detailRoom.status === "rented" ? "Đã Cho Thuê" : "Đang Trống"}
                  </Typography>
                </Box>
                {detailRoom.contracts?.[0]?.fingerprintCode && (
                  <Box sx={{ fontSize: "0.75rem", color: "#0f172a" }}>
                    Mã Vân Tay: <Box component="span" sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "#e2e8f0", px: 0.75, py: 0.25, borderRadius: "4px" }}>{detailRoom.contracts[0].fingerprintCode}</Box>
                  </Box>
                )}
              </Paper>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Danh Sách Vật Dụng Trong Phòng
              </Typography>
              <Paper sx={{ borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                {(detailRoom.contracts?.[0]?.contractFurnitures || []).length > 0 ? (
                  <Box sx={{ divideY: "1px solid #f1f5f9" }}>
                    {detailRoom.contracts[0].contractFurnitures.map((cf, idx) => (
                      <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", p: 1.5, borderBottom: "1px solid #f1f5f9", fontSize: "0.8125rem" }}>
                        <Typography sx={{ fontWeight: 500, color: "#0f172a" }}>{cf.furniture?.name || `Vật dụng #${cf.furnitureId}`}</Typography>
                        <Chip label={`SL: ${cf.quantity}`} size="small" sx={{ bgcolor: "#eff6ff", color: "#2563eb", fontWeight: 700, borderRadius: "6px", fontSize: "0.6875rem" }} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: "center", color: "#64748b", fontSize: "0.75rem" }}>
                    Phòng hiện chưa có vật dụng nào được bàn giao.
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailRoom(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
