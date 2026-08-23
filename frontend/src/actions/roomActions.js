'use server';

import { serverFetch } from './serverFetch';
import { buildParamsDirect } from './utils';

export async function getRooms(status, extraParams = {}) {
  const params = {};
  if (status) params.status = status;
  Object.assign(params, extraParams);
  const qs = Object.keys(params).length ? '?' + buildParamsDirect(params) : '';
  return serverFetch(`/rooms${qs}`, { method: 'GET' });
}

export async function getRoomById(id) {
  return serverFetch(`/rooms/${id}`, { method: 'GET' });
}

export async function createRoom(data) {
  return serverFetch('/rooms', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateRoom(id, data) {
  return serverFetch(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteRoom(id) {
  return serverFetch(`/rooms/${id}`, { method: 'DELETE' });
}
