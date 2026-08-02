import axiosClient from "./axiosClient";

const issueApi = {
  getAll() {
    return axiosClient.get("/issues");
  },
  getPendingCount() {
    return axiosClient.get("/issues/pending-count");
  },
  updateStatus(id, status) {
    return axiosClient.patch(`/issues/${id}/status`, { status });
  },
};

export default issueApi;
