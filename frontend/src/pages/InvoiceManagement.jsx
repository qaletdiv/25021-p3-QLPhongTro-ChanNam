import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, TextField, MenuItem, Alert, CircularProgress, Snackbar, Paper, IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PrinterIcon from "@mui/icons-material/Print";
import invoiceApi from "../api/invoiceApi";
import settingApi from "../api/settingApi";

const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
const statusLabel = { pending: "Chờ Nhập Chỉ Số", submitted: "Đã Gửi Chỉ Số", paid: "Đã Thanh Toán" };

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // Reading modal
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [newElecInput, setNewElecInput] = useState(0);
  const [newWaterInput, setNewWaterInput] = useState(0);
  const [readingError, setReadingError] = useState("");

  // Print modal
  const [printableInvoice, setPrintableInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const [invRes, setRes] = await Promise.all([invoiceApi.getAll(), settingApi.getAll()]);
      setInvoices(invRes.data.invoices);
      setSettings(setRes.data);
    } catch {
      setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const roomNum = inv.contract?.room?.room_number || "";
      const tenantName = inv.contract?.tenant?.name || "";
      if (!roomNum.toLowerCase().includes(q) && !tenantName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleMarkAsPaid = async (id) => {
    try {
      await invoiceApi.markAsPaid(id);
      setSnack({ open: true, message: "Xác nhận thanh toán thành công", severity: "success" });
      fetchInvoices();
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

  const handleOpenReadingModal = (inv) => {
    setEditingInvoice(inv);
    setNewElecInput(inv.newElectricity || inv.oldElectricity || 0);
    setNewWaterInput(inv.newWater || inv.oldWater || 0);
    setReadingError("");
  };

  const handleSaveReading = async (e) => {
    e.preventDefault();
    if (!editingInvoice) return;
    if (newElecInput < (editingInvoice.oldElectricity || 0)) {
      setReadingError("Chỉ số điện mới không được nhỏ hơn chỉ số cũ!");
      return;
    }
    if (newWaterInput < (editingInvoice.oldWater || 0)) {
      setReadingError("Chỉ số nước mới không được nhỏ hơn chỉ số cũ!");
      return;
    }
    try {
      await invoiceApi.submitReading(editingInvoice.id, { electricity: newElecInput, water: newWaterInput });
      setSnack({ open: true, message: "Nhập chỉ số thành công", severity: "success" });
      setEditingInvoice(null);
      fetchInvoices();
    } catch (err) {
      setReadingError(err.response?.data?.message || "Lỗi khi lưu chỉ số");
    }
  };

  const inv = (obj) => obj || {};

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.025em" }}>Quản Lý Hóa Đơn & Thanh Toán</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
          Xem danh sách hóa đơn, xác nhận thu tiền, chốt chỉ số điện nước và xuất phiếu thu VietQR.
        </Typography>
      </Box>

      {/* Filter & Search Bar */}
      <Paper sx={{ p: 2, borderRadius: "16px", display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, gap: 2, justifyContent: "space-between", border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, bgcolor: "#f1f5f9", p: 0.5, borderRadius: "12px", width: { xs: "100%", md: "auto" } }}>
          {[
            { key: "all", label: `Tất Cả (${invoices.length})`, activeColor: "#2563eb" },
            { key: "submitted", label: `Đã Gửi Chỉ Số (${invoices.filter(i => i.status === "submitted").length})`, activeColor: "#d97706" },
            { key: "paid", label: `Đã Thanh Toán (${invoices.filter(i => i.status === "paid").length})`, activeColor: "#059669" },
            { key: "pending", label: `Chờ Nhập Chỉ Số (${invoices.filter(i => i.status === "pending").length})`, activeColor: "#334155" },
          ].map((f) => (
            <Box key={f.key} onClick={() => setFilterStatus(f.key)}
              sx={{ px: 1.75, py: 0.9, borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", bgcolor: filterStatus === f.key ? f.activeColor : "transparent", color: filterStatus === f.key ? "#fff" : "#475569", boxShadow: filterStatus === f.key ? "0 1px 2px rgba(0,0,0,0.05)" : "none", transition: "all 0.15s", whiteSpace: "nowrap" }}
            >{f.label}</Box>
          ))}
        </Box>
        <Box sx={{ position: "relative", width: { xs: "100%", md: 280 } }}>
          <SearchIcon sx={{ position: "absolute", left: 10, top: 9, fontSize: 16, color: "#94a3b8", zIndex: 1 }} />
          <input
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm số phòng, tên khách..."
            style={{
              width: "100%", padding: "8.5px 12px 8.5px 34px", fontSize: "0.75rem",
              border: "1px solid #e2e8f0", borderRadius: "12px", outline: "none", boxSizing: "border-box",
              backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#2563eb"; e.target.style.backgroundColor = "#fff"; e.target.style.boxShadow = "0 0 0 2px rgba(37,99,235,0.2)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.backgroundColor = "#f8fafc"; e.target.style.boxShadow = "none"; }}
          />
        </Box>
      </Paper>

      {/* Table */}
      {loading ? <CircularProgress /> : (
        <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Phòng / Khách", "Tiền Phòng", "Tiền Điện (kWh)", "Tiền Nước (m³)", "Dịch Vụ", "Tổng Cộng", "Trạng Thái", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", fontWeight: 700, color: "#475569", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "" ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.8125rem" }}>Phòng {inv.contract?.room?.room_number || "—"}</div>
                      <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>{inv.contract?.tenant?.name || "—"} ({inv.month})</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>{formatCurrency(inv.roomPrice)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(inv.electricityCost)}</div>
                      <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontFamily: "monospace" }}>
                        {inv.oldElectricity || 0} → {inv.newElectricity || 0} ({(inv.newElectricity || 0) - (inv.oldElectricity || 0)} kWh)
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{formatCurrency(inv.waterCost)}</div>
                      <div style={{ fontSize: "0.6875rem", color: "#94a3b8", fontFamily: "monospace" }}>
                        {inv.oldWater || 0} → {inv.newWater || 0} ({(inv.newWater || 0) - (inv.oldWater || 0)} m³)
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#475569" }}>{formatCurrency(inv.serviceFee + inv.otherFees)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 800, color: "#2563eb", fontSize: "0.8125rem" }}>{formatCurrency(inv.total)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {inv.status === "paid" && (
                        <span style={{ padding: "4px 10px", backgroundColor: "#d1fae5", color: "#065f46", fontSize: "0.6875rem", fontWeight: 800, borderRadius: "9999px", border: "1px solid #a7f3d0", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#059669", display: "inline-block" }} />
                          Đã Thanh Toán
                        </span>
                      )}
                      {inv.status === "submitted" && (
                        <span style={{ padding: "4px 10px", backgroundColor: "#fef3c7", color: "#92400e", fontSize: "0.6875rem", fontWeight: 800, borderRadius: "9999px", border: "1px solid #fde68a", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#d97706", display: "inline-block" }} />
                          Đã Gửi Chỉ Số
                        </span>
                      )}
                      {inv.status === "pending" && (
                        <span style={{ padding: "4px 10px", backgroundColor: "#f1f5f9", color: "#475569", fontSize: "0.6875rem", fontWeight: 800, borderRadius: "9999px", border: "1px solid #e2e8f0" }}>
                          ○ Chờ Nhập Chỉ Số
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      {inv.status === "pending" && (
                        <Box onClick={() => handleOpenReadingModal(inv)} sx={{ display: "inline-flex", px: 1.25, py: 0.75, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, mr: 0.5 }}>
                          Nhập Chỉ Số
                        </Box>
                      )}
                      {inv.status !== "paid" && (
                        <>
                          <Box onClick={() => handleMarkAsPaid(inv.id)} sx={{ display: "inline-flex", px: 1.25, py: 0.75, bgcolor: "#059669", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#047857" }, mr: 0.5 }}>
                            Thu Tiền
                          </Box>
                          <Box onClick={() => handleSendReminder(inv.id)} sx={{ display: "inline-flex", px: 1.25, py: 0.75, bgcolor: "#d97706", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", "&:hover": { bgcolor: "#b45309" }, mr: 0.5 }}>
                            Nhắc Zalo
                          </Box>
                        </>
                      )}
                      <IconButton size="small" onClick={() => setPrintableInvoice(inv)} sx={{ color: "#64748b", "&:hover": { color: "#0f172a", bgcolor: "#f1f5f9" } }}>
                        <PrinterIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>Chưa có hóa đơn nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Input Reading Modal */}
      {editingInvoice && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 460, overflow: "hidden" }}>
            <Box sx={{ bgcolor: "#2563eb", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
                Nhập Chỉ Số - Phòng {editingInvoice.contract?.room?.room_number || ""}
              </Typography>
              <IconButton onClick={() => setEditingInvoice(null)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </IconButton>
            </Box>
            <Box component="form" onSubmit={handleSaveReading} sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
              {readingError && (
                <Box sx={{ p: 1.5, bgcolor: "#ffe4e6", color: "#be123c", fontSize: "0.75rem", fontWeight: 700, borderRadius: "12px", border: "1px solid #fecaca" }}>{readingError}</Box>
              )}
              <Box sx={{ p: 1.75, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", fontSize: "0.75rem", color: "#475569" }}>
                Chỉ số tháng trước: Điện: <strong style={{ color: "#0f172a" }}>{editingInvoice.oldElectricity || 0} kWh</strong> | Nước: <strong style={{ color: "#0f172a" }}>{editingInvoice.oldWater || 0} m³</strong>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Chỉ Số Điện Mới (kWh)</Typography>
                <TextField fullWidth size="small" type="number" required value={newElecInput}
                  onChange={(e) => setNewElecInput(Number(e.target.value))}
                  sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Chỉ Số Nước Mới (m³)</Typography>
                <TextField fullWidth size="small" type="number" required value={newWaterInput}
                  onChange={(e) => setNewWaterInput(Number(e.target.value))}
                  sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1 }}>
                <Box onClick={() => setEditingInvoice(null)} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
                <Box component="button" type="submit" sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, border: "none" }}>
                  Tính & Gửi Hóa Đơn
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Printable Invoice / VietQR Modal */}
      {printableInvoice && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Box sx={{ bgcolor: "#0f172a", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>Phiếu Bảng Kê Thanh Toán & VietQR</Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box onClick={() => window.print()} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.5, py: 0.9, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                  <PrinterIcon sx={{ fontSize: 14 }} />
                  <span>In PDF</span>
                </Box>
                <IconButton onClick={() => setPrintableInvoice(null)} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ p: 3, overflow: "auto" }}>
              <Box sx={{ textAlign: "center", borderBottom: "1px solid #e2e8f0", pb: 2, mb: 3 }}>
                <Typography sx={{ fontSize: "1.25rem", fontWeight: 900, color: "#0f172a", textTransform: "uppercase" }}>BẢNG KÊ TIỀN PHÒNG</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>Tháng {printableInvoice.month}</Typography>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, p: 2, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", mb: 3, fontSize: "0.75rem" }}>
                <Box><span style={{ color: "#94a3b8" }}>Phòng:</span> <strong style={{ color: "#0f172a" }}>{printableInvoice.contract?.room?.room_number || "—"}</strong></Box>
                <Box><span style={{ color: "#94a3b8" }}>Khách thuê:</span> <strong style={{ color: "#0f172a" }}>{printableInvoice.contract?.tenant?.name || "—"}</strong></Box>
                <Box><span style={{ color: "#94a3b8" }}>Hạn thanh toán:</span> <strong style={{ color: "#0f172a" }}>Cuối tháng</strong></Box>
                <Box>
                  <span style={{ color: "#94a3b8" }}>Trạng thái:</span>{" "}
                  <strong style={{ color: printableInvoice.status === "paid" ? "#059669" : "#d97706" }}>
                    {printableInvoice.status === "paid" ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
                  </strong>
                </Box>
              </Box>
              <Paper sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", mb: 3 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#0f172a", color: "#fff" }}>
                      <th style={{ padding: "10px 14px", fontWeight: 800, textAlign: "left" }}>Khoản Mục</th>
                      <th style={{ padding: "10px 14px", fontWeight: 800, textAlign: "center" }}>Chỉ Số / Chi Tiết</th>
                      <th style={{ padding: "10px 14px", fontWeight: 800, textAlign: "right" }}>Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Tiền phòng", detail: "1 Tháng", amount: printableInvoice.roomPrice },
                      { label: `Tiền điện (${formatCurrency(printableInvoice.electricityRate || 0)}/kWh)`, detail: `${printableInvoice.oldElectricity || 0} → ${printableInvoice.newElectricity || 0} (${(printableInvoice.newElectricity || 0) - (printableInvoice.oldElectricity || 0)} kWh)`, amount: printableInvoice.electricityCost },
                      { label: `Tiền nước (${formatCurrency(printableInvoice.waterRate || 0)}/m³)`, detail: `${printableInvoice.oldWater || 0} → ${printableInvoice.newWater || 0} (${(printableInvoice.newWater || 0) - (printableInvoice.oldWater || 0)} m³)`, amount: printableInvoice.waterCost },
                      { label: "Phí dịch vụ & rác", detail: "Cố định", amount: printableInvoice.serviceFee + printableInvoice.otherFees },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0f172a" }}>{row.label}</td>
                        <td style={{ padding: "10px 14px", textAlign: "center", color: "#64748b" }}>{row.detail}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>{formatCurrency(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: "#eff6ff", borderTop: "2px solid #bfdbfe" }}>
                      <td colSpan={2} style={{ padding: "10px 14px", textAlign: "right", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase" }}>TỔNG CỘNG THANH TOÁN:</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 900, fontSize: "0.9375rem", color: "#1d4ed8" }}>{formatCurrency(printableInvoice.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </Paper>
              <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mb: 2 }}>
                  Quét Mã VietQR Chuyển Khoản Tự Động
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <Box component="img"
                    src={`https://img.vietqr.io/image/${settings?.bankName || "MBBank"}-${settings?.bankAccountNo || "0988776655"}-compact2.png?amount=${printableInvoice.total}&addInfo=${encodeURIComponent(`Thanh toan phong ${printableInvoice.contract?.room?.room_number || ""} thang ${printableInvoice.month}`)}&accountName=${encodeURIComponent(settings?.bankAccountOwner || "")}`}
                    alt="VietQR"
                    sx={{ width: 180, height: 180, objectFit: "contain", border: "1px solid #e2e8f0", borderRadius: "16px", bgcolor: "#fff", p: 1 }}
                  />
                </Box>
                <Typography sx={{ fontSize: "0.6875rem", color: "#64748b" }}>
                  Ngân hàng: <strong style={{ color: "#0f172a" }}>{settings?.bankName || "MBBank"}</strong> | Số TK: <strong style={{ color: "#0f172a" }}>{settings?.bankAccountNo || "0988776655"}</strong><br />
                  Chủ TK: <strong style={{ color: "#0f172a" }}>{settings?.bankAccountOwner || "—"}</strong>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
