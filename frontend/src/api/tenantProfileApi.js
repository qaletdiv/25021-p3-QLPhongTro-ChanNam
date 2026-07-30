import axiosClient from "./axiosClient";

const tenantProfileApi = {
  getProfile() {
    return axiosClient.get("/tenant/profile");
  },
  updateProfile(data) {
    return axiosClient.put("/tenant/profile", data);
  },
  changePassword(data) {
    return axiosClient.put("/tenant/password", data);
  },
};

export default tenantProfileApi;
