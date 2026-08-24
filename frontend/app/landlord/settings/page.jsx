import Settings from "@/src/views/Settings";
import { getSettings } from "@/src/actions/settingActions";
import { getBuildings } from "@/src/actions/buildingActions";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  try {
    const [setRes, bRes] = await Promise.all([getSettings(""), getBuildings()]);
    return (
      <Settings
        initialSettings={setRes.data.settings || {}}
        initialBuildings={bRes.data.buildings || []}
      />
    );
  } catch {
    redirect("/login/landlord");
  }
}
