import axiosClient from "./axiosClient";

const auditApi = {
  getLogs(params) {
    return axiosClient.get("/audit", { params });
  },
};

export default auditApi;