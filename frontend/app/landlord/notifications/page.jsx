import NotificationManagement from "@/src/views/NotificationManagement";
import { getNotifications } from "@/src/actions/notificationActions";
import { getRooms } from "@/src/actions/roomActions";
import { getSettings } from "@/src/actions/settingActions";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  try {
    const [notifRes, roomRes, setRes] = await Promise.all([
      getNotifications(),
      getRooms(),
      getSettings(""),
    ]);
    return (
      <NotificationManagement
        initialNotifications={notifRes.data.notifications || []}
        initialRooms={roomRes.data.rooms || []}
        initialAutoTemplate={setRes.data.settings?.autoReminderTemplate || ""}
      />
    );
  } catch {
    redirect("/login/landlord");
  }
}
