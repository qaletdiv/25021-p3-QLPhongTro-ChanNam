import roomApi from "../api/roomApi";
import contractApi from "../api/contractApi";
import furnitureApi from "../api/furnitureApi";
import {
  defaultContractForm, buildExistingFurns, buildDefaultFurns, buildCompanions, buildContractForm,
} from "../utils/contractFormBuilders";

export default function useContractEditor({ notify, fetchTenants, formState }) {
  const {
    paymentDayManuallyChanged, setContractLoading, setOpenContract, setEditContractId,
    setContractForm, setCompanionFingerprints, setEmptyRooms, setFurnitureList, setSelectedFurnitures,
    contractForm, editContractId, selectedFurnitures, companionFingerprints,
  } = formState;

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

  return { openCreateContract, openEditContract, handleSaveContract };
}
