'use server';
import { serverFetch } from './serverFetch';
export async function getTenants(search, page, limit) {
  const qs = search
    ? `?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`
    : `?page=${page}&limit=${limit}`;
  return serverFetch(`/tenants${qs}`, { method: 'GET' });
}
export async function createTenant(data) {
  return serverFetch('/tenants', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateTenant(id, data) {
  return serverFetch(`/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
