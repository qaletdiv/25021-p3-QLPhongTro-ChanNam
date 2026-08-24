import TenantDashboard from "@/src/views/TenantDashboard";
import { getTenantDashboard } from "@/src/actions/tenantDashboardActions";
import { getTenantInvoiceSettings } from "@/src/actions/tenantInvoiceActions";
import { getTenantNotifications } from "@/src/actions/tenantNotificationActions";
import { redirect } from "next/navigation";

export default async function TenantDashboardPage() {
  try {
    const [dashRes, settingsRes, notifRes] = await Promise.all([
      getTenantDashboard(),
      getTenantInvoiceSettings(),
      getTenantNotifications(),
    ]);
    return (
      <TenantDashboard
        data={dashRes.data}
        settings={settingsRes.data}
        notifInit={notifRes.data || {}}
      />
    );
  } catch (err) {
    redirect("/login/tenant");
  }
}
