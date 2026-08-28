import TenantIssues from "@/src/views/TenantIssues";
import { getTenantIssues } from "@/src/actions/tenantIssueActions";
import { redirect } from "next/navigation";

const isAuthError = (reason) => {
  const status = reason?.response?.status;
  return status === 401 || status === 403;
};

export default async function TenantIssuesPage() {
  const results = await Promise.allSettled([getTenantIssues()]);
  if (results[0].status === "rejected" && isAuthError(results[0].reason)) {
    redirect("/login/tenant");
  }
  const res = results[0].status === "fulfilled" ? results[0].value : null;
  return <TenantIssues initialIssues={res?.data?.issues || []} />;
}
