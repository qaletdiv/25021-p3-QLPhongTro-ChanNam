import axiosClient from "./axiosClient";

const dashboardApi = {
  getStats() {
    return axiosClient.get("/dashboard/stats");
  },
  getMonthlyRevenue() {
    return axiosClient.get("/dashboard/monthly-revenue");
  },
  getExpiringContracts() {
    return axiosClient.get("/dashboard/expiring-contracts");
  },
};

export default dashboardApi;
