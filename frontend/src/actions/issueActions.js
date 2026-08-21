'use server';
import { serverFetch } from './serverFetch';
export async function getIssues() {
  return serverFetch('/issues', { method: 'GET' });
}
export async function getPendingIssuesCount() {
  return serverFetch('/issues/pending-count', { method: 'GET' });
}
export async function updateIssueStatus(id, status) {
  return serverFetch(`/issues/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
