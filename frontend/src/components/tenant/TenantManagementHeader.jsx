import { Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function TenantManagementHeader({ onCreateContract }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography variant="h5" fontWeight="bold">
          Quản Lý Khách & Hợp Đồng Cho Thuê
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Lập hợp đồng cho thuê, gán mã vân tay, chọn danh mục vật dụng và thanh lý hợp đồng.
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        <Box
          onClick={onCreateContract}
          sx={{
            display: "inline-flex", alignItems: "center", gap: 1,
            px: 2, py: 1.25, bgcolor: "#2563eb", color: "#fff",
            borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700,
            cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" },
            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          }}
        >
          <AddIcon sx={{ fontSize: 16 }} />
          <span>Lập Hợp Đồng Mới</span>
        </Box>
      </Box>
    </Box>
  );
}
