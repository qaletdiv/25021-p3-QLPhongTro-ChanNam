'use server';
import { serverFetch } from './serverFetch';
export async function createContract(data) {
  return serverFetch('/contracts', { method: 'POST', body: JSON.stringify(data) });
}
export async function getContractById(id) {
  return serverFetch(`/contracts/${id}`, { method: 'GET' });
}
export async function updateContract(id, data) {
  return serverFetch(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function checkoutContract(id, data = {}) {
  return serverFetch(`/contracts/${id}/checkout`, { method: 'PUT', body: JSON.stringify(data || {}) });
}
