"use client";

import { Box, Typography, Paper, Chip, TextField, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import ModalShell from "../ui/ModalShell";

export default function RoomDetailModal({
  detailRoom, furnitureEditMode, furnitureEditList, furnitureEditSelections, furnitureEditSaving,
  onClose, onOpenFurnitureEdit, onToggleFurniture, onQuantityChange, onCancelFurnitureEdit, onSaveFurniture,
}) {
  if (!detailRoom) return null;

  const contract = detailRoom.contracts?.[0];

  return (
    <ModalShell open={!!detailRoom} onClose={onClose} headerBg="#0f172a" maxWidth={520}
      header={
        <Box>
          <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.9375rem" }}>Chi Tiết Phòng {detailRoom.room_number}</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.25 }}>
            {detailRoom.building ? `${detailRoom.building.name}${detailRoom.building.address ? " - " + detailRoom.building.address : ""}` : "Chưa thuộc nhà nào"}
          </Typography>
        </Box>
      }
      body={
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Status & Fingerprint Header */}
          <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8" }}>Trạng thái:</Typography>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: detailRoom.status === "rented" ? "#059669" : "#d97706" }}>
                {detailRoom.status === "rented" ? "Đã Cho Thuê" : "Đang Trống"}
              </Typography>
            </Box>
            {contract?.fingerprintCode && (
              <Box sx={{ fontSize: "0.75rem", color: "#0f172a" }}>
                Mã Vân Tay: <Box component="span" sx={{ fontFamily: "monospace", fontWeight: 700, bgcolor: "#0f172a", color: "#fcd34d", px: 1, py: 0.25, borderRadius: "6px", ml: 0.5 }}>{contract.fingerprintCode}</Box>
              </Box>
            )}
          </Paper>

          {/* Inventory Items */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Danh Sách Vật Dụng Trong Phòng
              </Typography>
              {contract && !furnitureEditMode && (
                <Box onClick={onOpenFurnitureEdit} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "0.6875rem", fontWeight: 700, color: "#2563eb", cursor: "pointer", "&:hover": { color: "#1d4ed8" } }}>
                  <EditIcon sx={{ fontSize: 14 }} /> Chỉnh sửa
                </Box>
              )}
            </Box>
            <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {furnitureEditMode ? (
                <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
                  {furnitureEditList.map((f) => {
                    const sel = furnitureEditSelections[f.id] || { checked: false, quantity: 1 };
                    return (
                      <Box key={f.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1, bgcolor: "#f8fafc", borderRadius: "12px" }}>
                        <Box
                          onClick={() => onToggleFurniture(f.id, sel)}
                          sx={{ width: 16, height: 16, borderRadius: "4px", border: sel.checked ? "none" : "1px solid #cbd5e1", bgcolor: sel.checked ? "#2563eb" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        >
                          {sel.checked && <CheckIcon sx={{ fontSize: 12, color: "#fff" }} />}
                        </Box>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#0f172a", flex: 1 }}>{f.name}</Typography>
                        {sel.checked && (
                          <TextField size="small" type="number" value={sel.quantity} slotProps={{ htmlInput: { min: 1 } }}
                            onChange={(e) => onQuantityChange(f.id, Number(e.target.value), sel)}
                            sx={{ width: 80, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "8px", bgcolor: "#fff" } }} />
                        )}
                      </Box>
                    );
                  })}
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                    <Box onClick={onCancelFurnitureEdit} sx={{ px: 2, py: 1, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "8px", cursor: "pointer", bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}>Hủy</Box>
                    <Box onClick={onSaveFurniture} sx={{ px: 2, py: 1, fontSize: "0.75rem", fontWeight: 700, color: "#fff", borderRadius: "8px", cursor: "pointer", bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" }, display: "flex", alignItems: "center", gap: 1 }}>
                      {furnitureEditSaving && <CircularProgress size={12} sx={{ color: "#fff" }} />}
                      Lưu
                    </Box>
                  </Box>
                </Box>
              ) : (
                contract?.contractFurnitures?.length > 0 ? (
                  <Box>
                    {contract.contractFurnitures.map((cf, idx) => (
                      <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.75, borderBottom: idx < contract.contractFurnitures.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8125rem" }}>{cf.furniture?.name || `Vật dụng #${cf.furnitureId}`}</Typography>
                        <Chip label={`SL: ${cf.quantity}`} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, borderRadius: "8px", fontSize: "0.6875rem", border: "1px solid #fde68a" }} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: "center", color: "#64748b", fontSize: "0.75rem" }}>
                    Phòng hiện chưa có hợp đồng bàn giao vật dụng riêng.
                  </Box>
                )
              )}
            </Paper>
          </Box>
        </Box>
      }
      footer={
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
          <Box onClick={onClose} sx={{ px: 4, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#0f172a", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1e293b" }, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
            Đóng Chi Tiết
          </Box>
        </Box>
      }
    />
  );
}
