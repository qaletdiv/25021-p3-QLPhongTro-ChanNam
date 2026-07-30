import axiosClient from "./axiosClient";

const tenantDashboardApi = {
  getDashboard() {
    return axiosClient.get("/tenant/dashboard");
  },
};

export default tenantDashboardApi;
