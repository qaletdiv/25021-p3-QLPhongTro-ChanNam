'use server';

import { serverFetch } from './serverFetch';

export async function getPdfUrl(id) {
  return `/api/contracts/${id}/pdf`;
}
