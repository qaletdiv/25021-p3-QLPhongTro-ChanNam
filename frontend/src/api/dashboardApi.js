import axiosClient from "./axiosClient";

const dashboardApi = {
  getStats() {
    return axiosClient.get("/dashboard/stats");
  },
  getExpiringContracts() {
    return axiosClient.get("/dashboard/expiring-contracts");
  },
};

export default dashboardApi;
