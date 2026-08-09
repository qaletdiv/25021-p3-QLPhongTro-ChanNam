export const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

export const formatDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "-";

export const formatDateTime = (v, withSeconds = false) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: withSeconds ? "2-digit" : undefined,
  });
};

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

export const nextMonthOf = (month) => {
  const [mm, yyyy] = String(month).split("/").map(Number);
  const m = mm === 12 ? 1 : mm + 1;
  const year = mm === 12 ? yyyy + 1 : yyyy;
  return `${String(m).padStart(2, "0")}/${year}`;
};
