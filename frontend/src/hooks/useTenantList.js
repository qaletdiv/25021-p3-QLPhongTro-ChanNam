import { useState, useEffect, useCallback } from "react";
import tenantApi from "../api/tenantApi";
import buildingApi from "../api/buildingApi";

export default function useTenantList({ notify }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("renting");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    if (statusFilter === "renting" && !active) return false;
    if (statusFilter === "ended" && active) return false;
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
    return true;
  });

  const clearDates = () => { setDateFrom(""); setDateTo(""); };

  return {
    tenants, loading, search, statusFilter, dateFrom, dateTo, buildings, buildingFilter,
    filteredTenants, setSearch, setStatusFilter, setDateFrom, setDateTo, clearDates, fetchTenants, setBuildingFilter,
  };
}
