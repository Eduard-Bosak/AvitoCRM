import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaskPriority } from '@/shared/api/tasksApi';

/**
 * Хук для обновления приоритета задачи в Канбан-доске
 * При успешном обновлении инвалидирует релевантные запросы
 * @returns Объект мутации для изменения приоритета задачи
 */
export function useUpdateIssuePriority() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: [number | string, string]) => {
      // Деструктурируем параметры из массива
      const [id, priority] = params;
      
      // Преобразуем строковый id в число, если это необходимо
      const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Отображение для обеспечения использования правильных значений приоритета, поддерживаемых бэкендом
      const priorityMap: Record<string, string> = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'низкий': 'Low',
        'средний': 'Medium',
        'высокий': 'High',
        // Добавьте любые пользовательские отображения при необходимости
      };

      // Используем отображенный приоритет или оригинальный, если отображение не существует
      // Первая буква заглавная, если нет в карте отображения
      const normalizedPriority = priorityMap[priority] || 
        (priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase());
      
      console.log(`Обновление приоритета задачи ID: ${taskId}, новый приоритет: ${normalizedPriority}`);
      
      // Напрямую вызываем API без дополнительной обработки результатов
      return updateTaskPriority(taskId, normalizedPriority);
    },
    
    onSuccess: (result, variables) => { 
      console.log('Приоритет задачи успешно обновлен:', result);
      
      // Инвалидируем все связанные запросы
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['board-tasks'] });
      qc.invalidateQueries({ queryKey: ['boardTasks'] });
      
      // Инвалидируем конкретную задачу
      qc.invalidateQueries({ queryKey: ['task', variables[0]] });
    },
    
    onError: (error, variables) => {
      console.error(`Ошибка при обновлении приоритета задачи ${variables[0]}:`, error);
    }
  });
}