import axiosClient from "./axiosClient";

const tenantInvoiceApi = {
  getInvoices() {
    return axiosClient.get("/tenant/invoices");
  },
  getInvoiceSettings() {
    return axiosClient.get("/tenant/invoice-settings");
  },
};

export default tenantInvoiceApi;
