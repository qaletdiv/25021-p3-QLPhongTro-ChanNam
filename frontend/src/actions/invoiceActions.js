'use server';
import { serverFetch } from './serverFetch';

function buildParams(params) {
  if (!params || Object.keys(params).length === 0) return '';
  return '?' + new URLSearchParams(params).toString();
}

export async function getInvoices(params) {
  return serverFetch(`/invoices${buildParams(params)}`, { method: 'GET' });
}
export async function getPendingInvoicesCount() {
  return serverFetch('/invoices/pending-count', { method: 'GET' });
}
export async function markInvoiceAsPaid(id) {
  return serverFetch(`/invoices/${id}/paid`, { method: 'PUT' });
}
export async function sendInvoiceReminder(id) {
  return serverFetch(`/invoices/${id}/remind`, { method: 'POST' });
}
