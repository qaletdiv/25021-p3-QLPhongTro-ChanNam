'use server';

import { serverFetch } from './serverFetch';

export async function getSettings(buildingId) {
  const params = buildingId ? new URLSearchParams({ buildingId }).toString() : '';
  const qs = params ? `?${params}` : '';
  return serverFetch(`/settings${qs}`, { method: 'GET' });
}

export async function saveSettings(data, buildingId) {
  const params = buildingId ? new URLSearchParams({ buildingId }).toString() : '';
  const qs = params ? `?${params}` : '';
  return serverFetch(`/settings${qs}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function checkTelegram(buildingId) {
  const params = buildingId ? new URLSearchParams({ buildingId }).toString() : '';
  const qs = params ? `?${params}` : '';
  return serverFetch(`/settings/check-telegram${qs}`, { method: 'POST', body: JSON.stringify({}) });
}

export async function getBanks() {
  return serverFetch('/settings/vietqr/banks', { method: 'GET' });
}
