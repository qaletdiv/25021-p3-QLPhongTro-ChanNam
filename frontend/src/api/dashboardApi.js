import { getStats, getMonthlyRevenue, getExpiringContracts, getNotifications, getUtilityUsage, getRateHistory } from "../actions/dashboardActions";

const dashboardApi = {
  getStats,
  getMonthlyRevenue,
  getExpiringContracts,
  getNotifications,
  getUtilityUsage,
  getRateHistory,
};

export default dashboardApi;
