import { getIssues, getPendingIssuesCount, updateIssueStatus } from "../actions/issueActions";

const issueApi = {
  getAll: getIssues,
  getPendingCount: getPendingIssuesCount,
  updateStatus: updateIssueStatus,
};

export default issueApi;
