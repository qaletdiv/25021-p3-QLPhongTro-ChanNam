import axiosClient from "./axiosClient";

const contractTemplateApi = {
  getTemplate() {
    return axiosClient.get("/contracts/template");
  },
  saveTemplate(data) {
    return axiosClient.put("/contracts/template", data);
  },
  getPdfUrl(id) {
    const token = localStorage.getItem("token");
    return `/api/contracts/${id}/pdf?token=${token}`;
  },
};

export default contractTemplateApi;
