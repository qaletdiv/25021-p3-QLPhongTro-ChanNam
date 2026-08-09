import { useState } from "react";
import contractApi from "../api/contractApi";

export default function useCheckout({ notify, fetchTenants }) {
  const [checkoutSelect, setCheckoutSelect] = useState(null);
  const [checkoutConfirm, setCheckoutConfirm] = useState(null);

  const openCheckoutConfirm = (tenant) => {
    const ac = tenant.contracts?.find(c => c.status === "active");
    const activeCompanions = (tenant.companions || []).filter(c => c.status !== "ended");
    const base = { ...(ac || {}), roomNumber: ac?.room?.room_number, tenantName: tenant.name, contractId: ac?.id, activeCompanions };
    if (activeCompanions.length === 0) {
      setCheckoutConfirm({ ...base, promoteCompanionId: null, promoteName: null });
      return;
    }
    setCheckoutSelect(base);
  };

  const handleSelectionConfirm = (leavingIds) => {
    const mainLeaves = leavingIds.includes("main");
    const staying = (checkoutSelect.activeCompanions || []).filter(c => !leavingIds.includes(c.id));
    const removedIds = (checkoutSelect.activeCompanions || []).filter(c => leavingIds.includes(c.id)).map(c => c.id);
    if (mainLeaves) {
      if (staying.length > 0) {
        setCheckoutConfirm({ ...checkoutSelect, promoteCompanionId: staying[0].id, promoteName: staying[0].name, stayingCount: staying.length });
        setCheckoutSelect(null);
      } else {
        handleCheckout(checkoutSelect.id);
      }
    } else {
      if (removedIds.length === 0) return;
      handleExistingRemove(removedIds);
    }
  };

  const handleExistingRemove = async (removedIds) => {
    try {
      await contractApi.checkout(checkoutSelect.id, { removedCompanionIds: removedIds });
      setCheckoutConfirm(null);
      setCheckoutSelect(null);
      fetchTenants();
      setTimeout(() => notify("Người đi kèm đã rời phòng", "success"), 300);
    } catch (err) {
      notify(err.response?.data?.message || "Lỗi", "error");
      setCheckoutConfirm(null);
      setCheckoutSelect(null);
    }
  };

  const handleCheckoutConfirm = () => {
    if (!checkoutConfirm) return;
    handleCheckout(checkoutConfirm.id || checkoutConfirm.accountId, checkoutConfirm.promoteCompanionId);
  };

  const handleCheckout = async (contractId, promoteCompanionId) => {
    try {
      await contractApi.checkout(contractId, { promoteCompanionId });
      setCheckoutConfirm(null);
      setCheckoutSelect(null);
      fetchTenants();
      setTimeout(() => notify("Trả phòng thành công", "success"), 300);
    } catch (err) {
      notify(err.response?.data?.message || "Lỗi", "error");
      setCheckoutConfirm(null);
      setCheckoutSelect(null);
    }
  };

  return { checkoutSelect, setCheckoutSelect, checkoutConfirm, setCheckoutConfirm, openCheckoutConfirm, handleSelectionConfirm, handleCheckoutConfirm };
}