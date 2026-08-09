import axiosClient from "./axiosClient";

const pushApi = {
  getVapid() {
    return axiosClient.get("/push/vapid");
  },
  subscribe(subscription) {
    return axiosClient.post("/push/subscribe", subscription);
  },
};

export default pushApi;