"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress, MenuItem, TextField, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MessageDialog from "../components/MessageDialog";
import FilterBar from "../components/ui/FilterBar";
import RoomCard from "../components/room/RoomCard";
import RoomFormModal from "../components/room/RoomFormModal";
import RoomDetailModal from "../components/room/RoomDetailModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import roomApi from "../api/roomApi";
import contractApi from "../api/contractApi";
import furnitureApi from "../api/furnitureApi";
import buildingApi from "../api/buildingApi";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [detailRoom, setDetailRoom] = useState(null);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ room_number: "", floor: 1, area: 25, price: 3000000, default_payment_day: 5, buildingId: "" });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [furnitureEditMode, setFurnitureEditMode] = useState(false);
  const [furnitureEditList, setFurnitureEditList] = useState([]);
  const [furnitureEditSelections, setFurnitureEditSelections] = useState({});
  const [furnitureEditSaving, setFurnitureEditSaving] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState(null);

  const getContract = (room) => room.contracts?.[0];

  const fetchRooms = useCallback(async () => {
    try {
      const params = {};
      if (buildingFilter !== "all") params.buildingId = buildingFilter;
      const res = await roomApi.getAll(null, params);
      setRooms(res.data.rooms);
    }
    catch { setSnack({ open: true, message: "Lỗi tải danh sách phòng", severity: "error" }); }
    finally { setLoading(false); }
  }, [buildingFilter]);

  const fetchBuildings = useCallback(async () => {
    try { const res = await buildingApi.getAll(); setBuildings(res.data.buildings || []); }
    catch { /* bo qua */ }
  }, []);

  useEffect(() => { fetchBuildings(); fetchRooms(); }, [fetchBuildings, fetchRooms]);

  const filteredRooms = rooms.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.room_number.toLowerCase().includes(q) && !r.contracts?.[0]?.tenant?.name?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const roomCounts = {
    all: rooms.length,
    empty: rooms.filter(r => r.status === "empty").length,
    rented: rooms.filter(r => r.status === "rented").length,
  };

  const openAdd = () => { setEditRoom(null); setForm({ room_number: "", floor: 1, area: 25, price: 3000000, default_payment_day: 5, buildingId: buildingFilter !== "all" ? buildingFilter : "" }); setOpenCreate(true); };
  const openEdit = (room) => { setEditRoom(room); setForm({ room_number: room.room_number, floor: room.floor, area: room.area, price: room.price, default_payment_day: room.default_payment_day, buildingId: room.buildingId || "" }); setOpenCreate(true); };

  const handleSave = async () => {
    try {
      const payload = { ...form, buildingId: form.buildingId ? Number(form.buildingId) : null };
      if (editRoom) { await roomApi.update(editRoom.id, payload); }
      else { await roomApi.create(payload); }
      setOpenCreate(false); fetchRooms();
      setTimeout(() => setSnack({ open: true, message: editRoom ? "Cập nhật phòng thành công" : "Thêm phòng thành công", severity: "success" }), 300);
    } catch (err) { setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" }); }
  };

  const handleDelete = async (id) => {
    try { await roomApi.delete(id); setDeleteRoomId(null); setSnack({ open: true, message: "Xóa phòng thành công", severity: "success" }); fetchRooms(); }
    catch (err) { setDeleteRoomId(null); setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" }); }
  };

  const openDetail = async (room) => {
    try {
      const res = await roomApi.getById(room.id);
      setDetailRoom(res.data.room);
    } catch {
      setSnack({ open: true, message: "Lỗi tải chi tiết phòng", severity: "error" });
    }
  };

  const openFurnitureEdit = async () => {
    const contract = getContract(detailRoom);
    if (!contract) return;
    try {
      const res = await furnitureApi.getAll();
      const allFurniture = res.data.furnitures;
      setFurnitureEditList(allFurniture);
      const selections = {};
      allFurniture.forEach(f => {
        const cf = contract.contractFurnitures?.find(c => c.furnitureId === f.id);
        selections[f.id] = { checked: !!cf, quantity: cf ? cf.quantity : f.default_quantity || 1 };
      });
      setFurnitureEditSelections(selections);
      setFurnitureEditMode(true);
    } catch {
      setSnack({ open: true, message: "Lỗi tải danh sách vật dụng", severity: "error" });
    }
  };

  const toggleFurniture = (furnitureId, sel) => {
    setFurnitureEditSelections({ ...furnitureEditSelections, [furnitureId]: { ...sel, checked: !sel.checked } });
  };

  const changeFurnitureQuantity = (furnitureId, quantity, sel) => {
    setFurnitureEditSelections({ ...furnitureEditSelections, [furnitureId]: { ...sel, quantity } });
  };

  const handleFurnitureSave = async () => {
    try {
      setFurnitureEditSaving(true);
      const contract = getContract(detailRoom);
      if (!contract) return;
      const furnitures = Object.entries(furnitureEditSelections)
        .filter(([, v]) => v.checked)
        .map(([furnitureId, v]) => ({ furnitureId: Number(furnitureId), quantity: v.quantity }));
      await contractApi.update(contract.id, { furnitures });
      setFurnitureEditMode(false);
      const res = await roomApi.getById(detailRoom.id);
      setDetailRoom(res.data.room);
      setTimeout(() => setSnack({ open: true, message: "Cập nhật vật dụng thành công", severity: "success" }), 300);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    } finally { setFurnitureEditSaving(false); }
  };

  if (loading) return <CircularProgress />;

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

      <FilterBar
        filters={[
          { key: "all", label: "Tất Cả", activeColor: "#2563eb" },
          { key: "empty", label: "Trống", activeColor: "#d97706" },
          { key: "rented", label: "Đã Thuê", activeColor: "#059669" },
        ]}
        total={rooms.length}
        counts={roomCounts}
        activeKey={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo số phòng hoặc tên khách..."
      />

      {buildings.length > 0 && (
        <TextField
          select
          size="small"
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          slotProps={{
            input: { startAdornment: (<InputAdornment position="start"><ApartmentIcon sx={{ fontSize: 18, color: "#64748b" }} /></InputAdornment>) },
          }}
          sx={{ maxWidth: 320, "& .MuiSelect-select": { py: 1.1, fontSize: "0.75rem", fontWeight: 600 } }}
        >
          <MenuItem value="all">Tất cả các nhà</MenuItem>
          {buildings.map((b) => (
            <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
          ))}
        </TextField>
      )}

      {/* Room Cards Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2.5 }}>
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} onOpenDetail={openDetail} onOpenEdit={openEdit} onDelete={setDeleteRoomId} />
        ))}
      </Box>

      {filteredRooms.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8", fontSize: "0.75rem" }}>
          Không tìm thấy phòng nào.
        </Box>
      )}

      <RoomFormModal open={openCreate} editRoom={editRoom} form={form} setForm={setForm} buildings={buildings} onClose={() => setOpenCreate(false)} onSave={handleSave} />

      <RoomDetailModal
        detailRoom={detailRoom}
        furnitureEditMode={furnitureEditMode}
        furnitureEditList={furnitureEditList}
        furnitureEditSelections={furnitureEditSelections}
        furnitureEditSaving={furnitureEditSaving}
        onClose={() => setDetailRoom(null)}
        onOpenFurnitureEdit={openFurnitureEdit}
        onToggleFurniture={toggleFurniture}
        onQuantityChange={changeFurnitureQuantity}
        onCancelFurnitureEdit={() => setFurnitureEditMode(false)}
        onSaveFurniture={handleFurnitureSave}
      />

      <ConfirmDialog
        open={!!deleteRoomId}
        title="Xóa Phòng"
        message="Bạn có chắc muốn xóa phòng này? Hành động này không thể hoàn tác."
        confirmText="Xóa Phòng"
        onClose={() => setDeleteRoomId(null)}
        onConfirm={() => handleDelete(deleteRoomId)}
      />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
