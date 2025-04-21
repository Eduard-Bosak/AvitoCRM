import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaskStatus } from '@/shared/api/tasksApi';

/**
 * Хук для обновления статуса задачи в Канбан-доске
 * При успешном обновлении инвалидирует запросы на получение задач и задач на доске
 * @returns Объект мутации для изменения статуса задачи
 */
export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: [number | string, string]) => {
      // Деструктурируем параметры из массива
      const [id, status] = params;
      
      // Преобразуем строковый id в число, если это необходимо
      const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Отображение для обеспечения использования правильных значений статуса, поддерживаемых бэкендом
      const statusMap: Record<string, string> = {
        'Backlog': 'Backlog',
        'InProgress': 'InProgress',
        'Done': 'Done',
        // Добавьте любые необходимые пользовательские отображения
      };

      // Используем отображенный статус или оригинальный, если отображение не существует
      const normalizedStatus = statusMap[status] || status;
      
      console.log(`Обновление статуса задачи ID: ${taskId}, новый статус: ${normalizedStatus}`);
      
      // Напрямую вызываем API без перехвата ошибок здесь
      return updateTaskStatus(taskId, normalizedStatus);
    },
    
    onSuccess: (result, variables) => { 
      console.log('Статус задачи успешно обновлен:', result);
      
      // Инвалидируем все связанные запросы
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['board-tasks'] }); // Правильный ключ для задач на доске
      qc.invalidateQueries({ queryKey: ['boardTasks'] });
      
      // Инвалидируем конкретную задачу
      qc.invalidateQueries({ queryKey: ['task', variables[0]] });
    },
    
    onError: (error: any, variables) => {
      console.error(`Ошибка при обновлении статуса задачи ${variables[0]}:`, error);
    }
  });
}
