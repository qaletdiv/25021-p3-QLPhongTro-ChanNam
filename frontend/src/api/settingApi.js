import axiosClient from "./axiosClient";

const settingApi = {
  getAll(buildingId) {
    const params = buildingId ? { buildingId } : {};
    return axiosClient.get("/settings", { params });
  },
  save(data, buildingId) {
    const params = buildingId ? { buildingId } : {};
    return axiosClient.put("/settings", data, { params });
  },
  checkTelegram(buildingId) {
    const params = buildingId ? { buildingId } : {};
    return axiosClient.post("/settings/check-telegram", {}, { params });
  },
};

export default settingApi;
