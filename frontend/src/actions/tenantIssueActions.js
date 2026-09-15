'use server';
import { serverFetch } from './serverFetch';
export async function getTenantIssues(contractId) {
  const qs = contractId ? `?contractId=${contractId}` : '';
  return serverFetch(`/tenant/issues${qs}`, { method: 'GET' });
}
export async function createTenantIssue(data) {
  return serverFetch('/tenant/issues', { method: 'POST', body: JSON.stringify(data) });
}
