'use server';
import { serverFetch } from './serverFetch';
export async function getUsers(params) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return serverFetch(`/admin/users${qs}`, { method: 'GET' });
}
export async function revokeSession(id) {
  return serverFetch(`/admin/users/${id}/revoke`, { method: 'POST' });
}
export async function disableAccount(id) {
  return serverFetch(`/admin/users/${id}/disable`, { method: 'POST' });
}
export async function enableAccount(id) {
  return serverFetch(`/admin/users/${id}/enable`, { method: 'POST' });
}
export async function changeUserPassword(id, newPassword) {
  return serverFetch(`/admin/users/${id}/change-password`, { method: 'POST', body: JSON.stringify({ newPassword }) });
}
export async function deleteAccount(id) {
  return serverFetch(`/admin/users/${id}/delete`, { method: 'POST' });
}
