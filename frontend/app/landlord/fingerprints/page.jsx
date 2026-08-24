import FingerprintManagement from "@/src/views/FingerprintManagement";
import { getFingerprintHistory } from "@/src/actions/fingerprintActions";
import { getBuildings } from "@/src/actions/buildingActions";
import { redirect } from "next/navigation";

export default async function FingerprintsPage() {
  try {
    const [historyRes, buildingsRes] = await Promise.all([getFingerprintHistory(), getBuildings()]);
    return (
      <FingerprintManagement
        initialHistory={historyRes.data.history || []}
        initialBuildings={buildingsRes.data.buildings || []}
      />
    );
  } catch {
    redirect("/login/landlord");
  }
}
