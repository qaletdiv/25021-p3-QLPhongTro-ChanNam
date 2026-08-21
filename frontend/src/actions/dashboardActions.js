'use server';

import { serverFetch } from './serverFetch';

export async function getStats() {
  return serverFetch('/dashboard/stats', { method: 'GET' });
}

export async function getMonthlyRevenue() {
  return serverFetch('/dashboard/monthly-revenue', { method: 'GET' });
}

export async function getExpiringContracts() {
  return serverFetch('/dashboard/expiring-contracts', { method: 'GET' });
}

export async function getNotifications() {
  return serverFetch('/dashboard/notifications', { method: 'GET' });
}

export async function getUtilityUsage(buildingId) {
  const params = buildingId ? new URLSearchParams({ buildingId }).toString() : '';
  const qs = params ? `?${params}` : '';
  return serverFetch(`/dashboard/utility-usage${qs}`, { method: 'GET' });
}

export async function getRateHistory(buildingId) {
  const params = buildingId ? new URLSearchParams({ buildingId }).toString() : '';
  const qs = params ? `?${params}` : '';
  return serverFetch(`/settings/rate-history${qs}`, { method: 'GET' });
}
