'use server';
import { serverFetch } from './serverFetch';

export async function getCollaborators(buildingId) {
  return serverFetch(`/buildings/${buildingId}/collaborators`, { method: 'GET' });
}

export async function addCollaborator(buildingId, email) {
  return serverFetch(`/buildings/${buildingId}/collaborators`, { method: 'POST', body: JSON.stringify({ email }) });
}

export async function removeCollaborator(buildingId, userId) {
  return serverFetch(`/buildings/${buildingId}/collaborators/${userId}`, { method: 'DELETE' });
}
