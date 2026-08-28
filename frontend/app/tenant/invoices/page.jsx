import TenantInvoices from "@/src/views/TenantInvoices";
import { getTenantInvoices, getTenantInvoiceSettings } from "@/src/actions/tenantInvoiceActions";
import { getTenantActiveContract } from "@/src/actions/tenantDashboardActions";
import { redirect } from "next/navigation";

const isAuthError = (reason) => {
  const status = reason?.response?.status;
  return status === 401 || status === 403;
};

export default async function TenantInvoicesPage() {
  const results = await Promise.allSettled([
    getTenantInvoices(),
    getTenantInvoiceSettings(),
    getTenantActiveContract(),
  ]);
  // Only force login when the session is genuinely expired/invalid.
  // Tenants without a room/contract simply get an empty state.
  if (results.some((r) => r.status === "rejected" && isAuthError(r.reason))) {
    redirect("/login/tenant");
  }
  const invRes = results[0].status === "fulfilled" ? results[0].value : null;
  const setRes = results[1].status === "fulfilled" ? results[1].value : null;
  const contractRes = results[2].status === "fulfilled" ? results[2].value : null;
  const hasRoom = !!contractRes?.data?.contract;
  return (
    <TenantInvoices
      initialInvoices={invRes?.data?.invoices || []}
      initialSettings={setRes?.data || null}
      hasRoom={hasRoom}
    />
  );
}
