'use server';
import { serverFetch } from './serverFetch';
export async function getTenantInvoices() {
  return serverFetch('/tenant/invoices', { method: 'GET' });
}
export async function getTenantInvoiceSettings() {
  return serverFetch('/tenant/invoice-settings', { method: 'GET' });
}
export async function saveInitialReadings(data) {
  return serverFetch('/tenant/initial-readings', { method: 'POST', body: JSON.stringify(data) });
}
export async function submitMeter(data) {
  return serverFetch('/tenant/meter-submit', { method: 'POST', body: JSON.stringify(data) });
}
