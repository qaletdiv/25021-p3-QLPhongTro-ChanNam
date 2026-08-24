"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import MessageDialog from "../components/MessageDialog";
import MeterInvoiceTab from "../components/tenant/MeterInvoiceTab";
import InvoiceHistoryTable from "../components/tenant/InvoiceHistoryTable";
import NewTenantTab from "../components/tenant/NewTenantTab";
import TenantPageHeader from "../components/tenant/TenantPageHeader";
import tenantInvoiceApi from "../api/tenantInvoiceApi";
import { resizeImage } from "../utils/image";
import { nextMonthLabel, nextMonthOf, formatCurrency } from "../utils/format";
import { tokens as t } from "../design/tokens";

export default function TenantInvoices({ initialInvoices = [], initialSettings = null }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [elecVal, setElecVal] = useState(0);
  const [waterVal, setWaterVal] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [elecPhoto, setElecPhoto] = useState("");
  const [waterPhoto, setWaterPhoto] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    return Promise.all([
      tenantInvoiceApi.getInvoices(),
      tenantInvoiceApi.getInvoiceSettings(),
    ])
      .then(([invRes, setRes]) => {
        setInvoices(invRes.data.invoices);
        setSettings(setRes.data);
        setElecVal(0);
        setWaterVal(0);
      })
      .catch(() => setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  // Dữ liệu ban đầu được fetch server-side; loadData chỉ dùng sau khi gửi chỉ số

  const lastInv = invoices.length > 0 ? invoices[0] : null;
  const formMonth = lastInv ? nextMonthOf(lastInv.month) : nextMonthLabel();
  const baseContract = settings?.contract;
  // Improved logic: new tenant if no invoices exist AND there's an active contract
  // This helps distinguish "new tenant starting fresh" vs "existing tenant with no recent invoices"
  const hasActiveContract = baseContract && baseContract.status === "active";
  const isNewTenant = invoices.length === 0 && hasActiveContract;

  const contract = {
    lastElectricity: lastInv ? Number(lastInv.electricityNew) || 0 : (baseContract ? Number(baseContract.initialElectricity) || 0 : 0),
    lastWater: lastInv ? Number(lastInv.waterNew) || 0 : (baseContract ? Number(baseContract.initialWater) || 0 : 0),
  };
  const room = settings?.room;
  const s = settings?.settings || {};
  const electricityRate = Number(s.electricityRate) || 3500;
  const waterRate = Number(s.waterRate) || 15000;
  const serviceFee = s.serviceFee !== undefined && s.serviceFee !== "" ? Number(s.serviceFee) || 0 : 0;
  const roomPrice = Number(settings?.roomPrice || 0) || 3200000;

  const calcElecUsage = Math.max(0, elecVal - (contract?.lastElectricity || 0));
  const calcWaterUsage = Math.max(0, waterVal - (contract?.lastWater || 0));
  const calcElecAmount = calcElecUsage * electricityRate;
  const calcWaterAmount = calcWaterUsage * waterRate;
  const calcTotal = roomPrice + calcElecAmount + calcWaterAmount + serviceFee;

  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      if (type === "electricity") setElecPhoto(resized);
      else setWaterPhoto(resized);
    } catch {
      setWarningMsg("Không đọc được ảnh, vui lòng thử lại");
    } finally {
      e.target.value = "";
    }
  };

  const handleMeterSubmit = async (e) => {
    e.preventDefault();
    setWarningMsg("");
    setSubmitSuccess("");
    if (elecVal < 0 || waterVal < 0) {
      setWarningMsg("⚠ Chỉ số không được nhập số âm.");
      return;
    }
    if (elecVal < (contract?.lastElectricity || 0)) {
      setWarningMsg("⚠ Chỉ số điện mới nhỏ hơn chỉ số cũ!");
      return;
    }
    if (waterVal < (contract?.lastWater || 0)) {
      setWarningMsg("⚠ Chỉ số nước mới nhỏ hơn chỉ số cũ!");
      return;
    }
    if (!elecPhoto || !waterPhoto) {
      setWarningMsg("⚠ Vui lòng chụp ảnh đồng hồ điện và nước làm bằng chứng!");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmPaidSubmit = async (paid) => {
    setConfirmOpen(false);
    if (!paid) {
      setWarningMsg("⚠ Vui lòng quét mã QR và thanh toán đúng số tiền trên hóa đơn trước khi gửi!");
      return;
    }
    try {
      setSubmitting(true);
      await tenantInvoiceApi.submitMeter({
        electricity: elecVal,
        water: waterVal,
        electricityPhoto: elecPhoto,
        waterPhoto: waterPhoto,
      });
      setSubmitSuccess("Đã gửi chỉ số thành công! Hóa đơn đã được chốt.");
      setElecPhoto("");
      setWaterPhoto("");
      await loadData();
    } catch (err) {
      setWarningMsg(err.response?.data?.message || "Gửi thất bại, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveInitial = async (payload) => {
    await tenantInvoiceApi.saveInitialReadings(payload);
    setSnack({ open: true, message: "Đã lưu chỉ số ban đầu thành công", severity: "success" });
    await loadData();
  };

  const getVietQRContent = () => {
    return `Thanh toan phong ${room?.room_number || ""} thang ${formMonth}`;
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <TenantPageHeader
        eyebrow="Hóa Đơn & Chỉ Số"
        title="Hóa đơn của tôi"
        subtitle="Quản lý chỉ số điện nước và theo dõi hóa đơn hàng tháng"
      />

      {isNewTenant ? (
        <NewTenantTab
          settings={settings}
          roomPrice={roomPrice}
          roomNumber={baseContract?.room?.room_number}
          onSaveMeter={handleSaveInitial}
        />
      ) : (
        <MeterInvoiceTab
          contract={contract} settings={settings} monthStr={formMonth}
          elecVal={elecVal} setElecVal={setElecVal} waterVal={waterVal} setWaterVal={setWaterVal}
          warningMsg={warningMsg} submitSuccess={submitSuccess}
          calcElecUsage={calcElecUsage} calcWaterUsage={calcWaterUsage}
          calcElecAmount={calcElecAmount} calcWaterAmount={calcWaterAmount} calcTotal={calcTotal}
          electricityRate={electricityRate} waterRate={waterRate} roomPrice={roomPrice} serviceFee={serviceFee}
          handlePhotoUpload={handlePhotoUpload} handleMeterSubmit={handleMeterSubmit}
          getVietQRContent={getVietQRContent}
          submitting={submitting} elecPhoto={elecPhoto} waterPhoto={waterPhoto}
        />
      )}

      {!isNewTenant && (
        <Box sx={{ mt: 4 }}>
          <InvoiceHistoryTable invoices={invoices} />
        </Box>
      )}

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", color: "#0f172a", fontWeight: 700, fontSize: "1rem" }}>
          Bạn đã thanh toán chưa?
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", color: "#475569", fontSize: "0.875rem", lineHeight: 1.6 }}>
          Vui lòng quét mã QR và chuyển khoản đúng số tiền{" "}
          <Box component="span" sx={{ fontWeight: 700, color: t.colors.accent }}>{formatCurrency(calcTotal)}</Box> trước khi
          gửi chỉ số. Sau khi gửi, hóa đơn sẽ được chốt.
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2.5 }}>
          <Button color="inherit" sx={{ borderRadius: "10px", fontWeight: 700, color: "#64748b" }} onClick={() => confirmPaidSubmit(false)}>
            Chưa thanh toán
          </Button>
          <Button variant="contained" color="success" sx={{ borderRadius: "10px", fontWeight: 700 }} onClick={() => confirmPaidSubmit(true)}>
            Đã thanh toán
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
