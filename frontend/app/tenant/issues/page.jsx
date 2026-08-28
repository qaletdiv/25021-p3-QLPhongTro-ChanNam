import TenantIssues from "@/src/views/TenantIssues";
import { getTenantIssues } from "@/src/actions/tenantIssueActions";
import { getTenantActiveContract } from "@/src/actions/tenantDashboardActions";
import { redirect } from "next/navigation";

const isAuthError = (reason) => {
  const status = reason?.response?.status;
  return status === 401 || status === 403;
};

export default async function TenantIssuesPage() {
  const results = await Promise.allSettled([getTenantIssues(), getTenantActiveContract()]);
  if (results.some((r) => r.status === "rejected" && isAuthError(r.reason))) {
    redirect("/login/tenant");
  }
  const res = results[0].status === "fulfilled" ? results[0].value : null;
  const contractRes = results[1].status === "fulfilled" ? results[1].value : null;
  const hasRoom = !!contractRes?.data?.contract;
  return <TenantIssues initialIssues={res?.data?.issues || []} hasRoom={hasRoom} />;
}
