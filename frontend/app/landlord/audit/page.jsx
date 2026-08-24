import AuditLogView from "@/src/views/AuditLogView";
import { getAuditLogs } from "@/src/actions/auditActions";
import { redirect } from "next/navigation";

export default async function AuditPage() {
  try {
    const res = await getAuditLogs({ page: 1 });
    return (
      <AuditLogView
        initialLogs={res.data.logs || []}
        initialTotal={res.data.total || 0}
      />
    );
  } catch {
    redirect("/login/landlord");
  }
}
