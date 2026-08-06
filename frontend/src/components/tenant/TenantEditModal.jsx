"use client";

import { Box, Typography, TextField, CircularProgress, Grid, Autocomplete, Chip } from "@mui/material";
import ModalShell from "../ui/ModalShell";
import DateField from "../ui/DateField";
import MoneyField from "../ui/MoneyField";
import { formatCurrency } from "../../utils/format";
import { inputSx } from "../../utils/styles";

export default function TenantEditModal({
  editTenantId, editContractId, tenantForm, setTenantForm,
  emptyRooms, contractForm, setContractForm,
  companionFingerprints, setCompanionFingerprints,
  furnitureList, selectedFurnitures, setSelectedFurnitures,
  paymentDayManuallyChanged, contractLoading, openContract, onClose, onSave,
}) {
  if (!editTenantId || openContract) return null;

  const updateCompanion = (i, field, value) => {
    const updated = [...companionFingerprints];
    updated[i] = { ...updated[i], [field]: value };
    setCompanionFingerprints(updated);
  };

  return (
    <ModalShell open maxWidth={editContractId ? 640 : 420}
      header={
        <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>
          Sửa Thông Tin
        </Typography>
      }
      body={
        <Box sx={{ p: 3, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField fullWidth size="small" label="Họ tên" value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} required
            sx={inputSx} />
          <TextField fullWidth size="small" label="Số điện thoại" value={tenantForm.phone} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} required
            sx={inputSx} />
          <TextField fullWidth size="small" label="CCCD" value={tenantForm.cccd} onChange={(e) => setTenantForm({ ...tenantForm, cccd: e.target.value })}
            sx={inputSx} />

          <>
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8125rem", mt: 1 }}>Thông tin hợp đồng</Typography>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Phòng</Typography>
              {emptyRooms.length === 0 ? (
                <Box sx={{ p: 2, bgcolor: "#fffbeb", color: "#92400e", borderRadius: "12px", border: "1px solid #fde68a", fontSize: "0.75rem", fontWeight: 700 }}>
                  Không có phòng trống nào khả dụng.
                </Box>
              ) : (
                <Autocomplete
                  fullWidth size="small" disableClearable
                  options={emptyRooms}
                  getOptionLabel={(r) => `Phòng ${r.room_number} - Tầng ${r.floor || "?"} (${r.area || "?"}m²) - Giá: ${formatCurrency(r.price)}/tháng`}
                  value={emptyRooms.find((r) => r.id === contractForm.roomId) || null}
                  onChange={(e, room) => {
                    setContractForm({ ...contractForm, roomId: room ? room.id : "", deposit: room ? String(room.price) : contractForm.deposit, price: room ? String(room.price) : contractForm.price });
                  }}
                  renderInput={(params) => <TextField {...params} placeholder="-- Chọn phòng --" />}
                />
              )}
            </Box>
            <Grid container spacing={1.5}>
              <Grid size={6}>
                <MoneyField fullWidth size="small" label="Giá thuê (VND/tháng)" value={contractForm.price || ""} onChange={(v) => setContractForm({ ...contractForm, price: v })} required
                  sx={inputSx} />
              </Grid>
              <Grid size={6}>
                <MoneyField fullWidth size="small" label="Tiền cọc (VND)" value={contractForm.deposit} onChange={(v) => setContractForm({ ...contractForm, deposit: v })} required
                  sx={inputSx} />
              </Grid>
              <Grid size={6}>
              <DateField fullWidth size="small" label="Ngày bắt đầu" value={contractForm.startDate} onChange={(v) => setContractForm({ ...contractForm, startDate: v })} required
                sx={inputSx} />
              </Grid>
              <Grid size={6}>
                <DateField fullWidth size="small" label="Ngày kết thúc" value={contractForm.endDate} onChange={(v) => setContractForm({ ...contractForm, endDate: v })} required
                sx={inputSx} />
              </Grid>
              <Grid size={6}>
                <TextField fullWidth size="small" label="Ngày thu tiền" type="number" value={contractForm.paymentDay} onChange={(e) => { paymentDayManuallyChanged.current = true; setContractForm({ ...contractForm, paymentDay: e.target.value }); }} slotProps={{ htmlInput: { min: 1, max: 31 } }} required
                  sx={inputSx} />
              </Grid>
              <Grid size={6}>
                <TextField fullWidth size="small" label="Vân tay (khách chính)" value={contractForm.fingerprintCode} onChange={(e) => setContractForm({ ...contractForm, fingerprintCode: e.target.value })}
                  sx={inputSx} />
              </Grid>
            </Grid>

            {companionFingerprints.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
                  Người đi kèm ({companionFingerprints.length})
                </Typography>
                {companionFingerprints.map((c, i) => (
                  <Box key={c.id} sx={{ mb: 1.5, p: 1.5, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 1 }}>
                    <TextField fullWidth size="small" label="Họ tên" value={c.name || ""} required
                      onChange={(e) => updateCompanion(i, "name", e.target.value)} sx={inputSx} />
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                      <TextField fullWidth size="small" label="Số điện thoại" value={c.phone || ""}
                        onChange={(e) => updateCompanion(i, "phone", e.target.value)} sx={inputSx} />
                      <TextField fullWidth size="small" label="CCCD" value={c.cccd || ""}
                        onChange={(e) => updateCompanion(i, "cccd", e.target.value)} sx={inputSx} />
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                      <TextField fullWidth size="small" label="Quan hệ" value={c.relationship || ""}
                        onChange={(e) => updateCompanion(i, "relationship", e.target.value)} sx={inputSx} />
                      <TextField fullWidth size="small" label="Vân tay" value={c.fingerprintCode || ""}
                        onChange={(e) => updateCompanion(i, "fingerprintCode", e.target.value)} sx={inputSx} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {furnitureList.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>Vật dụng trong phòng</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {furnitureList.filter(f => selectedFurnitures[f.id]?.checked).map((f) => (
                    <Chip key={f.id} label={`${f.name} (x${selectedFurnitures[f.id].quantity})`}
                      size="small" sx={{ bgcolor: "#f1f5f9", color: "#0f172a", fontWeight: 600, borderRadius: "8px", fontSize: "0.75rem" }} />
                  ))}
                  {!furnitureList.some(f => selectedFurnitures[f.id]?.checked) && (
                    <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>Chưa bàn giao vật dụng</Typography>
                  )}
                </Box>
              </Box>
            )}
          </>
        </Box>
      }
      footer={
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Box onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
          <Box onClick={onSave}
            sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, display: "flex", alignItems: "center", gap: 1 }}
          >
            {contractLoading && <CircularProgress size={14} sx={{ color: "#fff" }} />}
            Lưu
          </Box>
        </Box>
      }
    />
  );
}
