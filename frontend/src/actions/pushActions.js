'use server';
import { serverFetch } from './serverFetch';
export async function getVapidKey() {
  return serverFetch('/push/vapid', { method: 'GET' });
}
export async function subscribePush(subscription) {
  return serverFetch('/push/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
}
