'use server';
import { serverFetch } from './serverFetch';
export async function getFingerprintHistory(params) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return serverFetch(`/fingerprints${qs}`, { method: 'GET' });
}
