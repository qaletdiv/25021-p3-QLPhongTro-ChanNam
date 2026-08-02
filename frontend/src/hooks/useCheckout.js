import { useState } from "react";
import contractApi from "../api/contractApi";

export default function useCheckout({ notify, fetchTenants }) {
  const [checkoutConfirm, setCheckoutConfirm] = useState(null);

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

  return { checkoutConfirm, setCheckoutConfirm, openCheckoutConfirm, handleCheckoutConfirm };
}
