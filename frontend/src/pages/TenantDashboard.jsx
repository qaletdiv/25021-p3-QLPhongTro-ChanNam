import { useState, useEffect } from "react";
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Snackbar } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NotificationsIcon from "@mui/icons-material/Notifications";
import tenantDashboardApi from "../api/tenantDashboardApi";

const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
const cardSx = {
  bgcolor: "#fff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};

export default function TenantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    tenantDashboardApi.getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  const contract = data?.contract;
  const room = contract?.room;
  const notifications = data?.notifications || [];

  const daysLeft = contract ? Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" color="#0f172a">Trang chủ</Typography>
        <Typography variant="body2" color="#64748b" mt={0.5}>Tổng quan thông tin phòng và thông báo</Typography>
      </Box>

      {!contract ? (
        <Alert severity="info" sx={{ mb: 3, borderRadius: "12px" }}>Bạn hiện chưa có hợp đồng thuê phòng nào.</Alert>
      ) : (
        <>
          <Card sx={cardSx}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <HomeIcon sx={{ fontSize: 48, color: "#059669" }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="#0f172a">Phòng {room?.room_number}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="#64748b">Giá thuê: <strong style={{ color: "#0f172a" }}>{formatCurrency(room?.price)}/tháng</strong></Typography>
                  <Typography variant="body2" color="#64748b">Ngày thu tiền: <strong style={{ color: "#0f172a" }}>Ngày {contract.paymentDay} hàng tháng</strong></Typography>
                  <Typography variant="body2" color="#64748b">Tiền cọc: <strong style={{ color: "#0f172a" }}>{formatCurrency(contract.deposit)}</strong></Typography>
                </Grid>
                <Grid item xs={12} sm={6} textAlign="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                    <CalendarTodayIcon sx={{ color: "#d97706" }} />
                    <Typography variant="body2" color="#64748b">
                      {new Date(contract.startDate).toLocaleDateString("vi-VN")} - {new Date(contract.endDate).toLocaleDateString("vi-VN")}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Còn ${daysLeft} ngày hết hạn hợp đồng`}
                    sx={{
                      mt: 2, fontWeight: "bold", borderRadius: "12px",
                      bgcolor: daysLeft < 30 ? "#ffe4e6" : "#fef3c7",
                      color: daysLeft < 30 ? "#e11d48" : "#d97706",
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box display="flex" alignItems="center" gap={1} pb={1} mb={2} sx={{ borderBottom: "1px solid #e2e8f0" }}>
            <NotificationsIcon sx={{ color: "#059669", fontSize: 20 }} />
            <Typography variant="h6" fontWeight="bold" color="#0f172a">Thông báo</Typography>
          </Box>
          {notifications.length === 0 ? (
            <Typography color="#64748b">Chưa có thông báo nào.</Typography>
          ) : (
            notifications.map((n) => (
              <Card key={n.id} sx={{ ...cardSx, mb: 1.5 }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">{n.title}</Typography>
                  <Typography variant="body2" color="#64748b" whiteSpace="pre-wrap">{n.content}</Typography>
                  <Typography variant="caption" color="#64748b" sx={{ opacity: 0.7 }}>
                    {new Date(n.sentAt).toLocaleString("vi-VN")}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: "12px" }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
