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
  checkZalo() {
    return axiosClient.post("/settings/check-zalo");
  },
};

export default settingApi;
