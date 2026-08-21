'use server';
import { serverFetch } from './serverFetch';
export async function getTenantProfile() {
  return serverFetch('/tenant/profile', { method: 'GET' });
}
export async function updateTenantProfile(data) {
  return serverFetch('/tenant/profile', { method: 'PUT', body: JSON.stringify(data) });
}
export async function changeTenantPassword(data) {
  return serverFetch('/tenant/password', { method: 'PUT', body: JSON.stringify(data) });
}
