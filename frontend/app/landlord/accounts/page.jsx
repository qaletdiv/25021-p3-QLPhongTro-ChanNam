export const dynamic = 'force-dynamic'
import AccountManagement from "@/src/views/AccountManagement";
import { getUsers } from "@/src/actions/adminUserActions";
import { redirect } from "next/navigation";

export default async function AccountsPage() {
  try {
    const res = await getUsers();
    return <AccountManagement initialUsers={res.data.users || []} />;
  } catch {
    redirect("/login/landlord");
  }
}

