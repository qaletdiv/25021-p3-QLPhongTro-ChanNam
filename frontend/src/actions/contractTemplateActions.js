'use server';

import { serverFetch } from './serverFetch';

export async function getTemplate() {
  return serverFetch('/contracts/template', { method: 'GET' });
}

export async function saveTemplate(data) {
  return serverFetch('/contracts/template', { method: 'PUT', body: JSON.stringify(data) });
}
