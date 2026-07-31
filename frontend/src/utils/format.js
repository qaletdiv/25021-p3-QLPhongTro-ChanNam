export const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

export const formatDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "-";

export const currentMonthLabel = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export const statusLabel = { pending: "Chờ Nhập Chỉ Số", submitted: "Đã Gửi Chỉ Số", paid: "Đã Thanh Toán" };
