import { getTenantDashboard, getTenantUtilityUsage } from "../actions/tenantDashboardActions";

const tenantDashboardApi = {
  getDashboard: getTenantDashboard,
  getUtilityUsage: getTenantUtilityUsage,
};

export default tenantDashboardApi;
