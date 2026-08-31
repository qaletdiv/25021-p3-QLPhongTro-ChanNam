export const dynamic = 'force-dynamic'
import RoomManagement from "@/src/views/RoomManagement";
import { getRooms } from "@/src/actions/roomActions";
import { getBuildings } from "@/src/actions/buildingActions";
import { redirect } from "next/navigation";

export default async function RoomsPage() {
  try {
    const [roomsRes, buildingsRes] = await Promise.all([getRooms(), getBuildings()]);
    return (
      <RoomManagement
        initialRooms={roomsRes.data.rooms}
        initialBuildings={buildingsRes.data.buildings || []}
      />
    );
  } catch {
    redirect("/login/landlord");
  }
}

