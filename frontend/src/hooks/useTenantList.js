import { useState, useEffect, useCallback } from "react";
import tenantApi from "../api/tenantApi";
import buildingApi from "../api/buildingApi";

export default function useTenantList({ notify }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("renting");
  const [companionStatus, setCompanionStatus] = useState("active");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [ttFrom, setTtFrom] = useState("");
  const [ttTo, setTtTo] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [buildingFilter, setBuildingFilter] = useState("all");

  useEffect(() => {
    buildingApi.getAll()
      .then((res) => setBuildings(res.data.buildings || []))
      .catch(() => {});
  }, []);

  const fetchTenants = useCallback(async () => {
    try {
      const res = await tenantApi.getAll(search || undefined);
      setTenants(res.data.tenants);
    } catch {
      notify("Lỗi tải danh sách khách", "error");
    } finally {
      setLoading(false);
    }
  }, [search, notify]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const filteredTenants = tenants.filter((tenant) => {
    const active = tenant.contracts?.find((c) => c.status === "active");
    const activeCompanions = (tenant.companions || []).filter((c) => c.status !== "ended");
    const endedCompanions = (tenant.companions || []).filter((c) => c.status === "ended");
    if (statusFilter === "renting" && !active) return false;
    if (statusFilter === "ended" && active) return false;
    if (companionStatus === "active" && activeCompanions.length === 0) return false;
    if (companionStatus === "ended" && endedCompanions.length === 0) return false;
    if (buildingFilter !== "all") {
      const bId = active?.room?.building?.id ?? [...(tenant.contracts || [])].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0]?.room?.building?.id;
      if (bId !== Number(buildingFilter)) return false;
    }
    if (dateFrom || dateTo) {
      const latest = active || [...(tenant.contracts || [])].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
      if (!latest) return false;
      const start = new Date(latest.startDate);
      const end = new Date(latest.endDate);
      if (dateFrom && end < new Date(dateFrom)) return false;
      if (dateTo && start > new Date(dateTo)) return false;
    }
    if (ttFrom || ttTo) {
      const latest = active || [...(tenant.contracts || [])].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
      if (!latest) return false;
      const start = new Date(latest.startDate);
      const end = latest.checkoutDate ? new Date(latest.checkoutDate) : new Date(latest.endDate);
      if (ttFrom && end < new Date(ttFrom)) return false;
      if (ttTo && start > new Date(ttTo)) return false;
    }
    return true;
  });

  const clearDates = () => { setDateFrom(""); setDateTo(""); };
  const clearTtDates = () => { setTtFrom(""); setTtTo(""); };

  return {
    tenants, loading, search, statusFilter, companionStatus, dateFrom, dateTo, ttFrom, ttTo, buildings, buildingFilter,
    filteredTenants, setSearch, setStatusFilter, setCompanionStatus, setDateFrom, setDateTo, clearDates, fetchTenants, setBuildingFilter,
    setTtFrom, setTtTo, clearTtDates,
  };
}
