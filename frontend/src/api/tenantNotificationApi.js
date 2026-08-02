import axiosClient from "./axiosClient";

const tenantNotificationApi = {
  getNotifications() {
    return axiosClient.get("/tenant/notifications");
  },
  markRead(items) {
    return axiosClient.post("/tenant/notifications/read", { items });
  },
};

export default tenantNotificationApi;
