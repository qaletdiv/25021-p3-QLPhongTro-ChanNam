'use server';

import { serverFetch } from './serverFetch';

export async function getPublicBuildings() {
    const res = await serverFetch('/buildings/public', { method: 'GET' });
    return res.data.buildings;
}
