import axiosClient from "./axiosClient";

const tenantInvoiceApi = {
  getInvoices() {
    return axiosClient.get("/tenant/invoices");
  },
  getInvoiceSettings() {
    return axiosClient.get("/tenant/invoice-settings");
  },
  saveInitialReadings(data) {
    return axiosClient.post("/tenant/initial-readings", data);
  },
};

export default tenantInvoiceApi;
