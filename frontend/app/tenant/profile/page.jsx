import TenantProfile from "@/src/views/TenantProfile";
import { getTenantProfile } from "@/src/actions/tenantProfileActions";
import { redirect } from "next/navigation";

const isAuthError = (reason) => {
  const status = reason?.response?.status;
  return status === 401 || status === 403;
};

export default async function TenantProfilePage() {
  const results = await Promise.allSettled([getTenantProfile()]);
  if (results[0].status === "rejected" && isAuthError(results[0].reason)) {
    redirect("/login/tenant");
  }
  const res = results[0].status === "fulfilled" ? results[0].value : null;
  return <TenantProfile initialProfile={res?.data?.profile || null} />;
}
