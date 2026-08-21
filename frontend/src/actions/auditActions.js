'use server';
import { serverFetch } from './serverFetch';
export async function getAuditLogs(params) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return serverFetch(`/audit${qs}`, { method: 'GET' });
}
