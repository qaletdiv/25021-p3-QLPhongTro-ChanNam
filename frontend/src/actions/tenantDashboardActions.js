'use server';
import { serverFetch } from './serverFetch';
export async function getTenantDashboard() {
  return serverFetch('/tenant/dashboard', { method: 'GET' });
}
export async function getTenantUtilityUsage() {
  return serverFetch('/tenant/dashboard/utility-usage', { method: 'GET' });
}
