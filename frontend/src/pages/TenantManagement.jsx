import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, TextField, IconButton, Alert, CircularProgress,
  Snackbar, Chip, Paper, InputAdornment, Grid, Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PrintIcon from "@mui/icons-material/Print";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import contractTemplateApi from "../api/contractTemplateApi";
import tenantApi from "../api/tenantApi";
import roomApi from "../api/roomApi";
import contractApi from "../api/contractApi";
import furnitureApi from "../api/furnitureApi";

const formatCurrency = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";
const formatDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "-";

export default function TenantManagement() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [editTenantId, setEditTenantId] = useState(null);
  const [tenantForm, setTenantForm] = useState({ name: "", phone: "", cccd: "" });
  const [checkoutConfirm, setCheckoutConfirm] = useState(null);
  const paymentDayManuallyChanged = useRef(false);

  const [contractLoading, setContractLoading] = useState(false);
  const [openContract, setOpenContract] = useState(false);
  const [editContractId, setEditContractId] = useState(null);
  const [contractForm, setContractForm] = useState({
    tenantId: "", roomId: "", deposit: "", startDate: "", endDate: "",
    paymentDay: 5, fingerprintCode: "", furnitures: [],
  });
  const [companionFingerprints, setCompanionFingerprints] = useState([]);
  const [emptyRooms, setEmptyRooms] = useState([]);
  const [furnitureList, setFurnitureList] = useState([]);
  const [selectedFurnitures, setSelectedFurnitures] = useState({});

  const fetchTenants = useCallback(async () => {
    try { const res = await tenantApi.getAll(search || undefined); setTenants(res.data.tenants); }
    catch { setSnack({ open: true, message: "Lỗi tải danh sách khách", severity: "error" }); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const openEdit = async (tenant) => {
    setEditTenantId(tenant.id);
    setTenantForm({ name: tenant.name, phone: tenant.phone, cccd: tenant.cccd || "" });

    const activeContract = tenant.contracts?.find((c) => c.status === "active");
    if (activeContract) {
      try {
        const [furnRes, contractRes] = await Promise.all([
          furnitureApi.getAll(),
          contractApi.getById(activeContract.id),
        ]);
        const contract = contractRes.data.contract;
        setFurnitureList(furnRes.data.furnitures);
        const existingFurns = {};
        furnRes.data.furnitures.forEach((f) => {
          const ef = contract.contractFurnitures?.find(cf => cf.furnitureId === f.id);
          existingFurns[f.id] = { checked: !!ef, quantity: ef ? ef.quantity : f.default_quantity };
        });
        setSelectedFurnitures(existingFurns);

        setContractForm({
          tenantId: tenant.id, roomId: activeContract.roomId,
          deposit: contract.deposit,
          startDate: contract.startDate?.split("T")[0] || contract.startDate,
          endDate: contract.endDate?.split("T")[0] || contract.endDate,
          paymentDay: contract.paymentDay,
          fingerprintCode: contract.fingerprintCode || "", furnitures: [],
        });
        setCompanionFingerprints(contract.companions?.map(c => ({
          id: c.id, name: c.name, fingerprintCode: c.fingerprintCode || ""
        })) || []);
        setEditContractId(contract.id);
        paymentDayManuallyChanged.current = true;
      } catch {
        setSnack({ open: true, message: "Lỗi tải thông tin hợp đồng", severity: "error" });
      }
    } else {
      setEditContractId(null);
      setFurnitureList([]);
      setSelectedFurnitures({});
    }
  };

  const handleSaveAll = async () => {
    try {
      setContractLoading(true);
      if (editTenantId) {
        await tenantApi.update(editTenantId, tenantForm);
      } else {
        await tenantApi.create(tenantForm);
      }
      if (editContractId) {
        const contractData = {
          ...contractForm, deposit: Number(contractForm.deposit),
          paymentDay: Number(contractForm.paymentDay),
          companionFingerprints
        };
        await contractApi.update(editContractId, contractData);
      }
      fetchTenants();
      setTimeout(() => setSnack({ open: true, message: "Cập nhật thông tin thành công", severity: "success" }), 300);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
    } finally { setContractLoading(false); }
  };

  const openCreateContract = async () => {
    try {
      const [roomsRes, furnRes] = await Promise.all([roomApi.getAll("empty"), furnitureApi.getAll()]);
      setEmptyRooms(roomsRes.data.rooms);
      setFurnitureList(furnRes.data.furnitures);
      const defaultFurnitures = {};
      furnRes.data.furnitures.forEach((f) => { defaultFurnitures[f.id] = { checked: false, quantity: f.default_quantity }; });
      setSelectedFurnitures(defaultFurnitures);
      setContractForm({
        tenantId: "", roomId: "", deposit: "", startDate: "", endDate: "",
        paymentDay: 5, fingerprintCode: "", furnitures: [],
      });
      setCompanionFingerprints([]);
      paymentDayManuallyChanged.current = false;
      setEditContractId(null);
      setOpenContract(true);
    } catch {
      setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" });
    }
  };

  const openEditContract = async (contractId, tenant) => {
    try {
      const res = await contractApi.getById(contractId);
      const contract = res.data.contract;
      const [roomsRes, furnRes] = await Promise.all([roomApi.getAll("empty"), furnitureApi.getAll()]);
      setEmptyRooms(roomsRes.data.rooms);
      setFurnitureList(furnRes.data.furnitures);
      const existingFurns = {};
      furnRes.data.furnitures.forEach((f) => {
        const ef = contract.contractFurnitures?.find(cf => cf.furnitureId === f.id);
        existingFurns[f.id] = { checked: !!ef, quantity: ef ? ef.quantity : f.default_quantity };
      });
      setSelectedFurnitures(existingFurns);
      setContractForm({
        tenantId: contract.tenantId, roomId: contract.roomId,
        deposit: contract.deposit, startDate: contract.startDate?.split("T")[0] || contract.startDate,
        endDate: contract.endDate?.split("T")[0] || contract.endDate,
        paymentDay: contract.paymentDay, fingerprintCode: contract.fingerprintCode || "", furnitures: [],
      });
      setCompanionFingerprints(contract.companions?.map(c => ({
        id: c.id, name: c.name, fingerprintCode: c.fingerprintCode || ""
      })) || []);
      paymentDayManuallyChanged.current = true;
      setEditContractId(contract.id);
      setOpenContract(true);
    } catch {
      setSnack({ open: true, message: "Lỗi tải thông tin hợp đồng", severity: "error" });
    }
  };

  const handleSaveContract = async () => {
    if (contractForm.deposit === "") {
      setSnack({ open: true, message: "Vui lòng nhập tiền cọc", severity: "warning" });
      return;
    }
    if (contractForm.startDate && contractForm.endDate && new Date(contractForm.startDate) >= new Date(contractForm.endDate)) {
      setSnack({ open: true, message: "Ngày kết thúc phải sau ngày bắt đầu", severity: "warning" });
      return;
    }
    try {
      setContractLoading(true);
      const data = { ...contractForm, deposit: Number(contractForm.deposit), paymentDay: Number(contractForm.paymentDay), companionFingerprints };

      if (editContractId) {
        await contractApi.update(editContractId, data);
      } else {
        const furnitures = Object.entries(selectedFurnitures)
          .filter(([, v]) => v.checked)
          .map(([furnitureId, v]) => ({ furnitureId: Number(furnitureId), quantity: v.quantity }));
        data.furnitures = furnitures;
        await contractApi.create(data);
      }
      setOpenContract(false);
      setTimeout(() => setSnack({ open: true, message: editContractId ? "Cập nhật hợp đồng thành công" : "Tạo hợp đồng thành công", severity: "success" }), 300);
      fetchTenants();
    } catch (err) {
      const data = err.response?.data;
      if (data?.error) setSnack({ open: true, message: data.error.map(e => e.msg).join("; "), severity: "error" });
      else setSnack({ open: true, message: data?.message || "Lỗi", severity: "error" });
    } finally { setContractLoading(false); }
  };

  const handleCheckoutConfirm = () => {
    handleCheckout(checkoutConfirm.id);
  };

  const handleCheckout = async (contractId) => {
    try {
      await contractApi.checkout(contractId);
      setCheckoutConfirm(null);
      fetchTenants();
      setTimeout(() => setSnack({ open: true, message: "Trả phòng thành công", severity: "success" }), 300);
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Lỗi", severity: "error" });
      setCheckoutConfirm(null);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.025em" }}>
            Quản Lý Khách & Hợp Đồng Cho Thuê
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>
            Lập hợp đồng cho thuê, gán mã vân tay, chọn danh mục vật dụng và thanh lý hợp đồng.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <TextField
            size="small" placeholder="Tìm theo tên, SĐT hoặc phòng..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94a3b8", fontSize: 16 }} /></InputAdornment> }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px", fontSize: "0.75rem", bgcolor: "#f8fafc",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
              }
            }}
          />
          <Box
            onClick={openCreateContract}
            sx={{
              display: "inline-flex", alignItems: "center", gap: 1,
              px: 2, py: 1.25, bgcolor: "#2563eb", color: "#fff",
              borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700,
              cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" },
              boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
            <span>Lập Hợp Đồng Mới</span>
          </Box>
        </Box>
      </Box>

      {loading ? <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box> : (
        <>
          {/* Table */}
          <Paper sx={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["Phòng", "Khách Thuê", "Tiền Cọc", "Thời Hạn HĐ", "Ngày Thu", "Mã Vân Tay", "Trạng Thái", ""].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", fontWeight: 700, color: "#475569", fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "" ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {tenants.map((tenant) => {
                    const active = tenant.contracts?.find((c) => c.status === "active");
                    const ended = !active && tenant.contracts?.some(c => c.status === "ended");
                    const displayContract = active || tenant.contracts?.[0];
                    return (
                      <tr key={tenant.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ padding: "12px 16px", fontWeight: 800, color: "#0f172a", fontSize: "0.8125rem" }}>
                          Phòng {displayContract?.room?.room_number || "-"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{tenant.name}</div>
                          <div style={{ color: "#64748b", fontSize: "0.6875rem" }}>{tenant.phone}</div>
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2563eb" }}>
                          {active ? formatCurrency(active.deposit) : "-"}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>
                          {displayContract ? `${formatDate(displayContract.startDate)} - ${formatDate(displayContract.endDate)}` : "-"}
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>
                          {active ? `Ngày ${active.paymentDay}` : "-"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {displayContract?.fingerprintCode ? (
                            <span style={{ fontFamily: "monospace", backgroundColor: "#f1f5f9", color: "#0f172a", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "8px", fontSize: "0.6875rem", fontWeight: 700 }}>
                              {displayContract.fingerprintCode}
                            </span>
                          ) : "-"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {active ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", fontSize: "0.6875rem", fontWeight: 800, borderRadius: "9999px", backgroundColor: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#059669", display: "inline-block" }} />
                              Đang Cho Thuê
                            </span>
                          ) : ended ? (
                            <span style={{ padding: "3px 10px", fontSize: "0.6875rem", fontWeight: 600, borderRadius: "9999px", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
                              ○ Đã Kết Thúc
                            </span>
                          ) : (
                            <span style={{ padding: "3px 10px", fontSize: "0.6875rem", fontWeight: 600, borderRadius: "9999px", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
                              Chưa thuê
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <IconButton size="small" onClick={() => openEdit(tenant)} title="Sửa" sx={{ color: "#64748b", "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" } }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          {active && (
                            <IconButton size="small" onClick={() => {
                              const ac = tenant.contracts?.find(c => c.status === "active");
                              setCheckoutConfirm(ac ? { ...ac, roomNumber: ac.room?.room_number, tenantName: tenant.name } : null);
                            }} title="Trả phòng" sx={{ color: "#64748b", "&:hover": { color: "#e11d48", bgcolor: "#ffe4e6" } }}>
                              <ExitToAppIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                          {active && (
                            <IconButton size="small" onClick={() => window.open(contractTemplateApi.getPdfUrl(active.id), "_blank")} title="In hợp đồng" sx={{ color: "#64748b", "&:hover": { color: "#059669", bgcolor: "#d1fae5" } }}>
                              <PrintIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          </Paper>
        </>
      )}

      {/* Create / Edit All-In-One Modal */}
      {openContract && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 640, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Header */}
            <Box sx={{ bgcolor: "#2563eb", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <HowToRegIcon sx={{ color: "#fff", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
                  {editContractId ? "Sửa Hợp Đồng" : "Lập Hợp Đồng Cho Thuê Mới"}
                </Typography>
              </Box>
              <IconButton onClick={() => setOpenContract(false)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </IconButton>
            </Box>

            {/* Form */}
            <Box sx={{ p: 3, overflow: "auto", display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* Room Selection */}
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Chọn Phòng Trống *</Typography>
                {emptyRooms.length === 0 ? (
                  <Box sx={{ p: 2, bgcolor: "#fffbeb", color: "#92400e", borderRadius: "12px", border: "1px solid #fde68a", fontSize: "0.75rem", fontWeight: 700 }}>
                    Không có phòng trống nào khả dụng! Vui lòng tạo thêm phòng mới trong mục quản lý phòng.
                  </Box>
                ) : (
                  <Box
                    component="select"
                    value={contractForm.roomId}
                    onChange={(e) => {
                      const room = emptyRooms.find((r) => r.id === e.target.value);
                      setContractForm({ ...contractForm, roomId: e.target.value, deposit: room ? String(room.price) : contractForm.deposit, paymentDay: paymentDayManuallyChanged.current ? contractForm.paymentDay : (room?.default_payment_day || 5) });
                    }}
                    sx={{ width: "100%", px: 1.75, py: 1.5, fontSize: "0.75rem", bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", outline: "none", "&:focus": { bgcolor: "#fff", borderColor: "#2563eb", boxShadow: "0 0 0 2px rgba(37,99,235,0.2)" }, fontFamily: "Arial, sans-serif" }}
                  >
                    <option value="">-- Chọn phòng --</option>
                    {emptyRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Phòng {r.room_number} - Tầng {r.floor || "?"} ({r.area || "?"}m²) - Giá: {formatCurrency(r.price)}/tháng
                      </option>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Tenant Details */}
              <Grid container spacing={1.5}>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Họ & Tên Khách *</Typography>
                  <TextField
                    fullWidth size="small" placeholder="Nguyễn Văn A"
                    value={editContractId ? "" : contractForm.tenantName} onChange={() => {}}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
                  />
                  <Box
                    component="select"
                    value={contractForm.tenantId}
                    onChange={(e) => {
                      const tid = e.target.value;
                      setContractForm({ ...contractForm, tenantId: tid });
                      const t = tenants.find(t => t.id === tid);
                      setCompanionFingerprints(t?.companions?.map(c => ({ id: c.id, name: c.name, fingerprintCode: "" })) || []);
                    }}
                    disabled={!!editContractId}
                    sx={{ width: "100%", mt: 0.75, px: 1.75, py: 1.5, fontSize: "0.75rem", bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", outline: "none", "&:focus": { bgcolor: "#fff", borderColor: "#2563eb", boxShadow: "0 0 0 2px rgba(37,99,235,0.2)" }, fontFamily: "Arial, sans-serif" }}
                  >
                    <option value="">-- Chọn khách --</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} - {t.phone}</option>
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Số Điện Thoại *</Typography>
                  <TextField
                    fullWidth size="small" placeholder="0912345678"
                    value={contractForm.tenantPhone || ""} onChange={() => {}}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Email (Tùy chọn)</Typography>
                  <TextField
                    fullWidth size="small" placeholder="email@gmail.com"
                    value={contractForm.tenantEmail || ""} onChange={() => {}}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
                  />
                </Grid>
              </Grid>

              {/* Financial & Fingerprint */}
              <Grid container spacing={1.5}>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Tiền Cọc (VND)</Typography>
                  <TextField
                    fullWidth size="small" type="number"
                    value={contractForm.deposit}
                    onChange={(e) => setContractForm({ ...contractForm, deposit: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ngày Thu Tiền</Typography>
                  <TextField
                    fullWidth size="small" type="number" inputProps={{ min: 1, max: 31 }}
                    value={contractForm.paymentDay}
                    onChange={(e) => { paymentDayManuallyChanged.current = true; setContractForm({ ...contractForm, paymentDay: e.target.value }); }}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Mã Vân Tay Khóa Cửa</Typography>
                  <TextField
                    fullWidth size="small"
                    value={contractForm.fingerprintCode}
                    onChange={(e) => setContractForm({ ...contractForm, fingerprintCode: e.target.value })}
                    placeholder="FP-101-88"
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" }, fontFamily: "monospace" } }}
                  />
                </Grid>
              </Grid>

              {/* Contract Dates */}
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ngày Bắt Đầu Hợp Đồng</Typography>
                  <TextField
                    fullWidth size="small" type="date"
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Ngày Kết Thúc Hợp Đồng</Typography>
                  <TextField
                    fullWidth size="small" type="date"
                    value={contractForm.endDate}
                    onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
                  />
                </Grid>
              </Grid>

              {/* Companion Fingerprints */}
              {companionFingerprints.length > 0 && (
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mb: 1 }}>Mã Số Vân Tay Người Đi Kèm</Typography>
                  {companionFingerprints.map((c, i) => (
                    <TextField
                      key={c.id} fullWidth size="small"
                      label={c.name}
                      value={c.fingerprintCode}
                      onChange={(e) => {
                        const updated = [...companionFingerprints];
                        updated[i] = { ...updated[i], fingerprintCode: e.target.value };
                        setCompanionFingerprints(updated);
                      }}
                      sx={{ mb: 0.75, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }}
                    />
                  ))}
                </Box>
              )}

              {/* Furniture Selection */}
              {furnitureList.length > 0 && (
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mb: 1 }}>
                    Danh Sách Vật Dụng Bàn Giao Trong Phòng:
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, p: 1.5, border: "1px solid #e2e8f0", borderRadius: "16px", bgcolor: "rgba(248,250,252,0.8)" }}>
                    {furnitureList.map((f) => {
                      const checked = selectedFurnitures[f.id]?.checked || false;
                      return (
                        <Box key={f.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.25, bgcolor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
                            onClick={() => setSelectedFurnitures({ ...selectedFurnitures, [f.id]: { ...selectedFurnitures[f.id], checked: !checked } })}
                          >
                            <Box component="input" type="checkbox" checked={checked} readOnly
                              sx={{ width: 16, height: 16, accentColor: "#2563eb", cursor: "pointer" }}
                            />
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a" }}>{f.name}</Typography>
                          </Box>
                          {checked && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Typography sx={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 700 }}>SL:</Typography>
                              <TextField
                                size="small" type="number" inputProps={{ min: 1 }}
                                value={selectedFurnitures[f.id]?.quantity || 1}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setSelectedFurnitures({ ...selectedFurnitures, [f.id]: { ...selectedFurnitures[f.id], quantity: Number(e.target.value) } })}
                                sx={{ width: 60, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "8px", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
                              />
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Box onClick={() => setOpenContract(false)} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>
                Hủy
              </Box>
              <Box onClick={handleSaveContract}
                sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", display: "flex", alignItems: "center", gap: 1 }}
              >
                {contractLoading && <CircularProgress size={14} sx={{ color: "#fff" }} />}
                {editContractId ? "Cập Nhật Hợp Đồng" : "Hoàn Tất Tạo Hợp Đồng"}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Edit Tenant & Contract Info Modal */}
      {editTenantId && !openContract && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: editContractId ? 640 : 420, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Box sx={{ bgcolor: "#2563eb", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
                {editTenantId ? "Sửa Thông Tin" : "Thêm Khách Thuê Mới"}
              </Typography>
              <IconButton onClick={() => { setEditTenantId(null); }} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </IconButton>
            </Box>
            <Box sx={{ p: 3, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {!editTenantId && (
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", mb: 0.75 }}>Chọn từ danh sách</Typography>
                  <Box
                    component="select"
                    onChange={(e) => {
                      const t = tenants.find(t => t.id === e.target.value);
                      if (t) setTenantForm({ name: t.name, phone: t.phone, cccd: t.cccd || "" });
                    }}
                    sx={{ width: "100%", px: 1.75, py: 1.5, fontSize: "0.75rem", bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", outline: "none", fontFamily: "Arial, sans-serif" }}
                  >
                    <option value="">-- Nhập thủ công --</option>
                    {tenants.map((t) => <option key={t.id} value={t.id}>{t.name} - {t.phone}</option>)}
                  </Box>
                </Box>
              )}
              <TextField fullWidth size="small" label="Họ tên" value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} required
                sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
              <TextField fullWidth size="small" label="Số điện thoại" value={tenantForm.phone} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} required
                sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
              <TextField fullWidth size="small" label="CCCD" value={tenantForm.cccd} onChange={(e) => setTenantForm({ ...tenantForm, cccd: e.target.value })}
                sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />

              {editContractId && (
                <>
                  <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.8125rem", mt: 1 }}>Thông tin hợp đồng</Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={4}>
                      <TextField fullWidth size="small" label="Tiền cọc (VND)" type="number" value={contractForm.deposit} onChange={(e) => setContractForm({ ...contractForm, deposit: e.target.value })} required
                        sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField fullWidth size="small" label="Ngày bắt đầu" type="date" value={contractForm.startDate} onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })} InputLabelProps={{ shrink: true }} required
                        sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField fullWidth size="small" label="Ngày kết thúc" type="date" value={contractForm.endDate} onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })} InputLabelProps={{ shrink: true }} required
                        sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField fullWidth size="small" label="Ngày thu tiền" type="number" value={contractForm.paymentDay} onChange={(e) => { paymentDayManuallyChanged.current = true; setContractForm({ ...contractForm, paymentDay: e.target.value }); }} inputProps={{ min: 1, max: 31 }} required
                        sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField fullWidth size="small" label="Vân tay (khách chính)" value={contractForm.fingerprintCode} onChange={(e) => setContractForm({ ...contractForm, fingerprintCode: e.target.value })}
                        sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
                    </Grid>
                  </Grid>

                  {companionFingerprints.length > 0 && (
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mb: 1 }}>Mã số vân tay người đi kèm</Typography>
                      {companionFingerprints.map((c, i) => (
                        <TextField key={c.id} fullWidth size="small" label={`Vân tay: ${c.name}`} value={c.fingerprintCode}
                          onChange={(e) => { const updated = [...companionFingerprints]; updated[i] = { ...updated[i], fingerprintCode: e.target.value }; setCompanionFingerprints(updated); }}
                          sx={{ mb: 0.75, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", bgcolor: "#f8fafc", borderRadius: "12px", "& fieldset": { borderColor: "#e2e8f0" } } }} />
                      ))}
                    </Box>
                  )}

                  {furnitureList.length > 0 && (
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a", mb: 1 }}>Vật dụng trong phòng</Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {furnitureList.filter(f => selectedFurnitures[f.id]?.checked).map((f) => (
                          <Chip key={f.id} label={`${f.name} (x${selectedFurnitures[f.id].quantity})`}
                            size="small" sx={{ bgcolor: "#f1f5f9", color: "#0f172a", fontWeight: 600, borderRadius: "8px", fontSize: "0.75rem" }} />
                        ))}
                        {!furnitureList.some(f => selectedFurnitures[f.id]?.checked) && (
                          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>Chưa bàn giao vật dụng</Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Box onClick={() => { setEditTenantId(null); }} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
              <Box onClick={handleSaveAll}
                sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, bgcolor: "#2563eb", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#1d4ed8" }, display: "flex", alignItems: "center", gap: 1 }}
              >
                {contractLoading && <CircularProgress size={14} sx={{ color: "#fff" }} />}
                {editTenantId ? "Lưu" : "Thêm"}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Checkout Confirmation Modal */}
      {checkoutConfirm && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(2,6,23,0.6)", backdropFilter: "blur(2px)", p: 2 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", width: "100%", maxWidth: 440, overflow: "hidden" }}>
            <Box sx={{ bgcolor: "#e11d48", px: 3, py: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: "0.9375rem" }}>
                  Xác Nhận Trả Phòng {checkoutConfirm.roomNumber}
                </Typography>
              </Box>
              <IconButton onClick={() => setCheckoutConfirm(null)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </IconButton>
            </Box>
            <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#334155", lineHeight: 1.6 }}>
                Bạn có chắc chắn muốn làm thủ tục <strong>Trả phòng {checkoutConfirm.roomNumber}</strong> cho khách hàng <strong>{checkoutConfirm.tenantName}</strong>?
              </Typography>
              <Box sx={{ p: 2, bgcolor: "#fffbeb", borderRadius: "16px", border: "1px solid #fde68a", fontSize: "0.75rem", color: "#92400e", display: "flex", flexDirection: "column", gap: 1 }}>
                <div><strong>• Kiểm tra công nợ và hoàn trả cọc: {formatCurrency(checkoutConfirm.deposit)}</strong></div>
                <div>• Chuyển trạng thái phòng sang <strong>Còn Trống</strong></div>
                <div>• Tự động dừng gửi thông báo theo lịch</div>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1 }}>
                <Box onClick={() => setCheckoutConfirm(null)} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 700, color: "#475569", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}>Hủy</Box>
                <Box onClick={handleCheckoutConfirm} sx={{ px: 3, py: 1.25, fontSize: "0.75rem", fontWeight: 800, bgcolor: "#e11d48", color: "#fff", borderRadius: "12px", cursor: "pointer", "&:hover": { bgcolor: "#be123c" }, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                  Xác Nhận Trả Phòng
                </Box>
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
