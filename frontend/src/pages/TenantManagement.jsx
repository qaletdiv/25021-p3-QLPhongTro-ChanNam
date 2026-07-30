import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import contractTemplateApi from "../api/contractTemplateApi";
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Snackbar, Select, MenuItem, FormControl, InputLabel,
  Chip, TableContainer, Paper, InputAdornment, Grid, Checkbox, FormControlLabel, Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PrintIcon from "@mui/icons-material/Print";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import GroupIcon from "@mui/icons-material/Group";
import tenantApi from "../api/tenantApi";
import roomApi from "../api/roomApi";
import contractApi from "../api/contractApi";
import furnitureApi from "../api/furnitureApi";

export default function TenantManagement() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [expandedRow, setExpandedRow] = useState(null);
  const [openTenant, setOpenTenant] = useState(false);
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

  const openCreateTenant = () => {
    setEditTenantId(null);
    setTenantForm({ name: "", phone: "", cccd: "" });
    setOpenTenant(true);
  };

  const openEditTenant = async (tenant) => {
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
    setOpenTenant(true);
  };

  const handleSaveTenant = async () => {
    try {
      setContractLoading(true);
      if (editTenantId) {
        await tenantApi.update(editTenantId, tenantForm);
      } else {
        await tenantApi.create(tenantForm);
      }
      if (editContractId) {
        const furnitures = Object.entries(selectedFurnitures)
          .filter(([, v]) => v.checked)
          .map(([furnitureId, v]) => ({ furnitureId: Number(furnitureId), quantity: v.quantity }));
        const contractData = {
          ...contractForm, deposit: Number(contractForm.deposit),
          paymentDay: Number(contractForm.paymentDay),
          furnitures, companionFingerprints
        };
        await contractApi.update(editContractId, contractData);
      }
      setSnack({ open: true, message: "Cập nhật thông tin thành công", severity: "success" });
      setOpenTenant(false);
      fetchTenants();
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
      const furnitures = Object.entries(selectedFurnitures)
        .filter(([, v]) => v.checked)
        .map(([furnitureId, v]) => ({ furnitureId: Number(furnitureId), quantity: v.quantity }));
      const data = { ...contractForm, deposit: Number(contractForm.deposit), paymentDay: Number(contractForm.paymentDay), furnitures, companionFingerprints };

      if (editContractId) {
        await contractApi.update(editContractId, data);
        setSnack({ open: true, message: "Cập nhật hợp đồng thành công", severity: "success" });
      } else {
        await contractApi.create(data);
        setSnack({ open: true, message: "Tạo hợp đồng thành công", severity: "success" });
      }
      setOpenContract(false);
      fetchTenants();
    } catch (err) {
      const data = err.response?.data;
      if (data?.error) setSnack({ open: true, message: data.error.map(e => e.msg).join("; "), severity: "error" });
      else setSnack({ open: true, message: data?.message || "Lỗi", severity: "error" });
    } finally { setContractLoading(false); }
  };

  const handleCheckout = async (contractId) => {
    try {
      await contractApi.checkout(contractId);
      setSnack({ open: true, message: "Trả phòng thành công", severity: "success" });
      setCheckoutConfirm(null);
      fetchTenants();
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Loi", severity: "error" });
      setCheckoutConfirm(null);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h4">Quản lý khách thuê & Hợp đồng</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mt: 0.5 }}>Quản lý thông tin khách thuê, hợp đồng và gia hạn.</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <TextField
            size="small" placeholder="Tìm kiếm tên hoặc SĐT..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.75rem" } }}
          />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreateTenant}>Thêm khách mới</Button>
          <Button variant="contained" startIcon={<HowToRegIcon />} onClick={openCreateContract}>Đăng ký phòng</Button>
        </Box>
      </Box>

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Họ tên</TableCell>
                <TableCell>SĐT</TableCell>
                <TableCell>CCCD</TableCell>
                <TableCell>Phòng ở</TableCell>
                <TableCell>Ngày bắt đầu</TableCell>
                <TableCell>Ngày kết thúc</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">In hợp đồng</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => {
                const activeContract = tenant.contracts?.find((c) => c.status === "active");
                const companions = tenant.companions || [];
                const open = expandedRow === tenant.id;
                return (
                  <Fragment key={tenant.id}>
                    <TableRow>
                      <TableCell padding="checkbox">
                        {companions.length > 0 && (
                          <IconButton size="small" onClick={() => setExpandedRow(open ? null : tenant.id)}>
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell>{tenant.name}</TableCell>
                      <TableCell>{tenant.phone}</TableCell>
                      <TableCell>{tenant.cccd || "-"}</TableCell>
                      <TableCell>{activeContract?.room?.room_number || "-"}</TableCell>
                      <TableCell>{activeContract ? new Date(activeContract.startDate).toLocaleDateString("vi-VN") : "-"}</TableCell>
                      <TableCell>{activeContract ? new Date(activeContract.endDate).toLocaleDateString("vi-VN") : "-"}</TableCell>
                      <TableCell>
                        {activeContract ? <Chip label="Đang thuê" color="info" size="small" /> : <Chip label="Chưa thuê" size="small" />}
                        {companions.length > 0 && (
                          <Chip icon={<GroupIcon />} label={companions.length} size="small" variant="outlined" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {activeContract ? (
                          <IconButton
                            onClick={() => window.open(contractTemplateApi.getPdfUrl(activeContract.id), "_blank")}
                            title="In hợp đồng" size="small"
                          >
                            <PrintIcon color="secondary" />
                          </IconButton>
                        ) : "-"}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => openEditTenant(tenant)} title="Sửa thông tin khách & hợp đồng" size="small">
                          <EditIcon color="primary" />
                        </IconButton>
                        {activeContract && (
                          <IconButton onClick={() => setCheckoutConfirm(activeContract.id)} title="Trả phòng" size="small">
                            <ExitToAppIcon color="error" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow key={`${tenant.id}-companions`}>
                      <TableCell colSpan={10} sx={{ py: 0 }}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                          <Box sx={{ px: 6, py: 1.5, bgcolor: "grey.100" }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>Họ tên</TableCell>
                                  <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>Quan hệ</TableCell>
                                  <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>SĐT</TableCell>
                                  <TableCell sx={{ fontWeight: "bold", py: 0.5 }}>CCCD</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {companions.map((c, i) => (
                                  <TableRow key={i}>
                                    <TableCell sx={{ py: 0.5 }}>{c.name}</TableCell>
                                    <TableCell sx={{ py: 0.5 }}>{c.relationship}</TableCell>
                                    <TableCell sx={{ py: 0.5 }}>{c.phone}</TableCell>
                                    <TableCell sx={{ py: 0.5 }}>{c.cccd || "-"}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Tenant Dialog */}
      <Dialog open={openTenant} onClose={() => setOpenTenant(false)} maxWidth={editContractId ? "md" : "sm"} fullWidth>
        <DialogTitle>{editTenantId ? "Sửa thông tin" : "Thêm khách thuê mới"}</DialogTitle>
        <DialogContent>
          {!editTenantId && (
            <FormControl fullWidth sx={{ mt: 2, mb: 1 }}>
              <InputLabel>Chọn từ danh sách</InputLabel>
              <Select label="Chọn từ danh sách" onChange={(e) => {
                const t = tenants.find(t => t.id === e.target.value);
                if (t) setTenantForm({ name: t.name, phone: t.phone, cccd: t.cccd || "" });
              }}>
                <MenuItem value="">-- Nhập thủ công --</MenuItem>
                {tenants.map((t) => <MenuItem key={t.id} value={t.id}>{t.name} - {t.phone}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          <TextField fullWidth label="Họ tên" margin="normal" value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} required />
          <TextField fullWidth label="Số điện thoại" margin="normal" value={tenantForm.phone} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} required />
          <TextField fullWidth label="CCCD" margin="normal" value={tenantForm.cccd} onChange={(e) => setTenantForm({ ...tenantForm, cccd: e.target.value })} />

          {editContractId && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" mt={3} mb={2}>Thông tin hợp đồng</Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <TextField fullWidth label="Tiền cọc (VND)" type="number" value={contractForm.deposit} onChange={(e) => setContractForm({ ...contractForm, deposit: e.target.value })} required />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth label="Ngày bắt đầu" type="date" value={contractForm.startDate} onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })} InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth label="Ngày kết thúc" type="date" value={contractForm.endDate} onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })} InputLabelProps={{ shrink: true }} required />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth label="Ngày thu tiền" type="number" value={contractForm.paymentDay} onChange={(e) => { paymentDayManuallyChanged.current = true; setContractForm({ ...contractForm, paymentDay: e.target.value }); }} inputProps={{ min: 1, max: 31 }} required />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth label="Vân tay (khách chính)" value={contractForm.fingerprintCode} onChange={(e) => setContractForm({ ...contractForm, fingerprintCode: e.target.value })} />
                </Grid>
              </Grid>

              {companionFingerprints.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>Mã số vân tay người đi kèm</Typography>
                  {companionFingerprints.map((c, i) => (
                    <TextField
                      key={c.id} fullWidth size="small" label={`Vân tay: ${c.name}`} value={c.fingerprintCode}
                      onChange={(e) => {
                        const updated = [...companionFingerprints];
                        updated[i] = { ...updated[i], fingerprintCode: e.target.value };
                        setCompanionFingerprints(updated);
                      }}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              )}

              {furnitureList.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" mt={2} mb={1}>Vật dụng trong phòng</Typography>
                  <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                    {furnitureList.map((f) => (
                      <Box key={f.id} display="flex" alignItems="center" gap={2} mb={1}>
                        <FormControlLabel
                          control={<Checkbox checked={selectedFurnitures[f.id]?.checked || false} onChange={(e) => setSelectedFurnitures({ ...selectedFurnitures, [f.id]: { ...selectedFurnitures[f.id], checked: e.target.checked } })} />}
                          label={f.name}
                        />
                        {selectedFurnitures[f.id]?.checked && (
                          <TextField size="small" type="number" label="Số lượng" value={selectedFurnitures[f.id]?.quantity || 1}
                            onChange={(e) => setSelectedFurnitures({ ...selectedFurnitures, [f.id]: { ...selectedFurnitures[f.id], quantity: Number(e.target.value) } })}
                            inputProps={{ min: 1 }} sx={{ width: 100 }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTenant(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveTenant} disabled={contractLoading}>
            {contractLoading ? <CircularProgress size={24} /> : (editTenantId ? "Lưu" : "Thêm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Contract Dialog */}
      <Dialog open={openContract} onClose={() => { setContractForm({ tenantId: "", roomId: "", deposit: "", startDate: "", endDate: "", paymentDay: 5, fingerprintCode: "", furnitures: [] }); setCompanionFingerprints([]); paymentDayManuallyChanged.current = false; setEditContractId(null); setOpenContract(false); }} maxWidth="md" fullWidth>
        <DialogTitle>{editContractId ? "Sửa hợp đồng" : "Đăng ký phòng (Tạo hợp đồng mới)"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 2 }}>
            <Grid item xs={10}>
              <TextField select fullWidth label="Chọn khách thuê" value={contractForm.tenantId} onChange={(e) => {
                const tid = e.target.value;
                setContractForm({ ...contractForm, tenantId: tid });
                const t = tenants.find(t => t.id === tid);
                setCompanionFingerprints(t?.companions?.map(c => ({ id: c.id, name: c.name, fingerprintCode: "" })) || []);
              }} disabled={!!editContractId} required>
                {tenants.map((t) => <MenuItem key={t.id} value={t.id}>{t.name} - {t.phone}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={10}>
              <TextField select fullWidth label="Chọn phòng trống" value={contractForm.roomId} onChange={(e) => {
                const room = emptyRooms.find((r) => r.id === e.target.value);
                setContractForm({ ...contractForm, roomId: e.target.value, paymentDay: paymentDayManuallyChanged.current ? contractForm.paymentDay : (room?.default_payment_day || 5) });
              }} required>
                {emptyRooms.map((r) => <MenuItem key={r.id} value={r.id}>Phòng {r.room_number} - {Number(r.price).toLocaleString("vi-VN")} VND</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Tiền cọc (VND)" type="number" value={contractForm.deposit} onChange={(e) => setContractForm({ ...contractForm, deposit: e.target.value })} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Ngày bắt đầu" type="date" value={contractForm.startDate} onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Ngày kết thúc" type="date" value={contractForm.endDate} onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Ngày thu tiền" type="number" value={contractForm.paymentDay} onChange={(e) => { paymentDayManuallyChanged.current = true; setContractForm({ ...contractForm, paymentDay: e.target.value }); }} inputProps={{ min: 1, max: 31 }} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Vân tay (khách chính)" value={contractForm.fingerprintCode} onChange={(e) => setContractForm({ ...contractForm, fingerprintCode: e.target.value })} />
            </Grid>
          </Grid>

          {companionFingerprints.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>Mã số vân tay người đi kèm</Typography>
              {companionFingerprints.map((c, i) => (
                <TextField
                  key={c.id}
                  fullWidth size="small" label={`Vân tay: ${c.name}`} value={c.fingerprintCode}
                  onChange={(e) => {
                    const updated = [...companionFingerprints];
                    updated[i] = { ...updated[i], fingerprintCode: e.target.value };
                    setCompanionFingerprints(updated);
                  }}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          )}

          <Typography variant="subtitle1" fontWeight="bold" mt={2} mb={1}>Vật dụng trong phòng</Typography>
          <Box sx={{ maxHeight: 240, overflow: "auto" }}>
          {furnitureList.map((f) => (
            <Box key={f.id} display="flex" alignItems="center" gap={2} mb={1}>
              <FormControlLabel
                control={<Checkbox checked={selectedFurnitures[f.id]?.checked || false} onChange={(e) => setSelectedFurnitures({ ...selectedFurnitures, [f.id]: { ...selectedFurnitures[f.id], checked: e.target.checked } })} />}
                label={f.name}
              />
              {selectedFurnitures[f.id]?.checked && (
                <TextField
                  size="small" type="number" label="Số lượng" value={selectedFurnitures[f.id]?.quantity || 1}
                  onChange={(e) => setSelectedFurnitures({ ...selectedFurnitures, [f.id]: { ...selectedFurnitures[f.id], quantity: Number(e.target.value) } })}
                  inputProps={{ min: 1 }} sx={{ width: 100 }}
                />
              )}
            </Box>
          ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContract(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveContract} disabled={contractLoading}>{contractLoading ? <CircularProgress size={24} /> : (editContractId ? "Lưu" : "Tạo hợp đồng")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={checkoutConfirm !== null} onClose={() => setCheckoutConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận trả phòng</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn tiến hành trả phòng cho khách thuê này?</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>Hợp đồng sẽ kết thúc và phòng chuyển sang trạng thái trống.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutConfirm(null)}>Không</Button>
          <Button variant="contained" color="error" onClick={() => handleCheckout(checkoutConfirm)}>Đồng ý, trả phòng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
