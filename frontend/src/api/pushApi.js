import axiosClient from "./axiosClient";

const pushApi = {
  getVapid() {
    return axiosClient.get("/push/vapid");
  },
  subscribe(subscription) {
    return axiosClient.post("/push/subscribe", subscription);
  },
  unsubscribe(endpoint) {
    return axiosClient.post("/push/unsubscribe", { endpoint });
  },
};

export default pushApi;