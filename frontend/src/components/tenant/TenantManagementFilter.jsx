import { Box, Paper, Typography, TextField, Select, MenuItem, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DateField from "../ui/DateField";

export default function TenantManagementFilter({ statusFilter, search, dateFrom, dateTo, ttFrom, ttTo, buildings, buildingFilter, onChange }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
        {/* Row 1: Status */}
        <Box>
          <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Theo Trạng Thái</Typography>
          <Select
            fullWidth size="small" value={statusFilter}
            onChange={(e) => onChange("statusFilter", e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem" }, "& .MuiSelect-select": { fontSize: "0.75rem", py: 1.1 } }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="renting">Đang Thuê</MenuItem>
            <MenuItem value="ended">Hết Thuê</MenuItem>
          </Select>
        </Box>

        {/* Row 1: Search */}
        <Box>
          <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Tìm Kiếm</Typography>
          <TextField
            fullWidth size="small" placeholder="Tìm theo tên, SĐT hoặc phòng..." value={search}
            onChange={(e) => onChange("search", e.target.value)}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "#94a3b8", fontSize: 16 }} /></InputAdornment>) } }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "0.75rem", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
          />
        </Box>

        {/* Row 1: Building */}
        <Box>
          <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Theo Tòa Nhà</Typography>
          <Select
            fullWidth size="small" value={buildingFilter}
            onChange={(e) => onChange("buildingFilter", e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem" }, "& .MuiSelect-select": { fontSize: "0.75rem", py: 1.1 } }}
          >
            <MenuItem value="all">Tất cả tòa nhà</MenuItem>
            {(buildings || []).map((b) => (
              <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        {/* Row 2: Contract + Actual rental time */}
        <Box>
          <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Hợp Đồng</Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <DateField
              size="small" value={dateFrom} onChange={(v) => onChange("dateFrom", v)}
              label="Từ ngày"
              sx={{ width: 165, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "12px", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
            />
            <DateField
              size="small" value={dateTo} onChange={(v) => onChange("dateTo", v)}
              label="Đến ngày"
              sx={{ width: 165, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "12px", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
            />
            {(dateFrom || dateTo) && (
              <Box onClick={() => onChange("clearDates")}
                sx={{ px: 1.5, py: 1, fontSize: "0.6875rem", fontWeight: 700, color: "#e11d48", borderRadius: "8px", cursor: "pointer", "&:hover": { bgcolor: "#ffe4e6" } }}
              >Xóa lọc</Box>
            )}
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Thời Gian Thuê Thực Tế</Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <DateField
              size="small" value={ttFrom} onChange={(v) => onChange("ttFrom", v)}
              label="Từ ngày"
              sx={{ width: 165, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "12px", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
            />
            <DateField
              size="small" value={ttTo} onChange={(v) => onChange("ttTo", v)}
              label="Đến ngày"
              sx={{ width: 165, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "12px", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
            />
            {(ttFrom || ttTo) && (
              <Box onClick={() => onChange("clearTtDates")}
                sx={{ px: 1.5, py: 1, fontSize: "0.6875rem", fontWeight: 700, color: "#e11d48", borderRadius: "8px", cursor: "pointer", "&:hover": { bgcolor: "#ffe4e6" } }}
              >Xóa lọc</Box>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
