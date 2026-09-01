import { cookies } from 'next/headers';

// Chấp nhận cả hai dạng cấu hình: có hậu tố "/api" hoặc chỉ origin.
// Base luôn được chuẩn hoá về dạng "<origin>/api" để các path như "/auth/login" ghép đúng.
const BACKEND_ORIGIN = (process.env.BACKEND_URL || 'http://localhost:3000')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const BACKEND_BASE = `${BACKEND_ORIGIN}/api`;

function parseSetCookie(sc) {
  const [pair, ...opts] = sc.split(';');
  const eqIdx = pair.indexOf('=');
  if (eqIdx === -1) return null;
  const name = pair.slice(0, eqIdx).trim();
  const value = pair.slice(eqIdx + 1).trim();
  const options = {};
  for (const opt of opts) {
    const idx = opt.indexOf('=');
    const k = (idx === -1 ? opt : opt.slice(0, idx)).trim().toLowerCase();
    const v = idx === -1 ? '' : opt.slice(idx + 1).trim();
    if (k === 'httponly') options.httpOnly = true;
    else if (k === 'secure') options.secure = true;
    else if (k === 'samesite') options.sameSite = v.toLowerCase();
    else if (k === 'max-age') options.maxAge = parseInt(v, 10);
    else if (k === 'path') options.path = v;
    else if (k === 'domain' && v) options.domain = v;
  }
  return { name, value, options };
}

// Hàm fetch server-side. Trả về { data, status } luôn (không throw) để tránh
// SSR crash khi backend lỗi network hoặc trả về 4xx. Các caller tự xử lý status.
export async function serverFetch(input, init = {}) {
  const cookieStore = await cookies();
  const cookieStr = cookieStore.toString();

  const url = input.startsWith('http') ? input : `${BACKEND_BASE}${input.startsWith('/') ? '' : '/'}${input}`;

  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json; charset=utf-8');
  if (cookieStr) headers.set('Cookie', cookieStr);
  init.headers = headers;

  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    const e = new Error(err.message || 'Network error');
    e.response = { status: 0, data: null, statusText: '' };
    throw e;
  }

  // Forward Set-Cookie từ backend về browser (fix lỗi "Token required")
  const setCookies = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  for (const sc of setCookies) {
    const parsed = parseSetCookie(sc);
    if (!parsed) continue;
    try {
      // maxAge <= 0 => xoá cookie (logout)
      cookieStore.set(parsed.name, parsed.value, parsed.options);
    } catch {
      /* ignore */
    }
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
