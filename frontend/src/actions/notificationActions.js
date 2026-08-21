'use server';
import { serverFetch } from './serverFetch';
export async function getNotifications() {
  return serverFetch('/notifications', { method: 'GET' });
}
export async function createNotification(data) {
  return serverFetch('/notifications', { method: 'POST', body: JSON.stringify(data) });
}
