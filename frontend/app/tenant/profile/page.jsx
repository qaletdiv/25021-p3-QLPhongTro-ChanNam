import TenantProfile from "@/src/views/TenantProfile";
import { getTenantProfile } from "@/src/actions/tenantProfileActions";
import { redirect } from "next/navigation";

export default async function TenantProfilePage() {
  try {
    const res = await getTenantProfile();
    return <TenantProfile initialProfile={res.data.profile || null} />;
  } catch {
    redirect("/login/tenant");
  }
}
