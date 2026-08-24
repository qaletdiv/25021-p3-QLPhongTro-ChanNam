import TenantManagement from "@/src/views/TenantManagement";
import { getTenants } from "@/src/actions/tenantActions";
import { getBuildings } from "@/src/actions/buildingActions";
import { redirect } from "next/navigation";

export default async function TenantsPage() {
  try {
    const [tenantsRes, buildingsRes] = await Promise.all([getTenants(undefined, 1, 20), getBuildings()]);
    return (
      <TenantManagement
        initialTenants={tenantsRes.data.tenants || []}
        initialBuildings={buildingsRes.data.buildings || []}
      />
    );
  } catch {
    redirect("/login/landlord");
  }
}
