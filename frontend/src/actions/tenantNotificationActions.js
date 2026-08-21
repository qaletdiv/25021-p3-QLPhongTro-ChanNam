'use server';
import { serverFetch } from './serverFetch';
export async function getTenantNotifications() {
  return serverFetch('/tenant/notifications', { method: 'GET' });
}
export async function markTenantNotificationsRead(items) {
  return serverFetch('/tenant/notifications/read', { method: 'POST', body: JSON.stringify({ items }) });
}
