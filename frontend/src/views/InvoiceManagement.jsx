"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress, MenuItem, TextField, InputAdornment } from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MessageDialog from "../components/MessageDialog";
import FilterBar from "../components/ui/FilterBar";
import InvoiceTable from "../components/invoice/InvoiceTable";
import PrintableInvoiceModal from "../components/invoice/PrintableInvoiceModal";
import invoiceApi from "../api/invoiceApi";
import settingApi from "../api/settingApi";
import buildingApi from "../api/buildingApi";

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // Print modal
  const [printableInvoice, setPrintableInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const [invRes, setRes, bRes] = await Promise.all([invoiceApi.getAll(), settingApi.getAll(), buildingApi.getAll()]);
      setInvoices(invRes.data.invoices);
      setSettings(setRes.data);
      setBuildings(bRes.data.buildings || []);
    } catch {
      setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
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
    submitted: invoices.filter(i => i.status === "submitted").length,
    paid: invoices.filter(i => i.status === "paid").length,
    pending: invoices.filter(i => i.status === "pending").length,
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
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.025em" }}>Quản Lý Hóa Đơn & Thanh Toán</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Xem danh sách hóa đơn, xác nhận thu tiền, chốt chỉ số điện nước và xuất phiếu thu VietQR.
        </Typography>
      </Box>

      <FilterBar
        filters={[
          { key: "all", label: "Tất Cả", activeColor: "#2563eb" },
          { key: "submitted", label: "Đã Gửi Chỉ Số", activeColor: "#d97706" },
          { key: "paid", label: "Đã Thanh Toán", activeColor: "#059669" },
          { key: "pending", label: "Chờ Thu Tiền", activeColor: "#334155" },
        ]}
        total={invoices.length}
        counts={counts}
        activeKey={filterStatus}
        onFilterChange={setFilterStatus}
        search={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm số phòng, tên khách..."
      />

      {buildings.length > 0 && (
        <TextField
          select
          size="small"
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          slotProps={{
            input: { startAdornment: (<InputAdornment position="start"><ApartmentIcon sx={{ fontSize: 18, color: "#64748b" }} /></InputAdornment>) },
          }}
          sx={{ maxWidth: 320, "& .MuiSelect-select": { py: 1.1, fontSize: "0.75rem", fontWeight: 600 } }}
        >
          <MenuItem value="all">Tất cả các nhà</MenuItem>
          {buildings.map((b) => (
            <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
          ))}
        </TextField>
      )}

      {loading ? <CircularProgress /> : (
        <InvoiceTable
          invoices={filteredInvoices}
          onMarkPaid={handleMarkAsPaid}
          onRemind={handleSendReminder}
          onPrint={setPrintableInvoice}
        />
      )}

      <PrintableInvoiceModal invoice={printableInvoice} settings={settings} onClose={() => setPrintableInvoice(null)} />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
