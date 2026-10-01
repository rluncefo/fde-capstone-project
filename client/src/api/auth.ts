import apiClient from './client';
import type { User } from '../types';

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  const { data } = await apiClient.post<{ token: string; user: User }>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me');
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
