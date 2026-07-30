import axiosClient from "./axiosClient";

const tenantIssueApi = {
  getAll() {
    return axiosClient.get("/tenant/issues");
  },
  create(data) {
    return axiosClient.post("/tenant/issues", data);
  },
};

export default tenantIssueApi;
