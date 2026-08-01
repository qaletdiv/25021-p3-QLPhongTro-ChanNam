import axiosClient from "./axiosClient";

const roomApi = {
  getAll(status, extraParams) {
    const params = status ? { status } : {};
    if (extraParams) Object.assign(params, extraParams);
    return axiosClient.get("/rooms", { params });
  },
  getById(id) {
    return axiosClient.get(`/rooms/${id}`);
  },
  create(data) {
    return axiosClient.post("/rooms", data);
  },
  update(id, data) {
    return axiosClient.put(`/rooms/${id}`, data);
  },
  delete(id) {
    return axiosClient.delete(`/rooms/${id}`);
  },
};

export default roomApi;
