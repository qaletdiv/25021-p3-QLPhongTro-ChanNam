export const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

export const formatDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "-";

export const currentMonthLabel = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export const nextMonthLabel = () => {
  const d = new Date();
  const month = d.getMonth() === 11 ? 0 : d.getMonth() + 1;
  const year = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
  return `${String(month + 1).padStart(2, "0")}/${year}`;
};
