export const dynamic = 'force-dynamic'
import InvoiceManagement from "@/src/views/InvoiceManagement";
import { getInvoices } from "@/src/actions/invoiceActions";
import { getSettings } from "@/src/actions/settingActions";
import { getBuildings } from "@/src/actions/buildingActions";
import { redirect } from "next/navigation";

export default async function InvoicesPage() {
  try {
    const [invRes, setRes, bRes] = await Promise.all([
      getInvoices({}),
      getSettings(),
      getBuildings(),
    ]);
    return (
      <InvoiceManagement
        initialInvoices={invRes.data.invoices || []}
        initialSettings={setRes.data}
        initialBuildings={bRes.data.buildings || []}
      />
    );
  } catch {
    redirect("/login/landlord");
  }
}

