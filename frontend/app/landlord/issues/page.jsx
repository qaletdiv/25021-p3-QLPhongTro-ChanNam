import IssueManagement from "@/src/views/IssueManagement";
import { getIssues } from "@/src/actions/issueActions";
import { redirect } from "next/navigation";

export default async function IssuesPage() {
  try {
    const res = await getIssues();
    return <IssueManagement initialIssues={res.data.issues || []} />;
  } catch {
    redirect("/login/landlord");
  }
}
