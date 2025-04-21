/* eslint-disable import/prefer-default-export */
import { api } from '@/shared/api/axios';
import type { User } from '@/types';

/** Получить всех пользователей */
export const getUsers = () =>
  api.get<{ data: User[] }>('/users').then(res => res.data.data);

/** Получить одного пользователя */
export function getUser(id: number) {
  return apiClient.get<User>(`/users/${id}`);
}