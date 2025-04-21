/* eslint-disable import/prefer-default-export */
import { api } from '@/shared/api/axios';
import type { Board, NewBoardPayload, UpdateBoardPayload, Task } from '@/types';

export const getBoards = () =>
  api.get<{ data: Board[] }>('/boards').then(res => res.data.data);

export function getBoard(id: number) {
  return api.get<{ data: Board }>(`/boards/${id}`).then(res => res.data.data);
}

export function createBoard(payload: NewBoardPayload) {
  return api.post<{ data: Board }>('/boards', payload).then(res => res.data.data);
}

export function updateBoard(id: number, data: UpdateBoardPayload) {
  return api.put<{ data: Board }>(`/boards/${id}`, data).then(res => res.data.data);
}

/** GET /boards/:id/tasks - get tasks on a board */
export function getBoardTasks(id: number) {
  return api.get<{ data: Task[] }>(`/boards/${id}/tasks`).then(res => res.data.data);
}
