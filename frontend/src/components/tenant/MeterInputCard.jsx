"use client";

import { Box, Card, CardContent, Typography, Grid, TextField, Button } from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";

const cardSx = {
  bgcolor: "#fff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};

export default function MeterInputCard({ electricityNew, setElectricityNew, waterNew, setWaterNew, lastInv, onCalculate }) {
  return (
    <Card sx={cardSx}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1, mb: 2, borderBottom: "1px solid #e2e8f0" }}>
          <CalculateIcon sx={{ color: "#059669", fontSize: 20 }} />
          <Typography variant="h6" fontWeight="bold" color="#0f172a">Nhập chỉ số</Typography>
        </Box>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid size={5}>
            <TextField fullWidth label="Chỉ số điện mới" type="number" value={electricityNew}
              onChange={(e) => setElectricityNew(e.target.value)}
              helperText={lastInv ? `Chỉ số cũ: ${lastInv.electricityNew}` : "Chỉ số cũ: 0"}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
          </Grid>
          <Grid size={5}>
            <TextField fullWidth label="Chỉ số nước mới" type="number" value={waterNew}
              onChange={(e) => setWaterNew(e.target.value)}
              helperText={lastInv ? `Chỉ số cũ: ${lastInv.waterNew}` : "Chỉ số cũ: 0"}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
          </Grid>
          <Grid size={2}>
            <Button variant="contained" fullWidth onClick={onCalculate}
              sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#065f46" }, borderRadius: "12px", textTransform: "none" }}>
              Tính ngay
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
