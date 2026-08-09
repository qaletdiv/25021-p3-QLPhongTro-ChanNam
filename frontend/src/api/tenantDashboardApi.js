import axiosClient from "./axiosClient";

const tenantDashboardApi = {
  getDashboard() {
    return axiosClient.get("/tenant/dashboard");
  },
  getUtilityUsage() {
    return axiosClient.get("/tenant/dashboard/utility-usage");
  },
};

export default tenantDashboardApi;
