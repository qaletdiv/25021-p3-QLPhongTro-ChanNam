'use server';

import { serverFetch } from './serverFetch';

export async function getPdfUrl(id) {
  return `/api/contracts/${id}/pdf`;
}

export async function getTemplate() {
  return serverFetch('/api/settings/rate-history', { method: 'GET' });
}

export async function saveTemplate(data) {
  return serverFetch('/api/settings', { method: 'POST', body: JSON.stringify(data) });
}
