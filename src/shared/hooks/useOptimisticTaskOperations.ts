import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTaskStatus, updateTaskPriority } from '@/shared/api/tasksApi';
import { useDeleteTask } from './useDeleteTask';
import type { Issue } from '@/types/issue';

/**
 * Хук, предоставляющий оптимистичные мутации для операций с задачами
 * Реализует локальные изменения данных до получения ответа от сервера
 */
export const useOptimisticTaskOperations = () => {
  const queryClient = useQueryClient();
  
  // Используем готовый хук для удаления задач, 
  // чтобы обеспечить синхронизацию между всеми представлениями
  const deleteTaskMutation = useDeleteTask();

  /**
   * Мутация для изменения статуса задачи с оптимистичным UI-обновлением
   */
  const updateTaskStatusMutation = useMutation({
    // Обновлено: принимаем массив [id, status] как в других хуках
    mutationFn: (params: [number | string, string]) => {
      const [taskId, status] = params;
      // Симуляция запроса на сервер
      return new Promise<{ success: boolean; taskId: number | string; status: string }>((resolve) => {
        setTimeout(() => {
          resolve({ success: true, taskId, status });
        }, 800);
      });
    },
    onMutate: async (params) => {
      const [taskId, status] = params;
      
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['boardTasks'] });
      await queryClient.cancelQueries({ queryKey: ['task', taskId] });

      // Сохраняем предыдущее состояние
      const previousTasks = queryClient.getQueryData<Issue[]>(['tasks']);
      const previousBoardTasks = queryClient.getQueryData<Record<string, Issue[]>>(['boardTasks']);
      const previousTask = queryClient.getQueryData<Issue>(['task', taskId]);

      // Оптимистично обновляем задачи
      if (previousTasks) {
        queryClient.setQueryData<Issue[]>(['tasks'], 
          previousTasks.map(task => 
            task.id === taskId ? { ...task, status } : task
          )
        );
      }

      // Обновляем задачи на доске
      if (previousBoardTasks) {
        const updatedBoardTasks = { ...previousBoardTasks };
        
        Object.keys(updatedBoardTasks).forEach(boardId => {
          updatedBoardTasks[boardId] = updatedBoardTasks[boardId].map(task => 
            task.id === taskId ? { ...task, status } : task
          );
        });
        
        queryClient.setQueryData(['boardTasks'], updatedBoardTasks);
      }

      // Обновляем отдельную задачу, если она в кеше
      if (previousTask) {
        queryClient.setQueryData(['task', taskId], {
          ...previousTask,
          status
        });
      }

      return { previousTasks, previousBoardTasks, previousTask };
    },
    onError: (err, variables, context) => {
      const [taskId] = variables;
      
      // При ошибке откатываем изменения
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      if (context?.previousBoardTasks) {
        queryClient.setQueryData(['boardTasks'], context.previousBoardTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['task', taskId], context.previousTask);
      }
      
      console.error('Ошибка при изменении статуса задачи:', err);
    },
    onSettled: (data) => {
      // Обновляем кеш после завершения запроса
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boardTasks'] });
      
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['task', data.taskId] });
      }
    }
  });

  /**
   * Мутация для изменения приоритета задачи с оптимистичным UI-обновлением
   */
  const updateTaskPriorityMutation = useMutation({
    // Обновлено: принимаем массив [id, priority] как в других хуках
    mutationFn: (params: [number | string, string]) => {
      const [taskId, priority] = params;
      // Симуляция запроса на сервер
      return new Promise<{ success: boolean; taskId: number | string; priority: string }>((resolve) => {
        setTimeout(() => {
          resolve({ success: true, taskId, priority });
        }, 800);
      });
    },
    onMutate: async (params) => {
      const [taskId, priority] = params;
      
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['boardTasks'] });
      await queryClient.cancelQueries({ queryKey: ['task', taskId] });

      // Сохраняем предыдущее состояние
      const previousTasks = queryClient.getQueryData<Issue[]>(['tasks']);
      const previousBoardTasks = queryClient.getQueryData<Record<string, Issue[]>>(['boardTasks']);
      const previousTask = queryClient.getQueryData<Issue>(['task', taskId]);

      // Оптимистично обновляем задачи
      if (previousTasks) {
        queryClient.setQueryData<Issue[]>(['tasks'], 
          previousTasks.map(task => 
            task.id === taskId ? { ...task, priority } : task
          )
        );
      }

      // Обновляем задачи на доске
      if (previousBoardTasks) {
        const updatedBoardTasks = { ...previousBoardTasks };
        
        Object.keys(updatedBoardTasks).forEach(boardId => {
          updatedBoardTasks[boardId] = updatedBoardTasks[boardId].map(task => 
            task.id === taskId ? { ...task, priority } : task
          );
        });
        
        queryClient.setQueryData(['boardTasks'], updatedBoardTasks);
      }

      // Обновляем отдельную задачу, если она в кеше
      if (previousTask) {
        queryClient.setQueryData(['task', taskId], {
          ...previousTask,
          priority
        });
      }

      return { previousTasks, previousBoardTasks, previousTask };
    },
    onError: (err, variables, context) => {
      const [taskId] = variables;
      
      // При ошибке откатываем изменения
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      if (context?.previousBoardTasks) {
        queryClient.setQueryData(['boardTasks'], context.previousBoardTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['task', taskId], context.previousTask);
      }
      
      console.error('Ошибка при изменении приоритета задачи:', err);
    },
    onSettled: (data) => {
      // Обновляем кеш после завершения запроса
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boardTasks'] });
      
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['task', data.taskId] });
      }
    }
  });

  return {
    deleteTask: deleteTaskMutation,
    updateTaskStatus: updateTaskStatusMutation,
    updateTaskPriority: updateTaskPriorityMutation
  };
};