"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, TextField, CircularProgress, InputAdornment, Select, MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import MessageDialog from "../components/MessageDialog";
import TenantTable from "../components/tenant/TenantTable";
import ContractModal from "../components/tenant/ContractModal";
import TenantEditModal from "../components/tenant/TenantEditModal";
import CheckoutConfirmModal from "../components/tenant/CheckoutConfirmModal";
import contractTemplateApi from "../api/contractTemplateApi";
import tenantApi from "../api/tenantApi";
import roomApi from "../api/roomApi";
import contractApi from "../api/contractApi";
import furnitureApi from "../api/furnitureApi";

export default function TenantManagement() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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

  const filteredTenants = tenants.filter((tenant) => {
    const active = tenant.contracts?.find((c) => c.status === "active");
    if (statusFilter === "renting" && !active) return false;
    if (statusFilter === "ended" && active) return false;
    if (dateFrom || dateTo) {
      const latest = active || [...(tenant.contracts || [])].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
      if (!latest) return false;
      const start = new Date(latest.startDate);
      const end = new Date(latest.endDate);
      if (dateFrom && end < new Date(dateFrom)) return false;
      if (dateTo && start > new Date(dateTo)) return false;
    }
    return true;
  });

  const openEdit = async (tenant) => {
    setEditTenantId(tenant.id);
    setTenantForm({ name: tenant.name, phone: tenant.phone, cccd: tenant.cccd || "" });

    const activeContract = tenant.contracts?.find((c) => c.status === "active");
    if (activeContract) {
      try {
        const [furnRes, contractRes, roomsRes] = await Promise.all([
          furnitureApi.getAll(),
          contractApi.getById(activeContract.id),
          roomApi.getAll(),
        ]);
        const contract = contractRes.data.contract;
        setFurnitureList(furnRes.data.furnitures);
        const existingFurns = {};
        furnRes.data.furnitures.forEach((f) => {
          const ef = contract.contractFurnitures?.find(cf => cf.furnitureId === f.id);
          existingFurns[f.id] = { checked: !!ef, quantity: ef ? ef.quantity : f.default_quantity };
        });
        setSelectedFurnitures(existingFurns);

        const allRooms = roomsRes.data.rooms;
        setEmptyRooms(allRooms.filter(r => r.status === 'empty' || r.id === activeContract.roomId));

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
      try {
        const [roomsRes, furnRes] = await Promise.all([roomApi.getAll(), furnitureApi.getAll()]);
        setEmptyRooms(roomsRes.data.rooms.filter(r => r.status === 'empty'));
        setFurnitureList(furnRes.data.furnitures);
        const defaultFurns = {};
        furnRes.data.furnitures.forEach((f) => { defaultFurns[f.id] = { checked: false, quantity: f.default_quantity }; });
        setSelectedFurnitures(defaultFurns);
        setContractForm({
          tenantId: tenant.id, roomId: "", deposit: "", startDate: "", endDate: "",
          paymentDay: 5, fingerprintCode: "", furnitures: [],
        });
        setCompanionFingerprints([]);
        paymentDayManuallyChanged.current = false;
      } catch {
        setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" });
      }
      setEditContractId(null);
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
          companionFingerprints, roomId: contractForm.roomId
        };
        await contractApi.update(editContractId, contractData);
      } else if (contractForm.roomId) {
        const furnitures = Object.entries(selectedFurnitures)
          .filter(([, v]) => v.checked)
          .map(([furnitureId, v]) => ({ furnitureId: Number(furnitureId), quantity: v.quantity }));
        await contractApi.create({
          ...contractForm, deposit: Number(contractForm.deposit),
          paymentDay: Number(contractForm.paymentDay),
          furnitures, companionFingerprints
        });
      }
      setEditTenantId(null);
      setEditContractId(null);
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
      const [roomsRes, furnRes] = await Promise.all([roomApi.getAll(), furnitureApi.getAll()]);
      setEmptyRooms(roomsRes.data.rooms.filter(r => r.status === 'empty' || r.id === contract.roomId));
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

  const openCheckoutConfirm = (tenant) => {
    const ac = tenant.contracts?.find(c => c.status === "active");
    setCheckoutConfirm(ac ? { ...ac, roomNumber: ac.room?.room_number, tenantName: tenant.name } : null);
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
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94a3b8", fontSize: 16 }} /></InputAdornment> } }}
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

      {/* Filter bar */}
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>Trạng thái thuê</Typography>
        <Select
          size="small" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { fontSize: "0.75rem" }, "& .MuiSelect-select": { fontSize: "0.75rem", py: 1 }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" } }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="renting">Đang Thuê</MenuItem>
          <MenuItem value="ended">Hết Thuê</MenuItem>
        </Select>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", ml: 1 }}>Thời gian</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small" type="date" value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            label="Từ ngày" slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "12px", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
          />
          <TextField
            size="small" type="date" value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            label="Đến ngày" slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150, "& .MuiOutlinedInput-root": { fontSize: "0.75rem", borderRadius: "12px", bgcolor: "#f8fafc", "& fieldset": { borderColor: "#e2e8f0" } } }}
          />
          {(dateFrom || dateTo) && (
            <Box onClick={() => { setDateFrom(""); setDateTo(""); }}
              sx={{ px: 1.5, py: 1, fontSize: "0.6875rem", fontWeight: 700, color: "#e11d48", borderRadius: "8px", cursor: "pointer", "&:hover": { bgcolor: "#ffe4e6" } }}
            >Xóa lọc ngày</Box>
          )}
        </Box>
      </Box>

      {loading ? <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box> : (
        <TenantTable
          tenants={filteredTenants}
          onEdit={openEdit}
          onCheckout={openCheckoutConfirm}
          onPrint={(id) => window.open(contractTemplateApi.getPdfUrl(id), "_blank")}
        />
      )}

      <ContractModal
        open={openContract}
        editContractId={editContractId}
        tenants={tenants}
        emptyRooms={emptyRooms}
        contractForm={contractForm} setContractForm={setContractForm}
        companionFingerprints={companionFingerprints} setCompanionFingerprints={setCompanionFingerprints}
        furnitureList={furnitureList} selectedFurnitures={selectedFurnitures} setSelectedFurnitures={setSelectedFurnitures}
        paymentDayManuallyChanged={paymentDayManuallyChanged}
        contractLoading={contractLoading}
        onClose={() => setOpenContract(false)}
        onSave={handleSaveContract}
      />

      <TenantEditModal
        editTenantId={editTenantId} editContractId={editContractId}
        tenants={tenants}
        tenantForm={tenantForm} setTenantForm={setTenantForm}
        emptyRooms={emptyRooms} contractForm={contractForm} setContractForm={setContractForm}
        companionFingerprints={companionFingerprints} setCompanionFingerprints={setCompanionFingerprints}
        furnitureList={furnitureList} selectedFurnitures={selectedFurnitures} setSelectedFurnitures={setSelectedFurnitures}
        paymentDayManuallyChanged={paymentDayManuallyChanged}
        contractLoading={contractLoading}
        openContract={openContract}
        onClose={() => setEditTenantId(null)}
        onSave={handleSaveAll}
      />

      <CheckoutConfirmModal
        checkoutConfirm={checkoutConfirm}
        onClose={() => setCheckoutConfirm(null)}
        onConfirm={handleCheckoutConfirm}
      />

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
