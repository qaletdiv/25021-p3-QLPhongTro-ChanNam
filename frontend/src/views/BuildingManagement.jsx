"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Paper, Chip, IconButton, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ApartmentIcon from "@mui/icons-material/Apartment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MessageDialog from "../components/MessageDialog";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import BuildingModal from "../components/building/BuildingModal";
import buildingApi from "../api/buildingApi";

export default function BuildingManagement() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchBuildings = useCallback(async () => {
    try { const res = await buildingApi.getAll(); setBuildings(res.data.buildings); }
    catch { setSnack({ open: true, message: "Lỗi tải danh sách nhà trọ", severity: "error" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBuildings(); }, [fetchBuildings]);

  const openCreate = () => { setEditItem(null); setOpen(true); };
  const openEdit = (item) => { setEditItem(item); setOpen(true); };

  const handleSave = async (editItemArg, form) => {
    try {
      if (editItemArg) { await buildingApi.update(editItemArg.id, form); }
      else { await buildingApi.create(form); }
      setOpen(false);
      fetchBuildings();
      setTimeout(() => setSnack({ open: true, message: editItemArg ? "Cập nhật nhà trọ thành công" : "Thêm nhà trọ thành công", severity: "success" }), 300);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await buildingApi.delete(id);
      setDeleteItemId(null);
      setSnack({ open: true, message: "Xóa nhà trọ thành công", severity: "success" });
      fetchBuildings();
    } catch (err) {
      setDeleteItemId(null);
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi xóa", severity: "error" });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { sm: "center" }, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Quản Lý Nhà Trọ</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
            Nhóm phòng theo từng nhà, mỗi nhà có thể cấu hình riêng và lọc báo cáo độc lập.
          </Typography>
        </Box>
        <Box
          onClick={openCreate}
          sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 1.25, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", alignSelf: "flex-start" }}
        >
          <AddIcon sx={{ fontSize: 16 }} />
          <span>Thêm Nhà Mới</span>
        </Box>
      </Box>

      {/* Building Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2.5 }}>
        {buildings.map((b) => (
          <Paper key={b.id} sx={{ borderRadius: "16px", p: 2.5, border: "1px solid #e2e8f0", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }, transition: "all 0.2s" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
                <ApartmentIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "1.0625rem", fontWeight: 900, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</Typography>
                <Typography sx={{ fontSize: "0.6875rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.address || "Chưa có địa chỉ"}</Typography>
              </Box>
            </Box>

            <Paper sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9", mb: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Tổng phòng:</Typography>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a" }}>{b.roomCount || 0}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Đang cho thuê:</Typography>
                <Chip label={`${b.rentedCount || 0} phòng`} size="small" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 700, fontSize: "0.625rem", borderRadius: "9999px", border: "1px solid #a7f3d0", height: 20 }} />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Còn trống:</Typography>
                <Chip label={`${b.emptyCount || 0} phòng`} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.625rem", borderRadius: "9999px", border: "1px solid #fde68a", height: 20 }} />
              </Box>
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f1f5f9", pt: 1 }}>
              <IconButton size="small" onClick={() => openEdit(b)} sx={{ color: "#64748b", "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" } }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" onClick={() => setDeleteItemId(b.id)} sx={{ color: "#64748b", "&:hover": { color: "#e11d48", bgcolor: "#ffe4e6" } }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>

      {buildings.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8", fontSize: "0.75rem" }}>
          Chưa có nhà nào. Hãy thêm nhà trọ đầu tiên.
        </Box>
      )}

      <BuildingModal open={open} editItem={editItem} onClose={() => setOpen(false)} onSave={handleSave} />

      <ConfirmDialog
        open={!!deleteItemId}
        title="Xóa Nhà Trọ"
        message="Bạn có chắc muốn xóa nhà này? Chỉ có thể xóa nhà không còn phòng."
        confirmText="Xóa Nhà"
        onClose={() => setDeleteItemId(null)}
        onConfirm={() => handleDelete(deleteItemId)}
      />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
