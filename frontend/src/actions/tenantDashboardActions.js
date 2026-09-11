'use server';
import { serverFetch } from './serverFetch';
export async function getTenantDashboard() {
  return serverFetch('/tenant/dashboard', { method: 'GET' });
}
export async function getTenantUtilityUsage(contractId) {
  return serverFetch(`/tenant/dashboard/utility-usage?contractId=${contractId}`, { method: 'GET' });
}
export async function getTenantActiveContract() {
  return serverFetch('/tenant/active-contract', { method: 'GET' });
}
