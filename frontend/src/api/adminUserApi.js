import axiosClient from "./axiosClient";

const adminUserApi = {
  getUsers(params) {
    return axiosClient.get("/admin/users", { params });
  },
  revokeSession(id) {
    return axiosClient.post(`/admin/users/${id}/revoke`);
  },
  disableAccount(id) {
    return axiosClient.post(`/admin/users/${id}/disable`);
  },
  enableAccount(id) {
    return axiosClient.post(`/admin/users/${id}/enable`);
  },
  changePassword(id, newPassword) {
    return axiosClient.post(`/admin/users/${id}/change-password`, { newPassword });
  },
};

export default adminUserApi;