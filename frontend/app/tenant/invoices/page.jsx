import TenantInvoices from "@/src/views/TenantInvoices";
import { getTenantInvoices, getTenantInvoiceSettings } from "@/src/actions/tenantInvoiceActions";
import { redirect } from "next/navigation";

export default async function TenantInvoicesPage() {
  try {
    const [invRes, setRes] = await Promise.all([
      getTenantInvoices(),
      getTenantInvoiceSettings(),
    ]);
    return (
      <TenantInvoices
        initialInvoices={invRes.data.invoices || []}
        initialSettings={setRes.data}
      />
    );
  } catch {
    redirect("/login/tenant");
  }
}
