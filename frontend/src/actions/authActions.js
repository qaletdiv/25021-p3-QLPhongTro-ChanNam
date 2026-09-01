'use server';

import { z } from 'zod';
import { serverFetch } from './serverFetch';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu tối thiểu 6 ký tự' }),
});

const registerSchema = z.object({
  name: z.string().min(1, { message: 'Tên không được để trống' }),
  email: z.string().email({ message: 'Email không hợp lệ' }),
  phone: z.string().regex(/^(0|\+84)[3-9]\d{8,9}$/, { message: 'Số điện thoại không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu tối thiểu 6 ký tự' }),
});

function firstError(parsed) {
  return parsed.error.errors[0]?.message || 'Dữ liệu không hợp lệ';
}

export async function loginFormAction(prevState, formData) {
  if (!(formData instanceof FormData)) {
    return { error: 'Trang đã cũ, vui lòng tải lại (F5) và thử lại.' };
  }
  const parsed = loginSchema.safeParse({
    email: String(formData.get('email') || '').trim(),
    password: String(formData.get('password') || ''),
  });
  if (!parsed.success) return { error: firstError(parsed) };
  const role = String(formData.get('role') || '');
  try {
    const res = await serverFetch('/auth/login', { method: 'POST', body: JSON.stringify(parsed.data) });
    return { ok: true, user: res.data.user, role };
  } catch (err) {
    const data = err.response?.data;
    if (Array.isArray(data?.error)) return { error: data.error.map((e) => e.msg).join('; ') };
    return { error: data?.message || 'Đăng nhập thất bại' };
  }
}

export async function registerFormAction(prevState, formData) {
  if (!(formData instanceof FormData)) {
    return { error: 'Trang đã cũ, vui lòng tải lại (F5) và thử lại.' };
  }
  const raw = {
    name: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    cccd: String(formData.get('cccd') || '').trim(),
    password: String(formData.get('password') || ''),
    confirmPassword: String(formData.get('confirmPassword') || ''),
  };
  if (raw.password !== raw.confirmPassword) return { error: 'Mật khẩu xác nhận không khớp' };

  let companions = [];
  try { companions = JSON.parse(String(formData.get('companions') || '[]')); } catch { companions = []; }
  const buildingId = String(formData.get('buildingId') || '').trim();
  if (!buildingId) return { error: 'Vui lòng chọn nhà trọ bạn đang thuê' };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { error: firstError(parsed) };

  const payload = { ...parsed.data, role: 'tenant', cccd: raw.cccd || undefined, companions, buildingId: Number(buildingId) };
  try {
    await serverFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    try { await serverFetch('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    return { ok: true, email: raw.email };
  } catch (err) {
    const data = err.response?.data;
    if (Array.isArray(data?.error)) return { error: data.error.map((e) => e.msg).join('; ') };
    return { error: data?.message || 'Đăng ký thất bại' };
  }
}

export async function register(data) {
  return serverFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function login(data) {
  return serverFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) });
}

export async function logout() {
  return serverFetch('/auth/logout', { method: 'POST' });
}

export async function getMe() {
  try {
    const res = await serverFetch('/auth/me', { method: 'GET' });
    return res;
  } catch (err) {
    // 401 (chưa đăng nhập) là trường hợp bình thường khi mở trang login.
    // Trả về user null thay vì ném lỗi, nếu không server action sẽ trả 500
    // và gây noise ở console mỗi khi load trang chưa xác thực.
    return { data: { user: null }, status: err.response?.status || 401 };
  }
}

export async function getTemplate() {
  return serverFetch('/contracts/template', { method: 'GET' });
}

export async function saveTemplate(data) {
  return serverFetch('/contracts/template', { method: 'PUT', body: JSON.stringify(data) });
}
