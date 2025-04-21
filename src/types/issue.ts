import { ApiResponse } from './board';

export type IssueStatus = 'Backlog' | 'InProgress' | 'Done' | string;
export type IssuePriority = 'Low' | 'Medium' | 'High';

export interface User {
  id: number | string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface Issue {
  id: number | string;
  title: string;
  description: string;
  status: IssueStatus;
  priority?: IssuePriority;
  reporter?: User;
  assignee?: User;
  createdAt: string; // строка в формате ISO даты
  updatedAt: string; // строка в формате ISO даты
  dueDate?: string;  // строка в формате ISO даты
}

export interface IssueComment {
  id: number | string;
  issueId: number | string;
  author: User;
  content: string;
  createdAt: string;  // строка в формате ISO даты
}

export const STATUS_LABELS: Record<string, string> = {
  'Backlog': 'Бэклог',
  'InProgress': 'В работе',
  'Done': 'Готово',
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  'Low': 'Низкий',
  'Medium': 'Средний',
  'High': 'Высокий',
};

// Интерфейс для пользовательского статуса
export interface CustomStatus {
  key: string;
  label: string;
}

/**
 * Функция для проверки, является ли статус одним из стандартных
 */
export const isDefaultStatus = (status: string): boolean => {
  return ['Backlog', 'InProgress', 'Done'].includes(status);
};
