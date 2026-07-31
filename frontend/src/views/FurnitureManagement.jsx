"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, IconButton, TextField, CircularProgress, Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import MessageDialog from "../components/MessageDialog";
import furnitureApi from "../api/furnitureApi";

export default function FurnitureManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", note: "", default_quantity: 1 });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchItems = useCallback(async () => {
    try { const res = await furnitureApi.getAll(); setItems(res.data.furnitures); }
    catch { setSnack({ open: true, message: "Lỗi tải danh sách vật dụng", severity: "error" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditItem(null); setForm({ name: "", note: "", default_quantity: 1 }); setOpen(true); };

  const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, note: item.note || "", default_quantity: item.default_quantity }); setOpen(true); };

  const handleSave = async () => {
    try {
      if (editItem) { await furnitureApi.update(editItem.id, form); }
      else { await furnitureApi.create(form); }
      setOpen(false);
      fetchItems();
      setTimeout(() => setSnack({ open: true, message: editItem ? "Cập nhật vật dụng thành công" : "Thêm vật dụng thành công", severity: "success" }), 300);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa vật dụng này?")) return;
    try {
      await furnitureApi.delete(id);
      setSnack({ open: true, message: "Xóa vật dụng thành công", severity: "success" });
      fetchItems();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi xóa", severity: "error" });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.025em" }}>Quản Lý Vật Dụng & Thiết Bị Phòng Trọ</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
            Danh mục tài sản mặc định dùng để bàn giao và tạo phụ lục hợp đồng khi khách nhận phòng.
          </Typography>
        </Box>
        <Box
          onClick={openCreate}
          sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 1.25, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", alignSelf: "flex-start" }}
        >
          <AddIcon sx={{ fontSize: 16 }} />
          <span>Thêm Vật Dụng Mới</span>
        </Box>
      </Box>

      {/* Table */}
      {loading ? <CircularProgress /> : (
        <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["STT", "Tên Vật Dụng / Thiết Bị", "Ghi Chú / Tình Trạng", "Số Lượng Mặc Định", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontWeight: 700, color: "#475569", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "" ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#94a3b8" }}>{idx + 1}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>
                      {item.name}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#475569" }}>{item.note || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "4px 10px", backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "0.75rem" }}>
                        {item.default_quantity}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: "#64748b", "&:hover": { color: "#d97706", bgcolor: "#fffbeb" } }}>
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: "#64748b", "&:hover": { color: "#e11d48", bgcolor: "#ffe4e6" } }}>
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Create / Edit Modal */}
      {open && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 460, overflow: "hidden" }}>
            {/* Header */}
            <Box sx={{ bgcolor: "#2563eb", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <InventoryIcon sx={{ color: "#fff", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
                  {editItem ? "Sửa Vật Dụng" : "Thêm Vật Dụng Mới"}
                </Typography>
              </Box>
              <IconButton onClick={() => setOpen(false)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </IconButton>
            </Box>

            {/* Form */}
            <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tên Vật Dụng *</Typography>
                <TextField fullWidth size="small" placeholder="Ví dụ: Điều hòa Inverter 1.5 HP"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" }, "&:hover fieldset": { borderColor: "#cbd5e1" }, "&.Mui-focused fieldset": { borderColor: "#2563eb" } } }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ghi Chú Mô Tả</Typography>
                <TextField fullWidth size="small" placeholder="Ví dụ: Mới 99%, đầy đủ phụ kiện"
                  value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                  sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số Lượng Mặc Định</Typography>
                <TextField fullWidth size="small" type="number" slotProps={{ htmlInput: { min: 1 } }}
                  value={form.default_quantity} onChange={(e) => setForm({ ...form, default_quantity: Number(e.target.value) })}
                  sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Box onClick={() => setOpen(false)} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
              <Box onClick={handleSave} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
                Lưu Thông Tin
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
