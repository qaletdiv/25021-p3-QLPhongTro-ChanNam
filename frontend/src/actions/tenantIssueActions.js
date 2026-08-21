'use server';
import { serverFetch } from './serverFetch';
export async function getTenantIssues() {
  return serverFetch('/tenant/issues', { method: 'GET' });
}
export async function createTenantIssue(data) {
  return serverFetch('/tenant/issues', { method: 'POST', body: JSON.stringify(data) });
}
