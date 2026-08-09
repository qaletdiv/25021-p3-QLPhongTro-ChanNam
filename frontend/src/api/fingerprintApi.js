import axiosClient from "./axiosClient";

const fingerprintApi = {
  getHistory(params) {
    return axiosClient.get("/fingerprints", { params });
  },
  getGroups(params) {
    return axiosClient.get("/fingerprints/groups", { params });
  },
};

export default fingerprintApi;