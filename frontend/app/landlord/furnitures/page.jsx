import FurnitureManagement from "@/src/views/FurnitureManagement";
import { getFurnitures } from "@/src/actions/furnitureActions";
import { redirect } from "next/navigation";

export default async function FurnituresPage() {
  try {
    const res = await getFurnitures();
    return <FurnitureManagement initialItems={res.data.furnitures || []} />;
  } catch {
    redirect("/login/landlord");
  }
}
