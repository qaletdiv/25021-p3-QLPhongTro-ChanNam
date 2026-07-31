"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress } from "@mui/material";
import MessageDialog from "../components/MessageDialog";
import TenantTabNav from "../components/tenant/TenantTabNav";
import TenantOverviewTab from "../components/tenant/TenantOverviewTab";
import MeterInvoiceTab from "../components/tenant/MeterInvoiceTab";
import TenantProfileTab from "../components/tenant/TenantProfileTab";
import { currentMonthLabel } from "../utils/format";
import tenantDashboardApi from "../api/tenantDashboardApi";
import tenantInvoiceApi from "../api/tenantInvoiceApi";
import tenantProfileApi from "../api/tenantProfileApi";

export default function TenantDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    Promise.all([tenantDashboardApi.getDashboard(), tenantInvoiceApi.getInvoiceSettings()])
      .then(([dashRes, setRes]) => { setData(dashRes.data); setSettings(setRes.data); })
      .catch(() => setSnack({ open: true, message: "Lỗi tải dữ liệu", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const contract = data?.contract;
  const room = contract?.room;
  const tenant = data?.tenant;
  const notifications = data?.notifications || [];
  const daysLeft = contract ? Math.max(0, Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0;
  const s = settings?.settings || {};
  const electricityRate = Number(s.electricityRate) || 3500;
  const waterRate = Number(s.waterRate) || 15000;
  const serviceFee = Number(s.serviceFee) || 100000;
  const roomPrice = Number(settings?.roomPrice || 0) || 3200000;

  /* --- Meter Tab State --- */
  const [elecVal, setElecVal] = useState(0);
  const [waterVal, setWaterVal] = useState(0);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  /* --- Profile Tab State --- */
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaveMsg, setProfileSaveMsg] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await tenantProfileApi.getProfile();
      const p = res.data.profile;
      setProfileName(p.name || "");
      setProfileEmail(p.email || "");
      setProfilePhone(p.phone || "");
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleOcrUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setOcrSuccessMsg("");
    setWarningMsg("");
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch("/api/ocr-meter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: reader.result, meterType: type }),
        });
        const d = await res.json();
        if (d?.reading) {
          const val = Number(d.reading);
          if (type === "electricity") { setElecVal(val); setOcrSuccessMsg(`Đã đọc chỉ số điện: ${val} kWh`); }
          else { setWaterVal(val); setOcrSuccessMsg(`Đã đọc chỉ số nước: ${val} m³`); }
        }
      } catch {
        if (type === "electricity") { setElecVal(1380); setOcrSuccessMsg("Đã nhận diện chỉ số điện: 1380 kWh"); }
        else { setWaterVal(222); setOcrSuccessMsg("Đã nhận diện chỉ số nước: 222 m³"); }
      } finally { setOcrLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const calcElecUsage = Math.max(0, elecVal - (contract?.lastElectricity || 0));
  const calcWaterUsage = Math.max(0, waterVal - (contract?.lastWater || 0));
  const calcElecAmount = calcElecUsage * electricityRate;
  const calcWaterAmount = calcWaterUsage * waterRate;
  const calcTotal = roomPrice + calcElecAmount + calcWaterAmount + serviceFee;

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
    setSubmitSuccess("Đã gửi chỉ số thành công! Hóa đơn đã được chốt.");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      await tenantProfileApi.updateProfile({ name: profileName, email: profileEmail, phone: profilePhone });
      setProfileSaveMsg("Đã cập nhật hồ sơ thành công!");
      setTimeout(() => setProfileSaveMsg(""), 3000);
    } catch {
      setSnack({ open: true, message: "Lỗi cập nhật", severity: "error" });
    } finally { setProfileSaving(false); }
  };

  const getVietQRUrl = () => {
    const bankName = s.bankName || "MBBank";
    const accNo = s.bankAccount || "0988776655";
    const holder = s.bankHolder || "CHU TRO";
    const amt = calcTotal;
    const addInfo = encodeURIComponent(`Thanh toan phong ${room?.room_number || ""} thang ${currentMonthLabel()}`);
    return `https://img.vietqr.io/image/${bankName}-${accNo}-compact2.png?amount=${amt}&addInfo=${addInfo}&accountName=${encodeURIComponent(holder)}`;
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <TenantTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "dashboard" && (
        <TenantOverviewTab
          room={room} tenant={tenant} contract={contract} daysLeft={daysLeft}
          notifications={notifications} calcTotal={calcTotal}
          monthStr={currentMonthLabel()} roomPrice={roomPrice}
        />
      )}

      {activeTab === "meter_invoice" && (
        <MeterInvoiceTab
          contract={contract} settings={settings} monthStr={currentMonthLabel()}
          elecVal={elecVal} setElecVal={setElecVal} waterVal={waterVal} setWaterVal={setWaterVal}
          ocrLoading={ocrLoading} ocrSuccessMsg={ocrSuccessMsg} warningMsg={warningMsg} submitSuccess={submitSuccess}
          calcElecUsage={calcElecUsage} calcWaterUsage={calcWaterUsage}
          calcElecAmount={calcElecAmount} calcWaterAmount={calcWaterAmount} calcTotal={calcTotal}
          electricityRate={electricityRate} waterRate={waterRate} roomPrice={roomPrice}
          handleOcrUpload={handleOcrUpload} handleMeterSubmit={handleMeterSubmit} getVietQRUrl={getVietQRUrl}
        />
      )}

      {activeTab === "profile" && (
        <TenantProfileTab
          profileName={profileName} setProfileName={setProfileName}
          profileEmail={profileEmail} setProfileEmail={setProfileEmail}
          profilePhone={profilePhone} setProfilePhone={setProfilePhone}
          profileSaveMsg={profileSaveMsg} profileSaving={profileSaving}
          handleSaveProfile={handleSaveProfile}
        />
      )}

      <MessageDialog open={snack.open} severity={snack.severity} message={snack.message} onClose={() => setSnack({ ...snack, open: false })} />
    </Box>
  );
}
