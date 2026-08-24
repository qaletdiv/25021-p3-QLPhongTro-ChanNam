import TenantIssues from "@/src/views/TenantIssues";
import { getTenantIssues } from "@/src/actions/tenantIssueActions";
import { redirect } from "next/navigation";

export default async function TenantIssuesPage() {
  try {
    const res = await getTenantIssues();
    return <TenantIssues initialIssues={res.data.issues || []} />;
  } catch {
    redirect("/login/tenant");
  }
}
