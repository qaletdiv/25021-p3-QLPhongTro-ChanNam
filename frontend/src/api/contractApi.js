import axiosClient from "./axiosClient";

const contractApi = {
  create(data) {
    return axiosClient.post("/contracts", data);
  },
  getById(id) {
    return axiosClient.get(`/contracts/${id}`);
  },
  update(id, data) {
    return axiosClient.put(`/contracts/${id}`, data);
  },
  checkout(id, data = {}) {
    return axiosClient.put(`/contracts/${id}/checkout`, data);
  },
};

export default contractApi;
