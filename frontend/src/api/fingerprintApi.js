import axiosClient from "./axiosClient";

const fingerprintApi = {
  getHistory(params) {
    return axiosClient.get("/fingerprints", { params });
  },
};

export default fingerprintApi;