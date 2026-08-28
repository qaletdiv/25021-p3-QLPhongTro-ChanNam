import TenantDashboard from "@/src/views/TenantDashboard";
import { getTenantDashboard } from "@/src/actions/tenantDashboardActions";
import { getTenantInvoiceSettings } from "@/src/actions/tenantInvoiceActions";
import { getTenantNotifications } from "@/src/actions/tenantNotificationActions";
import { redirect } from "next/navigation";

const isAuthError = (reason) => {
  const status = reason?.response?.status;
  return status === 401 || status === 403;
};

export default async function TenantDashboardPage() {
  const results = await Promise.allSettled([
    getTenantDashboard(),
    getTenantInvoiceSettings(),
    getTenantNotifications(),
  ]);

  // Only force login when the session is genuinely expired/invalid.
  // Other errors (e.g. "no active contract") must not loop back to login.
  if (results.some((r) => r.status === "rejected" && isAuthError(r.reason))) {
    redirect("/login/tenant");
  }

  const dashRes = results[0].status === "fulfilled" ? results[0].value : null;
  const settingsRes = results[1].status === "fulfilled" ? results[1].value : null;
  const notifRes = results[2].status === "fulfilled" ? results[2].value : null;

  return (
    <TenantDashboard
      data={dashRes?.data}
      settings={settingsRes?.data}
      notifInit={notifRes?.data || {}}
    />
  );
}
