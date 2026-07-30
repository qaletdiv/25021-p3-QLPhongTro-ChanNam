import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, Snackbar, TableContainer, Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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
      if (editItem) {
        await furnitureApi.update(editItem.id, form);
        setSnack({ open: true, message: "Cập nhật vật dụng thành công", severity: "success" });
      } else {
        await furnitureApi.create(form);
        setSnack({ open: true, message: "Thêm vật dụng thành công", severity: "success" });
      }
      setOpen(false);
      fetchItems();
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
    <Box>
      <Box mb={3}>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Quản lý vật dụng</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>Quản lý danh sách vật dụng trong ký túc xá</Typography>
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ borderRadius: "12px", bgcolor: "#2563eb", textTransform: "none", fontWeight: 600 }}
        >
          Thêm vật dụng mới
        </Button>
      </Box>

      {loading ? <CircularProgress /> : (
        <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Tên vật dụng</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Ghi chú</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Số lượng mặc định</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }} align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.note || "-"}</TableCell>
                    <TableCell>{item.default_quantity}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => openEdit(item)}
                        sx={{ "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" } }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(item.id)}
                        sx={{ "&:hover": { color: "#e11d48", bgcolor: "#ffe4e6" } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>{editItem ? "Cập nhật vật dụng" : "Thêm vật dụng mới"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Tên vật dụng" margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          <TextField fullWidth label="Ghi chú" margin="normal" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} multiline rows={2} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
          <TextField fullWidth label="Số lượng mặc định" type="number" margin="normal" value={form.default_quantity} onChange={(e) => setForm({ ...form, default_quantity: Number(e.target.value) })} inputProps={{ min: 1 }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: "12px", textTransform: "none", color: "#64748b" }}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: "12px", bgcolor: "#2563eb", textTransform: "none", fontWeight: 600 }}>{editItem ? "Cập nhật" : "Thêm"}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
