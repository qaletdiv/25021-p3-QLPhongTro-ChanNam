import axiosClient from "./axiosClient";

const settingApi = {
  getAll() {
    return axiosClient.get("/settings");
  },
  save(data) {
    return axiosClient.put("/settings", data);
  },
  checkZalo() {
    return axiosClient.post("/settings/check-zalo");
  },
};

export default settingApi;
