import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTask } from '@/shared/api/tasksApi';

/**
 * Хук для удаления задачи с улучшенной логикой обработки ошибок и обновления состояния
 * Обеспечивает синхронизированное удаление задач во всех представлениях (Канбан, список задач и т.д.)
 * @returns {Object} Объект мутации для удаления задачи
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number | string) => {
      console.log(`useDeleteTask: Запрос на удаление задачи с ID: ${id}`);
      return deleteTask(id);
    },
    
    onMutate: async (taskId) => {
      // Сохраняем предыдущее состояние для возможного отката
      const normalizedId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
      
      // Отменяем все выполняющиеся запросы, которые могут затронуть эти данные
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['boardTasks'] });
      await queryClient.cancelQueries({ queryKey: ['task', normalizedId] });
      
      // Сохраняем предыдущее состояние
      const previousTasks = queryClient.getQueryData(['tasks']);
      const previousBoardTasks = queryClient.getQueryData(['boardTasks']);
      
      // Выполняем оптимистичное обновление
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.filter((task) => task.id !== normalizedId);
      });
      
      queryClient.setQueriesData({ queryKey: ['boardTasks'] }, (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.filter((task) => task.id !== normalizedId);
      });
      
      // Обновляем кеши для всех досок
      const boardQueries = queryClient.getQueriesData({ queryKey: ['board'] });
      boardQueries.forEach(([key, data]) => {
        if (data && typeof data === 'object' && data.tasks && Array.isArray(data.tasks)) {
          queryClient.setQueryData(key, {
            ...data,
            tasks: data.tasks.filter((task: any) => task.id !== normalizedId)
          });
        }
      });
      
      // Удаляем задачу из кеша по ID
      queryClient.setQueryData(['task', normalizedId], null);
      
      return { previousTasks, previousBoardTasks, taskId: normalizedId };
    },
    
    onSuccess: (result, variables, context) => {
      console.log(`useDeleteTask: Успешное удаление задачи ${variables}`, result);
      
      // Преобразуем ID задачи к числовому типу, если это строка
      const taskId = typeof variables === 'string' ? parseInt(variables, 10) : variables;
      
      // Инвалидируем кеши, чтобы обновить данные при следующем запросе
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['boardTasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      
      // Также инвалидируем все запросы для конкретных досок
      const boardQueries = queryClient.getQueriesData({ queryKey: ['board'] });
      boardQueries.forEach(([key]) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      
      // Удаляем задачу из всех кешей по всем ключам
      queryClient.removeQueries({ queryKey: ['task', taskId] });
      
      return result;
    },
    
    onError: (error, variables, context: any) => {
      console.error(`useDeleteTask: Ошибка при удалении задачи ${variables}:`, error);
      
      // Восстанавливаем предыдущее состояние в случае ошибки
      if (context && context.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      
      if (context && context.previousBoardTasks) {
        queryClient.setQueryData(['boardTasks'], context.previousBoardTasks);
      }
    },
    
    onSettled: () => {
      // После завершения операции (успешно или с ошибкой) инвалидируем все связанные запросы
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boardTasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    
    // Включаем автоматический retry для обработки сетевых сбоев
    retry: 1,
  });
}