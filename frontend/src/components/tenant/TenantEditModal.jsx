"use client";

import { Box, Typography, TextField, IconButton, CircularProgress, Grid, Checkbox, Autocomplete, Chip } from "@mui/material";
import { formatCurrency } from "../../utils/format";

const inputSx = {
  "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } },
};

export default function TenantEditModal({
  editTenantId, editContractId, tenants, tenantForm, setTenantForm,
  emptyRooms, contractForm, setContractForm,
  companionFingerprints, setCompanionFingerprints,
  furnitureList, selectedFurnitures, setSelectedFurnitures,
  paymentDayManuallyChanged, contractLoading, openContract, onClose, onSave,
}) {
  if (!editTenantId || openContract) return null;

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
      <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: editContractId ? 640 : 420, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box sx={{ bgcolor: "#2563eb", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
            {editTenantId ? "Sửa Thông Tin" : "Thêm Khách Thuê Mới"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </IconButton>
        </Box>
        <Box sx={{ p: 3, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {!editTenantId && (
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Chọn từ danh sách</Typography>
              <Autocomplete
                fullWidth size="small" disableClearable
                options={tenants}
                getOptionLabel={(t) => `${t.name} - ${t.phone}`}
                onChange={(e, t) => {
                  if (t) setTenantForm({ name: t.name, phone: t.phone, cccd: t.cccd || "" });
                }}
                renderInput={(params) => <TextField {...params} placeholder="-- Nhập thủ công --" />}
              />
            </Box>
          )}
          <TextField fullWidth size="small" label="Họ tên" value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} required
            sx={inputSx} />
          <TextField fullWidth size="small" label="Số điện thoại" value={tenantForm.phone} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} required
            sx={inputSx} />
          <TextField fullWidth size="small" label="CCCD" value={tenantForm.cccd} onChange={(e) => setTenantForm({ ...tenantForm, cccd: e.target.value })}
            sx={inputSx} />

          <>
            <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.8125rem", mt: 1 }}>Thông tin hợp đồng</Typography>
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
                    setContractForm({ ...contractForm, roomId: room ? room.id : "", deposit: room ? String(room.price) : contractForm.deposit });
                  }}
                  renderInput={(params) => <TextField {...params} placeholder="-- Chọn phòng --" />}
                />
              )}
            </Box>
            <Grid container spacing={1.5}>
              <Grid size={4}>
                <TextField fullWidth size="small" label="Tiền cọc (VND)" type="number" value={contractForm.deposit} onChange={(e) => setContractForm({ ...contractForm, deposit: e.target.value })} required
                  sx={inputSx} />
              </Grid>
              <Grid size={4}>
                <TextField fullWidth size="small" label="Ngày bắt đầu" type="date" value={contractForm.startDate} onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} required
                  sx={inputSx} />
              </Grid>
              <Grid size={4}>
                <TextField fullWidth size="small" label="Ngày kết thúc" type="date" value={contractForm.endDate} onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} required
                  sx={inputSx} />
              </Grid>
              <Grid size={4}>
                <TextField fullWidth size="small" label="Ngày thu tiền" type="number" value={contractForm.paymentDay} onChange={(e) => { paymentDayManuallyChanged.current = true; setContractForm({ ...contractForm, paymentDay: e.target.value }); }} slotProps={{ htmlInput: { min: 1, max: 31 } }} required
                  sx={inputSx} />
              </Grid>
              <Grid size={4}>
                <TextField fullWidth size="small" label="Vân tay (khách chính)" value={contractForm.fingerprintCode} onChange={(e) => setContractForm({ ...contractForm, fingerprintCode: e.target.value })}
                  sx={inputSx} />
              </Grid>
            </Grid>

            {companionFingerprints.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mb: 1 }}>Mã số vân tay người đi kèm</Typography>
                {companionFingerprints.map((c, i) => (
                  <TextField key={c.id} fullWidth size="small" label={`Vân tay: ${c.name}`} value={c.fingerprintCode}
                    onChange={(e) => { const updated = [...companionFingerprints]; updated[i] = { ...updated[i], fingerprintCode: e.target.value }; setCompanionFingerprints(updated); }}
                    sx={{ mb: 0.75, ...inputSx }} />
                ))}
              </Box>
            )}

            {furnitureList.length > 0 && (
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mb: 1 }}>Vật dụng trong phòng</Typography>
                {editTenantId ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {furnitureList.filter(f => selectedFurnitures[f.id]?.checked).map((f) => (
                      <Chip key={f.id} label={`${f.name} (x${selectedFurnitures[f.id].quantity})`}
                        size="small" sx={{ bgcolor: "#f1f5f9", color: "#0f172a", fontWeight: 600, borderRadius: "8px", fontSize: "0.75rem" }} />
                    ))}
                    {!furnitureList.some(f => selectedFurnitures[f.id]?.checked) && (
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>Chưa bàn giao vật dụng</Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.75 }}>
                    {furnitureList.map((f) => {
                      const checked = selectedFurnitures[f.id]?.checked || false;
                      return (
                        <Box key={f.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1, bgcolor: "#f8fafc", borderRadius: "8px" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
                            onClick={() => setSelectedFurnitures({ ...selectedFurnitures, [f.id]: { ...selectedFurnitures[f.id], checked: !checked } })}
                          >
                            <Checkbox checked={checked} readOnly sx={{ p: 0, color: "#94a3b8", "&.Mui-checked": { color: "#2563eb" }, cursor: "pointer" }} />
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#0f172a" }}>{f.name}</Typography>
                          </Box>
                          {checked && (
                            <TextField size="small" type="number" value={selectedFurnitures[f.id]?.quantity || 1} slotProps={{ htmlInput: { min: 1 } }}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setSelectedFurnitures({ ...selectedFurnitures, [f.id]: { ...selectedFurnitures[f.id], quantity: Number(e.target.value) } })}
                              sx={{ width: 70, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "8px", bgcolor: "#fff" } }} />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}
          </>
        </Box>
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Box onClick={onClose} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
          <Box onClick={onSave}
            sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, display: "flex", alignItems: "center", gap: 1 }}
          >
            {contractLoading && <CircularProgress size={14} sx={{ color: "#fff" }} />}
            {editTenantId ? "Lưu" : "Thêm"}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
