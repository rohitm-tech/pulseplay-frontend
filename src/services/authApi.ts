import api from '@/lib/api';
import type { AuthUser } from '@/store/auth/authSlice';

export async function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
  favoriteTeam?: string;
}): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
  const { data } = await api.post('/api/auth/register', payload);
  return data.data;
}

export async function loginRequest(payload: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
  const { data } = await api.post('/api/auth/login', payload);
  return data.data;
}

export async function meRequest(): Promise<AuthUser> {
  const { data } = await api.get('/api/auth/me');
  return data.data;
}
