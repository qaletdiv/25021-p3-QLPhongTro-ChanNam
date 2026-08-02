import { useState, useRef } from "react";
import tenantApi from "../api/tenantApi";
import roomApi from "../api/roomApi";
import contractApi from "../api/contractApi";
import furnitureApi from "../api/furnitureApi";

const defaultContractForm = {
  tenantId: "", roomId: "", deposit: "", price: "", startDate: "", endDate: "",
  paymentDay: 5, fingerprintCode: "", furnitures: [],
};

function buildExistingFurns(furnitures, contract) {
  const existing = {};
  furnitures.forEach((f) => {
    const ef = contract.contractFurnitures?.find(cf => cf.furnitureId === f.id);
    existing[f.id] = { checked: !!ef, quantity: ef ? ef.quantity : f.default_quantity };
  });
  return existing;
}

function buildDefaultFurns(furnitures) {
  const defaults = {};
  furnitures.forEach((f) => { defaults[f.id] = { checked: false, quantity: f.default_quantity }; });
  return defaults;
}

function buildCompanions(companions) {
  return (companions || []).map(c => ({ id: c.id, name: c.name, fingerprintCode: c.fingerprintCode || "" }));
}

function buildContractForm(contract, tenantId) {
  return {
    tenantId, roomId: contract.roomId,
    deposit: contract.deposit,
    price: contract.price,
    startDate: contract.startDate?.split("T")[0] || contract.startDate,
    endDate: contract.endDate?.split("T")[0] || contract.endDate,
    paymentDay: contract.paymentDay,
    fingerprintCode: contract.fingerprintCode || "", furnitures: [],
  };
}

export default function useContractEditor({ notify, fetchTenants }) {
  const [editTenantId, setEditTenantId] = useState(null);
  const [tenantForm, setTenantForm] = useState({ name: "", phone: "", cccd: "" });
  const [checkoutConfirm, setCheckoutConfirm] = useState(null);
  const paymentDayManuallyChanged = useRef(false);

  const [contractLoading, setContractLoading] = useState(false);
  const [openContract, setOpenContract] = useState(false);
  const [editContractId, setEditContractId] = useState(null);
  const [contractForm, setContractForm] = useState(defaultContractForm);
  const [companionFingerprints, setCompanionFingerprints] = useState([]);
  const [emptyRooms, setEmptyRooms] = useState([]);
  const [furnitureList, setFurnitureList] = useState([]);
  const [selectedFurnitures, setSelectedFurnitures] = useState({});

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
        setSelectedFurnitures(buildExistingFurns(furnRes.data.furnitures, contract));

        const allRooms = roomsRes.data.rooms;
        setEmptyRooms(allRooms.filter(r => r.status === 'empty' || r.id === activeContract.roomId));

        setContractForm(buildContractForm(contract, tenant.id));
        setCompanionFingerprints(buildCompanions(contract.companions));
        setEditContractId(contract.id);
        paymentDayManuallyChanged.current = true;
      } catch {
        notify("Lỗi tải thông tin hợp đồng", "error");
      }
    } else {
      try {
        const [roomsRes, furnRes] = await Promise.all([roomApi.getAll(), furnitureApi.getAll()]);
        setEmptyRooms(roomsRes.data.rooms.filter(r => r.status === 'empty'));
        setFurnitureList(furnRes.data.furnitures);
        setSelectedFurnitures(buildDefaultFurns(furnRes.data.furnitures));
        setContractForm({ ...defaultContractForm, tenantId: tenant.id });
        setCompanionFingerprints([]);
        paymentDayManuallyChanged.current = false;
      } catch {
        notify("Lỗi tải dữ liệu", "error");
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
          price: Number(contractForm.price),
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
          price: Number(contractForm.price),
          paymentDay: Number(contractForm.paymentDay),
          furnitures, companionFingerprints
        });
      }
      setEditTenantId(null);
      setEditContractId(null);
      fetchTenants();
      setTimeout(() => notify("Cập nhật thông tin thành công", "success"), 300);
    } catch (err) {
      notify(err.response?.data?.message || "Lỗi", "error");
    } finally { setContractLoading(false); }
  };

  const openCreateContract = async () => {
    try {
      const [roomsRes, furnRes] = await Promise.all([roomApi.getAll("empty"), furnitureApi.getAll()]);
      setEmptyRooms(roomsRes.data.rooms);
      setFurnitureList(furnRes.data.furnitures);
      setSelectedFurnitures(buildDefaultFurns(furnRes.data.furnitures));
      setContractForm({ ...defaultContractForm });
      setCompanionFingerprints([]);
      paymentDayManuallyChanged.current = false;
      setEditContractId(null);
      setOpenContract(true);
    } catch {
      notify("Lỗi tải dữ liệu", "error");
    }
  };

  const openEditContract = async (contractId, tenant) => {
    try {
      const res = await contractApi.getById(contractId);
      const contract = res.data.contract;
      const [roomsRes, furnRes] = await Promise.all([roomApi.getAll(), furnitureApi.getAll()]);
      setEmptyRooms(roomsRes.data.rooms.filter(r => r.status === 'empty' || r.id === contract.roomId));
      setFurnitureList(furnRes.data.furnitures);
      setSelectedFurnitures(buildExistingFurns(furnRes.data.furnitures, contract));
      setContractForm(buildContractForm(contract, contract.tenantId));
      setCompanionFingerprints(buildCompanions(contract.companions));
      paymentDayManuallyChanged.current = true;
      setEditContractId(contract.id);
      setOpenContract(true);
    } catch {
      notify("Lỗi tải thông tin hợp đồng", "error");
    }
  };

  const handleSaveContract = async () => {
    if (contractForm.deposit === "") {
      notify("Vui lòng nhập tiền cọc", "warning");
      return;
    }
    if (contractForm.startDate && contractForm.endDate && new Date(contractForm.startDate) >= new Date(contractForm.endDate)) {
      notify("Ngày kết thúc phải sau ngày bắt đầu", "warning");
      return;
    }
    try {
      setContractLoading(true);
      const data = { ...contractForm, deposit: Number(contractForm.deposit), price: Number(contractForm.price), paymentDay: Number(contractForm.paymentDay), companionFingerprints };

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
      setTimeout(() => notify(editContractId ? "Cập nhật hợp đồng thành công" : "Tạo hợp đồng thành công", "success"), 300);
      fetchTenants();
    } catch (err) {
      const data = err.response?.data;
      if (data?.error) notify(data.error.map(e => e.msg).join("; "), "error");
      else notify(data?.message || "Lỗi", "error");
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
      setTimeout(() => notify("Trả phòng thành công", "success"), 300);
    } catch (err) {
      notify(err.response?.data?.message || "Lỗi", "error");
      setCheckoutConfirm(null);
    }
  };

  return {
    editTenantId, setEditTenantId, tenantForm, setTenantForm,
    checkoutConfirm, setCheckoutConfirm,
    contractLoading, openContract, setOpenContract, editContractId, setEditContractId,
    contractForm, setContractForm, companionFingerprints, setCompanionFingerprints,
    emptyRooms, furnitureList, selectedFurnitures, setSelectedFurnitures,
    paymentDayManuallyChanged,
    openEdit, handleSaveAll, openCreateContract, openEditContract, handleSaveContract,
    openCheckoutConfirm, handleCheckoutConfirm,
  };
}
