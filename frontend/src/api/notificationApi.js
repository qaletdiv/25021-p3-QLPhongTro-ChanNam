import { getNotifications, createNotification } from "../actions/notificationActions";

const notificationApi = {
  getAll: getNotifications,
  create: createNotification,
};

export default notificationApi;
