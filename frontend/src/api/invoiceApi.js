import axiosClient from "./axiosClient";

const invoiceApi = {
  getAll(params) {
    return axiosClient.get("/invoices", { params });
  },
  markAsPaid(id) {
    return axiosClient.put(`/invoices/${id}/paid`);
  },
  sendReminder(id) {
    return axiosClient.post(`/invoices/${id}/remind`);
  },
};

export default invoiceApi;
