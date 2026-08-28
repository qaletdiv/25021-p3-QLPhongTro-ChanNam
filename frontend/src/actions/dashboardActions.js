'use server';

import { serverFetch } from './serverFetch';

export async function getStats(buildingId) {
  const qs = buildingId ? `?buildingId=${buildingId}` : '';
  return serverFetch(`/dashboard/stats${qs}`, { method: 'GET' });
}

export async function getMonthlyRevenue(buildingId) {
  const qs = buildingId ? `?buildingId=${buildingId}` : '';
  return serverFetch(`/dashboard/monthly-revenue${qs}`, { method: 'GET' });
}

export async function getExpiringContracts(buildingId) {
  const qs = buildingId ? `?buildingId=${buildingId}` : '';
  return serverFetch(`/dashboard/expiring-contracts${qs}`, { method: 'GET' });
}

export async function getNotifications() {
  return serverFetch('/dashboard/notifications', { method: 'GET' });
}

export async function getUtilityUsage(buildingId, month) {
  const sp = new URLSearchParams();
  if (buildingId) sp.set('buildingId', buildingId);
  if (month) sp.set('month', month);
  const qs = sp.toString();
  return serverFetch(`/dashboard/utility-usage${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export async function getRateHistory(buildingId) {
  const params = buildingId ? new URLSearchParams({ buildingId }).toString() : '';
  const qs = params ? `?${params}` : '';
  return serverFetch(`/settings/rate-history${qs}`, { method: 'GET' });
}
