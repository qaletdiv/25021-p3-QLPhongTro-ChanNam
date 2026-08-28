"use client";

import { Box, Typography, TextField, CircularProgress, Grid, Checkbox, Autocomplete } from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ModalShell from "../ui/ModalShell";
import DateField from "../ui/DateField";
import MoneyField from "../ui/MoneyField";
import { formatCurrency } from "../../utils/format";
import { inputSx } from "../../utils/styles";

export default function ContractModal({
  open, editContractId, tenants, emptyRooms, buildingFilter,
  contractForm, setContractForm, companionFingerprints, setCompanionFingerprints,
  furnitureList, selectedFurnitures, setSelectedFurnitures,
  paymentDayManuallyChanged, contractLoading, onClose, onSave,
}) {
  if (!open) return null;

  // Only tenants without an active room AND (if a building context is known)
  // belonging to that nhà trọ are available as contract candidates.
  const selectedRoom = emptyRooms.find((r) => r.id === contractForm.roomId);
  const selectedBuildingId = selectedRoom?.buildingId
    ?? (buildingFilter && buildingFilter !== "all" ? Number(buildingFilter) : null);
  const availableTenants = tenants.filter((t) => {
    const hasActive = (t.contracts || []).some((c) => c.status === "active");
    if (hasActive) return false;
    if (selectedBuildingId && t.buildingId && t.buildingId !== selectedBuildingId) return false;
    return true;
  });

  const selectedTenant = availableTenants.find((t) => t.id === contractForm.tenantId)
    || tenants.find((t) => t.id === contractForm.tenantId);

  return (
    <ModalShell open={open} onClose={onClose} maxWidth={640}
      header={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <HowToRegIcon sx={{ color: "#fff", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>
            {editContractId ? "Sửa Hợp Đồng" : "Lập Hợp Đồng Cho Thuê Mới"}
          </Typography>
        </Box>
      }
      body={
        <Box sx={{ p: 3, overflow: "auto", display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Room Selection */}
          <Box>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Chọn Phòng Trống *</Typography>
            {emptyRooms.length === 0 ? (
              <Box sx={{ p: 2, bgcolor: "#fffbeb", color: "#92400e", borderRadius: "12px", border: "1px solid #fde68a", fontSize: "0.75rem", fontWeight: 700 }}>
                Không có phòng trống nào khả dụng! Vui lòng tạo thêm phòng mới trong mục quản lý phòng.
              </Box>
            ) : (
              <Autocomplete
                fullWidth size="small" disableClearable
                options={emptyRooms}
                getOptionLabel={(r) => `Phòng ${r.room_number} - Tầng ${r.floor || "?"} (${r.area || "?"}m²) - Giá: ${formatCurrency(r.price)}/tháng`}
                value={emptyRooms.find((r) => r.id === contractForm.roomId) || null}
                onChange={(e, room) => {
                  setContractForm({ ...contractForm, roomId: room ? room.id : "", deposit: room ? String(room.price) : contractForm.deposit, price: room ? String(room.price) : contractForm.price, paymentDay: paymentDayManuallyChanged.current ? contractForm.paymentDay : (room ? contractForm.paymentDay : 5) });
                }}
                renderInput={(params) => <TextField {...params} placeholder="-- Chọn phòng --" sx={inputSx} />}
                sx={inputSx}
              />
            )}
          </Box>

          {/* Tenant Details */}
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Họ & Tên Khách *</Typography>
              <TextField
                fullWidth size="small" placeholder="Nguyễn Văn A"
                value={selectedTenant ? selectedTenant.name : ""} disabled
                sx={inputSx}
              />
              <Autocomplete
                fullWidth size="small" disableClearable
                options={availableTenants}
                getOptionLabel={(t) => `${t.name} - ${t.phone}${t.building?.name ? ` (${t.building.name})` : ""}`}
                value={availableTenants.find((t) => t.id === contractForm.tenantId) || null}
                onChange={(e, t) => {
                  setContractForm({
                    ...contractForm,
                    tenantId: t ? t.id : "",
                    tenantName: t ? t.name : "",
                    tenantPhone: t ? t.phone : "",
                    tenantEmail: t ? (t.user?.email || "") : "",
                  });
                  setCompanionFingerprints(t?.companions?.map(c => ({ id: c.id, name: c.name, fingerprintCode: "" })) || []);
                }}
                disabled={!!editContractId}
                renderInput={(params) => <TextField {...params} placeholder="-- Chọn khách --" />}
              />
            </Grid>
            <Grid size={6}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số Điện Thoại *</Typography>
              <TextField
                fullWidth size="small" placeholder="0912345678"
                value={selectedTenant ? selectedTenant.phone : ""} disabled
                sx={inputSx}
              />
            </Grid>
            <Grid size={6}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Email (Tùy chọn)</Typography>
              <TextField
                fullWidth size="small" placeholder="email@gmail.com"
                value={selectedTenant?.user?.email || ""} disabled
                sx={inputSx}
              />
            </Grid>
          </Grid>

          {/* Financial & Fingerprint */}
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Giá Thuê (VND/Tháng)</Typography>
              <MoneyField
                fullWidth size="small"
                value={contractForm.price || ""}
                onChange={(v) => setContractForm({ ...contractForm, price: v })}
                sx={inputSx}
              />
            </Grid>
            <Grid size={6}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tiền Cọc (VND)</Typography>
              <MoneyField
                fullWidth size="small"
                value={contractForm.deposit}
                onChange={(v) => setContractForm({ ...contractForm, deposit: v })}
                sx={inputSx}
              />
            </Grid>
            <Grid size={6}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ngày Thu Tiền</Typography>
              <TextField
                fullWidth size="small" type="number" slotProps={{ htmlInput: { min: 1, max: 31 } }}
                value={contractForm.paymentDay}
                onChange={(e) => { paymentDayManuallyChanged.current = true; setContractForm({ ...contractForm, paymentDay: e.target.value }); }}
                sx={inputSx}
              />
            </Grid>
            <Grid size={6}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Mã Vân Tay Khóa Cửa</Typography>
              <TextField
                fullWidth size="small"
                value={contractForm.fingerprintCode}
                onChange={(e) => setContractForm({ ...contractForm, fingerprintCode: e.target.value })}
                placeholder="FP-101-88"
                sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"] } }}
              />
            </Grid>
          </Grid>

          {/* Contract Dates */}
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ngày Bắt Đầu Hợp Đồng</Typography>
              <DateField
                fullWidth size="small"
                value={contractForm.startDate}
                onChange={(v) => setContractForm({ ...contractForm, startDate: v })}
                sx={inputSx}
              />
            </Grid>
            <Grid size={6}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ngày Kết Thúc Hợp Đồng</Typography>
              <DateField
                fullWidth size="small"
                value={contractForm.endDate}
                onChange={(v) => setContractForm({ ...contractForm, endDate: v })}
                sx={inputSx}
              />
            </Grid>
          </Grid>

          {/* Companion Fingerprints */}
          {companionFingerprints.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>Mã Số Vân Tay Người Đi Kèm</Typography>
              {companionFingerprints.map((c, i) => (
                <TextField
                  key={c.id} fullWidth size="small"
                  label={c.name}
                  value={c.fingerprintCode}
                  onChange={(e) => {
                    const updated = [...companionFingerprints];
                    updated[i] = { ...updated[i], fingerprintCode: e.target.value };
                    setCompanionFingerprints(updated);
                  }}
                  sx={{ mb: 0.75, ...inputSx }}
                />
              ))}
            </Box>
          )}

          {/* Furniture Selection */}
          {furnitureList.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
                Danh Sách Vật Dụng Bàn Giao Trong Phòng:
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, p: 1.5, border: "1px solid #e2e8f0", borderRadius: "16px", bgcolor: "rgba(248,250,252,0.8)" }}>
                {furnitureList.map((f) => {
                  const checked = selectedFurnitures[f.id]?.checked || false;
                  return (
                    <Box key={f.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.25, bgcolor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
                        onClick={() => setSelectedFurnitures({ ...selectedFurnitures, [f.id]: { ...selectedFurnitures[f.id], checked: !checked } })}
                      >
                        <Checkbox checked={checked} readOnly
                          sx={{ p: 0, color: "#94a3b8", "&.Mui-checked": { color: "#2563eb" }, cursor: "pointer" }}
                        />
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{f.name}</Typography>
                      </Box>
                      {checked && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 700 }}>SL:</Typography>
                          <TextField
                            size="small" type="number" slotProps={{ htmlInput: { min: 1 } }}
                            value={selectedFurnitures[f.id]?.quantity || 1}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setSelectedFurnitures({ ...selectedFurnitures, [f.id]: { ...selectedFurnitures[f.id], quantity: Number(e.target.value) } })}
                            sx={{ width: 60, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "8px", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
                          />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      }
      footer={
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Box onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>
            Hủy
          </Box>
          <Box onClick={onSave}
            sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", display: "flex", alignItems: "center", gap: 1 }}
          >
            {contractLoading && <CircularProgress size={14} sx={{ color: "#fff" }} />}
            {editContractId ? "Cập Nhật Hợp Đồng" : "Hoàn Tất Tạo Hợp Đồng"}
          </Box>
        </Box>
      }
    />
  );
}
