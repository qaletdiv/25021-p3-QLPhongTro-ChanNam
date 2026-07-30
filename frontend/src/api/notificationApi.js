import axiosClient from "./axiosClient";

const notificationApi = {
  getAll() {
    return axiosClient.get("/notifications");
  },
  create(data) {
    return axiosClient.post("/notifications", data);
  },
};

export default notificationApi;
