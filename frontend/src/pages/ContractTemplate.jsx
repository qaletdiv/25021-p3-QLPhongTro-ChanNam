import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Paper, Snackbar, Alert, CircularProgress, Chip,
} from "@mui/material";
import contractTemplateApi from "../api/contractTemplateApi";

const variables = [
  "{{ten_nguoi_thue}}", "{{cccd}}", "{{so_dien_thoai}}", "{{ma_phong}}",
  "{{gia_thue}}", "{{tien_coc}}", "{{ngay_bat_dau}}", "{{ngay_ket_thuc}}",
  "{{ngay_thu_tien}}", "{{ma_van_tay}}", "{{nguoi_di_kem}}", "{{vat_dung}}",
  "{{ngay_hom_nay}}", "{{ten_chu_tro}}", "{{sdt_chu_tro}}",
];

export default function ContractTemplate() {
  const [template, setTemplate] = useState("");
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    contractTemplateApi.getTemplate()
      .then((res) => setTemplate(res.data.template))
      .catch(() => setSnack({ open: true, message: "Lỗi tải mẫu hợp đồng", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await contractTemplateApi.saveTemplate({ template });
      setSnack({ open: true, message: "Đã lưu hợp đồng thành công", severity: "success" });
    } catch {
      setSnack({ open: true, message: "Lỗi lưu mẫu", severity: "error" });
    }
  };

  const insertVariable = (v) => {
    setTemplate((prev) => prev + v);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box mb={3}>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Mẫu hợp đồng</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>Quản lý nội dung mẫu hợp đồng thuê phòng</Typography>
      </Box>

      <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 2, mb: 3, borderBottom: "1px solid #e2e8f0" }}>
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>
            Biến mẫu hợp đồng
          </Typography>
        </Box>
        <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
          {variables.map((v) => (
            <Chip
              key={v}
              label={v}
              size="small"
              clickable
              onClick={() => insertVariable(v)}
              variant="outlined"
              sx={{ borderRadius: "12px", borderColor: "#e2e8f0", "&:hover": { borderColor: "#2563eb", color: "#2563eb" } }}
            />
          ))}
        </Box>
        <TextField
          fullWidth multiline rows={20} value={template}
          onChange={(e) => setTemplate(e.target.value)}
          sx={{
            fontFamily: "monospace",
            "& textarea": { fontFamily: "monospace" },
            "& .MuiOutlinedInput-root": { borderRadius: "12px" },
          }}
        />
        <Box mt={3} textAlign="right">
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ borderRadius: "12px", bgcolor: "#2563eb", textTransform: "none", fontWeight: 600 }}
          >
            Lưu mẫu hợp đồng
          </Button>
        </Box>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
