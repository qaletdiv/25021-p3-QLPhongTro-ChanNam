import { getTenantIssues, createTenantIssue } from "../actions/tenantIssueActions";

const tenantIssueApi = {
  getAll: getTenantIssues,
  create: createTenantIssue,
};

export default tenantIssueApi;
