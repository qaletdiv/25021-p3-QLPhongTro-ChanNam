"use client";

import { Box, Card, Typography, Chip, Paper } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export default function ExpiringContracts({ expiring, onManage }) {
  return (
    <Card sx={{ borderRadius: "16px", p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ p: 1, bgcolor: "#fef3c7", color: "#d97706", borderRadius: "12px", display: "flex" }}>
            <CalendarMonthIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Hợp Đồng Sắp Hết Hạn
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
              Trong vòng 60 ngày tới
            </Typography>
          </Box>
        </Box>
        <Chip label={`${expiring.length} HĐ`} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700, borderRadius: "8px", fontSize: "0.6875rem", border: "1px solid #fde68a" }} />
      </Box>

      {expiring.length === 0 ? (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #e2e8f0", borderRadius: "16px", p: 4 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            Không có hợp đồng nào sắp hết hạn trong 60 ngày tới.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1, minHeight: 0, overflowY: "auto" }}>
          {expiring.slice(0, 6).map((c) => {
            const end = new Date(c.endDate);
            const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
            return (
              <Paper
                key={c.id}
                sx={{
                  p: 1.5, bgcolor: "rgba(255,251,235,0.7)", borderRadius: "12px",
                  border: "1px solid rgba(253,230,138,0.8)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                    Phòng {c.room?.room_number} - {c.tenant?.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                    SĐT: {c.tenant?.phone} • Hạn: {new Date(c.endDate).toLocaleDateString("vi-VN")}
                  </Typography>
                </Box>
                <Chip
                  label={`Còn ${daysLeft} ngày`}
                  size="small"
                  sx={{ bgcolor: "#d97706", color: "#fff", fontWeight: 700, borderRadius: "8px", fontSize: "0.6875rem" }}
                />
              </Paper>
            );
          })}
        </Box>
      )}

      <Box
        onClick={() => onManage("/landlord/tenants")}
        sx={{
          mt: 2.5, py: 1.5, bgcolor: "#f1f5f9", borderRadius: "12px", textAlign: "center",
          fontSize: "0.75rem", fontWeight: 700, color: "#475569", cursor: "pointer",
          "&:hover": { bgcolor: "#e2e8f0" },
        }}
      >
        Quản lý hợp đồng & gia hạn →
      </Box>
    </Card>
  );
}
