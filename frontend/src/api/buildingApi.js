import axiosClient from "./axiosClient";

const buildingApi = {
  getAll() {
    return axiosClient.get("/buildings");
  },
  create(data) {
    return axiosClient.post("/buildings", data);
  },
  update(id, data) {
    return axiosClient.put(`/buildings/${id}`, data);
  },
  delete(id) {
    return axiosClient.delete(`/buildings/${id}`);
  },
};

export default buildingApi;
