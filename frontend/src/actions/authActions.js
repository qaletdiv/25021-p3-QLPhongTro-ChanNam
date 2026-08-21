'use server';

import { serverFetch } from './serverFetch';

export async function register(data) {
  return serverFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function login(data) {
  const res = await serverFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  return res;
}

export async function logout() {
  return serverFetch('/auth/logout', { method: 'POST' });
}

export async function getMe() {
  return serverFetch('/auth/me', { method: 'GET' });
}
