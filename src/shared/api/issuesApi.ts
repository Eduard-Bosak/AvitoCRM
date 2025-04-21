import { api } from '@/shared/api/axios'
import type { Issue } from '@/types'

export const getIssues = () =>
  api.get('/tasks').then(res => res.data.data as Issue[])

/**
 * Обновляет данные задачи с улучшенной обработкой ошибок
 * @param id - ID задачи для обновления
 * @param payload - Объект с обновляемыми полями
 * @param signal - AbortSignal для возможности отмены запроса при навигации
 * @returns Обновленная задача
 */
export const patchIssue = (id: number, payload: Partial<Issue>, signal?: AbortSignal) => {
  console.log(`Отправка запроса на обновление задачи ${id} с данными:`, payload);
  
  // Правильный путь для обновления задачи
  const endpoint = `/tasks/update/${id}`;
  
  return api.put(endpoint, payload, { signal })
    .then(res => {
      console.log(`Успешно обновлена задача ${id}:`, res.data);
      return res.data.data as Issue;
    })
    .catch((error) => {
      // Если запрос был отменен, не обрабатываем как ошибку
      if (error.name === 'CanceledError' || error.code === 'ECONNABORTED') {
        console.log('Request was canceled', id);
        return null;
      }
      console.error(`Error updating issue ${id}:`, error);
      throw error;
    })
}

/**
 * Обновляет статус задачи
 * @param id - ID задачи
 * @param status - Новый статус
 * @returns Обновленная задача
 */
export const updateIssueStatus = (id: number | string, status: string) => {
  console.log(`Обновление статуса задачи ${id} на ${status}`);
  
  // Преобразуем ID в число, если нужно
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return api.patch(`/tasks/${taskId}/status`, { status })
    .then(res => {
      console.log(`Статус задачи ${taskId} обновлен:`, res.data);
      return res.data.data;
    })
    .catch(error => {
      console.error(`Ошибка при обновлении статуса задачи ${taskId}:`, error);
      throw error;
    });
}

/**
 * Обновляет приоритет задачи
 * @param id - ID задачи
 * @param priority - Новый приоритет
 * @returns Обновленная задача
 */
export const updateIssuePriority = (id: number | string, priority: string) => {
  console.log(`Обновление приоритета задачи ${id} на ${priority}`);
  
  // Преобразуем ID в число, если нужно
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return api.put(`/tasks/update/${taskId}`, { priority })
    .then(res => {
      console.log(`Приоритет задачи ${taskId} обновлен:`, res.data);
      return res.data.data;
    })
    .catch(error => {
      console.error(`Ошибка при обновлении приоритета задачи ${taskId}:`, error);
      throw error;
    });
}
