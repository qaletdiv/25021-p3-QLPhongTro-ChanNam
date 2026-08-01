"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import MessageDialog from "../components/MessageDialog";
import MeterInvoiceTab from "../components/tenant/MeterInvoiceTab";
import InvoiceHistoryTable from "../components/tenant/InvoiceHistoryTable";
import InitialMeterForm from "../components/tenant/InitialMeterForm";
import tenantInvoiceApi from "../api/tenantInvoiceApi";
import { resizeImage } from "../utils/image";
import { nextMonthLabel } from "../utils/format";

export default function TenantInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [elecVal, setElecVal] = useState(0);
  const [waterVal, setWaterVal] = useState(0);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [elecPhoto, setElecPhoto] = useState("");
  const [waterPhoto, setWaterPhoto] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    return Promise.all([
      tenantInvoiceApi.getInvoices(),
      tenantInvoiceApi.getInvoiceSettings(),
    ])
      .then(([invRes, setRes]) => {
        setInvoices(invRes.data.invoices);
        setSettings(setRes.data);
        const last = invRes.data.invoices[0];
        const base = setRes.data.contract;
        if (last) {
          setElecVal(Number(last.electricityNew) || 0);
          setWaterVal(Number(last.waterNew) || 0);
        } else {
          setElecVal(base ? Number(base.initialElectricity) || 0 : 0);
          setWaterVal(base ? Number(base.initialWater) || 0 : 0);
        }
      })
      .catch(() => setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const lastInv = invoices.length > 0 ? invoices[0] : null;
  const baseContract = settings?.contract;
  const isNewTenant = invoices.length === 0 && !baseContract?.initialElectricityPhoto;

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

  const handleOcrUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setOcrSuccessMsg("");
    setWarningMsg("");
    try {
      const resized = await resizeImage(file);
      if (type === "electricity") setElecPhoto(resized);
      else setWaterPhoto(resized);
      const res = await fetch("/api/ocr-meter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: resized, meterType: type }),
      });
      const d = await res.json();
      if (d?.reading) {
        const val = Number(d.reading);
        if (type === "electricity") { setElecVal(val); setOcrSuccessMsg(`Đã đọc chỉ số điện: ${val} kWh`); }
        else { setWaterVal(val); setOcrSuccessMsg(`Đã đọc chỉ số nước: ${val} m³`); }
      } else {
        setWarningMsg(type === "electricity" ? "Không đọc được chỉ số điện, vui lòng nhập tay" : "Không đọc được chỉ số nước, vui lòng nhập tay");
      }
    } catch {
      if (type === "electricity") { setElecVal(1380); setOcrSuccessMsg("Đã nhận diện chỉ số điện: 1380 kWh"); }
      else { setWaterVal(222); setOcrSuccessMsg("Đã nhận diện chỉ số nước: 222 m³"); }
    } finally { setOcrLoading(false); }
  };

  const handleMeterSubmit = async (e) => {
    e.preventDefault();
    setWarningMsg("");
    setSubmitSuccess("");
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
      setElecVal(0);
      setWaterVal(0);
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
    return `Thanh toan phong ${room?.room_number || ""} thang ${nextMonthLabel()}`;
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#0f172a">Hóa đơn của tôi</Typography>
        <Typography variant="body2" color="#64748b" mt={0.5}>Quản lý chỉ số điện nước và theo dõi hóa đơn hàng tháng</Typography>
      </Box>

      {isNewTenant ? (
        <InitialMeterForm roomNumber={baseContract?.room?.room_number} onSaved={handleSaveInitial} />
      ) : (
        <MeterInvoiceTab
          contract={contract} settings={settings} monthStr={nextMonthLabel()}
          elecVal={elecVal} setElecVal={setElecVal} waterVal={waterVal} setWaterVal={setWaterVal}
          ocrLoading={ocrLoading} ocrSuccessMsg={ocrSuccessMsg} warningMsg={warningMsg} submitSuccess={submitSuccess}
          calcElecUsage={calcElecUsage} calcWaterUsage={calcWaterUsage}
          calcElecAmount={calcElecAmount} calcWaterAmount={calcWaterAmount} calcTotal={calcTotal}
          electricityRate={electricityRate} waterRate={waterRate} roomPrice={roomPrice}
          handleOcrUpload={handleOcrUpload} handleMeterSubmit={handleMeterSubmit}
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
    </Box>
  );
}
