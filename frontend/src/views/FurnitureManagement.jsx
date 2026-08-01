"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MessageDialog from "../components/MessageDialog";
import FurnitureTable from "../components/furniture/FurnitureTable";
import FurnitureModal from "../components/furniture/FurnitureModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import furnitureApi from "../api/furnitureApi";

export default function FurnitureManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchItems = useCallback(async () => {
    try { const res = await furnitureApi.getAll(); setItems(res.data.furnitures); }
    catch { setSnack({ open: true, message: "Lỗi tải danh sách vật dụng", severity: "error" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditItem(null); setOpen(true); };

  const openEdit = (item) => { setEditItem(item); setOpen(true); };

  const handleSave = async (editItemArg, form) => {
    try {
      if (editItemArg) { await furnitureApi.update(editItemArg.id, form); }
      else { await furnitureApi.create(form); }
      setOpen(false);
      fetchItems();
      setTimeout(() => setSnack({ open: true, message: editItemArg ? "Cập nhật vật dụng thành công" : "Thêm vật dụng thành công", severity: "success" }), 300);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await furnitureApi.delete(id);
      setDeleteItemId(null);
      setSnack({ open: true, message: "Xóa vật dụng thành công", severity: "success" });
      fetchItems();
    } catch (err) {
      setDeleteItemId(null);
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

      {loading ? <CircularProgress /> : (
        <FurnitureTable items={items} onEdit={openEdit} onDelete={setDeleteItemId} />
      )}

      <FurnitureModal open={open} editItem={editItem} onClose={() => setOpen(false)} onSave={handleSave} />

      <ConfirmDialog
        open={!!deleteItemId}
        title="Xóa Vật Dụng"
        message="Bạn có chắc muốn xóa vật dụng này? Hành động này không thể hoàn tác."
        confirmText="Xóa Vật Dụng"
        onClose={() => setDeleteItemId(null)}
        onConfirm={() => handleDelete(deleteItemId)}
      />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
