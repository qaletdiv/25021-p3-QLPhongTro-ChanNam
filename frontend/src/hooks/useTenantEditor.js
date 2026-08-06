import { useState } from "react";
import tenantApi from "../api/tenantApi";
import roomApi from "../api/roomApi";
import contractApi from "../api/contractApi";
import furnitureApi from "../api/furnitureApi";
import {
  defaultContractForm, buildExistingFurns, buildDefaultFurns, buildCompanions, buildContractForm,
} from "../utils/contractFormBuilders";

export default function useTenantEditor({ notify, fetchTenants, formState }) {
  const [editTenantId, setEditTenantId] = useState(null);
  const [tenantForm, setTenantForm] = useState({ name: "", phone: "", cccd: "" });

  const {
    paymentDayManuallyChanged, setContractLoading, setEditContractId, setContractForm,
    setCompanionFingerprints, setEmptyRooms, setFurnitureList, setSelectedFurnitures,
    contractForm, editContractId, selectedFurnitures, companionFingerprints,
  } = formState;

  const openEdit = async (tenant) => {
    setEditTenantId(tenant.id);
    setTenantForm({ name: tenant.name, phone: tenant.phone, cccd: tenant.cccd || "" });

    const activeContract = tenant.contracts?.find((c) => c.status === "active");
    if (activeContract) {      try {
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
        setCompanionFingerprints(buildCompanions(tenant.companions));
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

  return { editTenantId, setEditTenantId, tenantForm, setTenantForm, openEdit, handleSaveAll };
}
