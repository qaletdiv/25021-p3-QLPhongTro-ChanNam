'use server';
import { serverFetch } from './serverFetch';
export async function getTenantInvoices(contractId) {
  const qs = contractId ? `?contractId=${contractId}` : '';
  return serverFetch(`/tenant/invoices${qs}`, { method: 'GET' });
}
export async function getTenantInvoiceSettings(contractId) {
  const qs = contractId ? `?contractId=${contractId}` : '';
  return serverFetch(`/tenant/invoice-settings${qs}`, { method: 'GET' });
}
export async function saveInitialReadings(data, contractId) {
  const qs = contractId ? `?contractId=${contractId}` : '';
  return serverFetch(`/tenant/initial-readings${qs}`, { method: 'POST', body: JSON.stringify(data) });
}

export async function submitMeter(data, contractId) {
  const qs = contractId ? `?contractId=${contractId}` : '';
  return serverFetch(`/tenant/meter-submit${qs}`, { method: 'POST', body: JSON.stringify(data) });
}