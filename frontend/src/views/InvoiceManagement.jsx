"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, Paper, CircularProgress, MenuItem, TextField, InputAdornment } from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import MessageDialog from "../components/MessageDialog";
import InvoiceTable from "../components/invoice/InvoiceTable";
import PrintableInvoiceModal from "../components/invoice/PrintableInvoiceModal";
import { currentMonthLabel } from "../utils/format";
import invoiceApi from "../api/invoiceApi";
import settingApi from "../api/settingApi";
import buildingApi from "../api/buildingApi";

const monthOptions = () => {
  const options = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    options.push(`${String(m.getMonth() + 1).padStart(2, "0")}/${m.getFullYear()}`);
  }
  return options;
};

export default function InvoiceManagement({ initialInvoices = [], initialSettings = null, initialBuildings = [] }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [buildings, setBuildings] = useState(initialBuildings);
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(currentMonthLabel());
  const [searchQuery, setSearchQuery] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // Print modal
  const [printableInvoice, setPrintableInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const [invRes, setRes, bRes] = await Promise.all([
        invoiceApi.getAll({ month: monthFilter }),
        settingApi.getAll(),
        buildingApi.getAll()
      ]);
      setInvoices(invRes.data.invoices);
      setSettings(setRes.data);
      setBuildings(bRes.data.buildings || []);
    } catch {
      setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" });
    } finally { setLoading(false); }
  }, [monthFilter]);

  // Dữ liệu ban đầu được fetch server-side; chỉ refetch khi đổi tháng lọc
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === "unpaid") { if (inv.status !== "pending") return false; }
    else if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (buildingFilter !== "all" && String(inv.contract?.room?.building?.id || "") !== buildingFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const roomNum = inv.contract?.room?.room_number || "";
      const tenantName = inv.contract?.tenant?.name || "";
      if (!roomNum.toLowerCase().includes(q) && !tenantName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = {
    all: invoices.length,
    unpaid: invoices.filter(i => i.status === "pending").length,
    submitted: invoices.filter(i => i.status === "submitted").length,
    paid: invoices.filter(i => i.status === "paid").length,
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await invoiceApi.markAsPaid(id);
      fetchInvoices();
      setTimeout(() => setSnack({ open: true, message: "Xác nhận thanh toán thành công", severity: "success" }), 300);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    }
  };

  const handleSendReminder = async (id) => {
    try {
      const res = await invoiceApi.sendReminder(id);
      setSnack({ open: true, message: res.data.message, severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Header */}
      <Box>
        <Typography variant="h5" fontWeight="bold">Quản Lý Hóa Đơn & Thanh Toán</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Xem danh sách hóa đơn, xác nhận thu tiền, chốt chỉ số điện nước và xuất phiếu thu VietQR.
        </Typography>
      </Box>

      {/* Filter Panel: 2 rows x 2 columns */}
      <Paper sx={{ p: 2.5, borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          {/* Row 1: Building */}
          <Box>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Theo Nhà Trọ</Typography>
            <TextField
              select fullWidth size="small" value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}
              slotProps={{ input: { startAdornment: (<InputAdornment position="start"><ApartmentIcon sx={{ fontSize: 18, color: "#64748b" }} /></InputAdornment>) } }}
              sx={{ "& .MuiSelect-select": { py: 1.1, fontSize: "0.75rem", fontWeight: 600 } }}
            >
              <MenuItem value="all">Tất cả các nhà</MenuItem>
              {buildings.map((b) => (
                <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Row 1: Month */}
          <Box>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Theo Tháng</Typography>
            <TextField
              select fullWidth size="small" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
              slotProps={{ input: { startAdornment: (<InputAdornment position="start"><CalendarMonthIcon sx={{ fontSize: 18, color: "#64748b" }} /></InputAdornment>) } }}
              sx={{ "& .MuiSelect-select": { py: 1.1, fontSize: "0.75rem", fontWeight: 600 } }}
            >
              {monthOptions().map((m) => (
                <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Row 2: Status */}
          <Box>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Theo Trạng Thái</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, bgcolor: "#f1f5f9", p: 0.5, borderRadius: "12px" }}>
              {[
                { key: "all", label: "Tất Cả", activeColor: "#2563eb" },
                { key: "unpaid", label: "Chưa Gửi Chỉ Số", activeColor: "#dc2626" },
                { key: "submitted", label: "Đã Gửi Chỉ Số", activeColor: "#d97706" },
                { key: "paid", label: "Đã Thanh Toán", activeColor: "#059669" },
              ].map((f) => (
                <Box key={f.key} onClick={() => setFilterStatus(f.key)}
                  sx={{ px: 1.75, py: 0.9, borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", bgcolor: filterStatus === f.key ? f.activeColor : "transparent", color: filterStatus === f.key ? "#fff" : "#475569", boxShadow: filterStatus === f.key ? "0 1px 2px rgba(0,0,0,0.05)" : "none", transition: "all 0.15s", whiteSpace: "nowrap" }}
                >{f.label} ({counts[f.key] ?? invoices.length})</Box>
              ))}
            </Box>
          </Box>

          {/* Row 2: Search */}
          <Box>
            <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", mb: 0.75 }}>Tìm Kiếm</Typography>
            <TextField
              fullWidth size="small" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Số phòng, tên khách..."
              slotProps={{ input: { startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "#94a3b8" }} /></InputAdornment>) } }}
              sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
            />
          </Box>
        </Box>
      </Paper>

      {loading ? <CircularProgress /> : (
        <InvoiceTable
          invoices={filteredInvoices}
          onMarkPaid={handleMarkAsPaid}
          onRemind={handleSendReminder}
          onPrint={setPrintableInvoice}
        />
      )}

      <PrintableInvoiceModal invoice={printableInvoice} onClose={() => setPrintableInvoice(null)} />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
