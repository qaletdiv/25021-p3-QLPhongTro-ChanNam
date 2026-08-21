'use server';
import { serverFetch } from './serverFetch';
export async function getBuildings() {
  return serverFetch('/buildings', { method: 'GET' });
}
export async function createBuilding(data) {
  return serverFetch('/buildings', { method: 'POST', body: JSON.stringify(data) });
}
export async function updateBuilding(id, data) {
  return serverFetch(`/buildings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export async function deleteBuilding(id) {
  return serverFetch(`/buildings/${id}`, { method: 'DELETE' });
}
