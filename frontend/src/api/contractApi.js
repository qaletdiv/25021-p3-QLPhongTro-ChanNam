import axiosClient from "./axiosClient";

const contractApi = {
  getAll() {
    return axiosClient.get("/contracts");
  },
  create(data) {
    return axiosClient.post("/contracts", data);
  },
  getById(id) {
    return axiosClient.get(`/contracts/${id}`);
  },
  update(id, data) {
    return axiosClient.put(`/contracts/${id}`, data);
  },
  checkout(id) {
    return axiosClient.put(`/contracts/${id}/checkout`);
  },
};

export default contractApi;
