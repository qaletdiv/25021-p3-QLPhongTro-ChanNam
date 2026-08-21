import { getInvoices, getPendingInvoicesCount, markInvoiceAsPaid, sendInvoiceReminder } from "../actions/invoiceActions";

const invoiceApi = {
  getAll: getInvoices,
  getPendingCount: getPendingInvoicesCount,
  markAsPaid: markInvoiceAsPaid,
  sendReminder: sendInvoiceReminder,
};

export default invoiceApi;
