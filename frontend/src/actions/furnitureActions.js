'use server';
import { serverFetch } from './serverFetch';
export async function getFurnitures() {
  return serverFetch('/furnitures', { method: 'GET' });
}
export async function createFurniture(data) {
  return serverFetch('/furnitures', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateFurniture(id, data) {
  return serverFetch(`/furnitures/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteFurniture(id) {
  return serverFetch(`/furnitures/${id}`, { method: 'DELETE' });
}
