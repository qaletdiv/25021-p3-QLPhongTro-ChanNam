import { getTenantInvoices, getTenantInvoiceSettings, saveInitialReadings, submitMeter } from "../actions/tenantInvoiceActions";

const tenantInvoiceApi = {
  getInvoices: getTenantInvoices,
  getInvoiceSettings: getTenantInvoiceSettings,
  saveInitialReadings,
  submitMeter,
};

export default tenantInvoiceApi;
