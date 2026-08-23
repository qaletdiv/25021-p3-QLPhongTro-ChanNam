'use server';

import { cookies } from 'next/headers';

const BACKEND_BASE = (process.env.BACKEND_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

export async function serverFetch(input, init = {}) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const cookieStr = cookieStore.toString();

  const url = input.startsWith('http') ? input : `${BACKEND_BASE}${input.startsWith('/') ? '' : '/'}${input}`;

  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  if (cookieStr) headers.set('Cookie', cookieStr);
  init.headers = headers;
  init.credentials = 'include';

  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    const e = new Error(err.message || 'Network error');
    e.response = { status: 0, data: null, statusText: '' };
    throw e;
  }

  const text = await res.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* raw text */
  }

  if (!res.ok) {
    const err = new Error((data && data.message) || `HTTP ${res.status}`);
    err.response = { status: res.status, data, statusText: res.statusText };
    throw err;
  }

  return { data, status: res.status };
}
