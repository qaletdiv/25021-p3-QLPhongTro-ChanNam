import axiosClient from "./axiosClient";

const invoiceApi = {
  getAll(params) {
    return axiosClient.get("/invoices", { params });
  },
  getPendingCount() {
    return axiosClient.get("/invoices/pending-count");
  },
  markAsPaid(id) {
    return axiosClient.put(`/invoices/${id}/paid`);
  },
  sendReminder(id) {
    return axiosClient.post(`/invoices/${id}/remind`);
  },
};

export default invoiceApi;
