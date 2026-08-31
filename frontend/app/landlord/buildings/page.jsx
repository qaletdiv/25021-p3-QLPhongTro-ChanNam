export const dynamic = 'force-dynamic'
import BuildingManagement from "@/src/views/BuildingManagement";
import { getBuildings } from "@/src/actions/buildingActions";
import { redirect } from "next/navigation";

export default async function BuildingsPage() {
  try {
    const res = await getBuildings();
    return <BuildingManagement initialBuildings={res.data.buildings || []} />;
  } catch {
    redirect("/login/landlord");
  }
}

