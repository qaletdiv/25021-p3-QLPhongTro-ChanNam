import axiosClient from "./axiosClient";

const tenantApi = {
  getAll(search) {
    const params = search ? { search } : {};
    return axiosClient.get("/tenants", { params });
  },
  create(data) {
    return axiosClient.post("/tenants", data);
  },
  update(id, data) {
    return axiosClient.put(`/tenants/${id}`, data);
  },
};

export default tenantApi;
