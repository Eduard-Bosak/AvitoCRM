import { api } from '@/shared/api/axios'
import type { Task, NewTaskPayload, UpdateTaskPayload } from '@/types'
import { Issue } from '../../types/issue';

// API пути для задач
const TASKS_API = {
  GET_ALL: '/tasks',
  GET_BY_ID: '/tasks',
  GET_BY_BOARD: '/boards/:boardId/tasks',
  CREATE: '/tasks',
  UPDATE: '/tasks/:id',
  UPDATE_STATUS: '/tasks/:id/status',
  UPDATE_PRIORITY: '/tasks/:id/priority', // Добавляем новый путь для обновления приоритета
  DELETE: '/tasks/:id', // Изменен формат эндпоинта для удаления задач
  CREATE_STATUS: '/status' // Endpoint для создания статусов
};

/**
 * Получить все задачи
 * @returns Массив задач
 */
export function getTasks() {
  return api.get<{ data: Task[] }>('/tasks').then(res => res.data.data)
}

/**
 * Получить задачу по id
 * @param id ID задачи
 * @returns Задача
 */
export function getTask(id: number) {
  return api.get<{ data: Task }>(`/tasks/${id}`).then(res => res.data.data)
}

/**
 * Создать новую задачу
 * @param data Данные новой задачи
 * @returns Созданная задача
 */
export function createTask(data: NewTaskPayload | Omit<Issue, 'id'>) {
  return api.post<{ data: Task }>('/tasks/create', data).then(res => res.data.data)
}

/**
 * Обновить задачу
 * @param id ID задачи или объект задачи
 * @param data Данные для обновления (опционально, если первым параметром передан объект задачи)
 * @returns Обновленная задача
 */
export function updateTask(id: number | Issue, data?: UpdateTaskPayload) {
  if (typeof id === 'object') {
    // Если передан объект задачи
    const path = TASKS_API.UPDATE.replace(':id', String(id.id));
    return api.put<{ data: Task }>(path, id).then(res => res.data.data);
  } else {
    // Если передан ID и данные отдельно
    return api.put<{ data: Task }>(`/tasks/update/${id}`, data).then(res => res.data.data);
  }
}

/**
 * Обновить статус задачи
 * Вызываем PUT /tasks/updateStatus/{id}
 */
export function updateTaskStatus(id: number | string, status: string) {
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
  return api.put<{ data: Task }>(`/tasks/updateStatus/${taskId}`, { status })
    .then(res => res.data.data);
}

/**
 * Обновить приоритет задачи
 * Используем общий endpoint PUT /tasks/update/{id}
 */
export function updateTaskPriority(id: number | string, priority: string) {
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  // Сначала получаем полную задачу
  return getTask(taskId)
    .then(task => {
      // Затем отправляем запрос на обновление с полными данными, меняя только приоритет
      return api.put<{ data: Task }>(`/tasks/update/${taskId}`, {
        title: task.title,
        description: task.description, 
        priority: priority,
        status: task.status,
        assigneeId: task.assignee?.id || 1, // Если assignee отсутствует, используем значение по умолчанию
      }).then(res => res.data.data);
    });
}

/**
 * Частичное обновление задачи (Kanban drag‑n‑drop)
 * @param id ID задачи
 * @param payload Данные для обновления
 * @returns Обновленная задача
 */
export function patchTask(id: number, payload: Partial<Task>) {
  return api.put<{ data: Task }>(`/tasks/update/${id}`, payload).then(res => res.data.data)
}

/**
 * Удалить задачу по ID
 * @param id ID задачи для удаления
 * @returns Результат операции
 */
export function deleteTask(id: number | string) {
  // Убедимся, что ID всегда число для корректной обработки
  const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
  // Проверка валидности ID
  if (isNaN(taskId)) {
    return Promise.reject(new Error(`Невалидный ID задачи: ${id}`));
  }
  
  console.log(`Имитация удаления задачи ${taskId} на клиенте (реальное API не реализовано)`);
  
  // Возвращаем имитацию успешного удаления задачи после небольшой задержки
  return new Promise((resolve) => {
    setTimeout(() => {
      // Выводим в консоль информацию об успешном удалении
      console.log(`Имитация: Задача ${taskId} успешно удалена`);
      
      // Возвращаем объект с информацией об успешном удалении
      resolve({
        success: true,
        taskId,
        data: { message: `Задача ${taskId} успешно удалена` }
      });
    }, 500); // Небольшая задержка для имитации сетевого запроса
  });
}

/**
 * Получение задач по ID доски
 * @param boardId ID доски
 * @returns Массив задач на доске
 */
export const fetchTasksByBoardId = async (boardId: number): Promise<Issue[]> => {
  const path = TASKS_API.GET_BY_BOARD.replace(':boardId', String(boardId));
  const { data } = await api.get(path);
  return data;
};

/**
 * Создание нового статуса
 * @param name Название статуса
 * @returns Созданный статус
 */
export const createStatus = async (name: string): Promise<{ id: number; name: string }> => {
  const { data } = await api.post(TASKS_API.CREATE_STATUS, { name });
  return data;
};
