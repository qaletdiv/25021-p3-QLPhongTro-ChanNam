"use client";

import { Box, Paper, Chip, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EyeIcon from "@mui/icons-material/Visibility";
import ApartmentIcon from "@mui/icons-material/Apartment";
import { formatCurrency } from "../../utils/format";

export default function RoomCard({ room, onOpenDetail, onOpenEdit, onDelete }) {
  const contract = room.contracts?.[0];
  const tenant = contract?.tenant;

  return (
    <Paper
      sx={{
        borderRadius: "16px", p: 2.5, position: "relative", overflow: "hidden",
        border: room.status === "empty" ? "1px solid #fde68a" : "1px solid #e2e8f0",
        bgcolor: room.status === "empty" ? "rgba(255,251,235,0.5)" : "#fff",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
        transition: "all 0.2s",
      }}
    >
      {/* Status Pill & Floor */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Chip
          size="small"
          label={room.status === "rented" ? "\u25CF Đã Cho Thuê" : "\u25CB Còn Trống"}
          sx={{
            fontWeight: 700, fontSize: "0.6875rem", borderRadius: "9999px",
            bgcolor: room.status === "rented" ? "#d1fae5" : "#fef3c7",
            color: room.status === "rented" ? "#065f46" : "#92400e",
            border: room.status === "rented" ? "1px solid #a7f3d0" : "1px solid #fde68a",
          }}
        />
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, bgcolor: "#f1f5f9", px: 1, py: 0.25, borderRadius: "8px" }}>
          Tầng {room.floor}
        </Typography>
      </Box>

      {/* Building name */}
      {room.building && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <ApartmentIcon sx={{ fontSize: 14, color: "#64748b" }} />
          <Typography sx={{ fontSize: "0.6875rem", color: "#475569", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {room.building.name}
          </Typography>
        </Box>
      )}

      {/* Room Number & Price */}
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.025em" }}>
          Phòng {room.room_number}
        </Typography>
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 800, color: "#2563eb" }}>
          {formatCurrency(room.price)}
          <Typography component="span" sx={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 400 }}>/tháng</Typography>
        </Typography>
      </Box>

      {/* Meta details */}
      <Paper sx={{ p: 1.75, bgcolor: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9", mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Diện tích:</Typography>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{room.area} m²</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Ngày thu tiền:</Typography>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>Ngày {contract?.paymentDay || room.default_payment_day} hàng tháng</Typography>
        </Box>
        {room.status === "rented" && tenant && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", pt: 0.75, mt: 0.75 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Khách thuê:</Typography>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#059669" }}>{tenant.name}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>Số điện thoại:</Typography>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#0f172a" }}>{tenant.phone}</Typography>
            </Box>
            {contract?.fingerprintCode && (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 0.5, mt: 0.5 }}>
                <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>Mã số vân tay:</Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.6875rem", fontWeight: 700, bgcolor: "#e2e8f0", px: 0.75, py: 0.25, borderRadius: "6px" }}>
                  {contract.fingerprintCode}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Card Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", pt: 1.5 }}>
        <Box onClick={() => onOpenDetail(room)} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", cursor: "pointer", "&:hover": { color: "#1d4ed8" } }}>
          <EyeIcon sx={{ fontSize: 16 }} />
          <span>Xem vật dụng & chi tiết</span>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton size="small" onClick={() => onOpenEdit(room)} sx={{ color: "#64748b", "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" } }}>
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(room.id)} disabled={room.status !== "empty"}
            sx={{ color: "#64748b", "&:hover": { color: "#e11d48", bgcolor: "#ffe4e6" }, "&.Mui-disabled": { opacity: 0.3 } }}
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
