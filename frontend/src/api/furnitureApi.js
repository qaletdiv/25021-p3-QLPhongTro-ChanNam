import axiosClient from "./axiosClient";

const furnitureApi = {
  getAll() {
    return axiosClient.get("/furnitures");
  },
  create(data) {
    return axiosClient.post("/furnitures", data);
  },
  update(id, data) {
    return axiosClient.put(`/furnitures/${id}`, data);
  },
  delete(id) {
    return axiosClient.delete(`/furnitures/${id}`);
  },
};

export default furnitureApi;
