import { getTenantNotifications, markTenantNotificationsRead } from "../actions/tenantNotificationActions";

const tenantNotificationApi = {
  getNotifications: getTenantNotifications,
  markRead: markTenantNotificationsRead,
};

export default tenantNotificationApi;
