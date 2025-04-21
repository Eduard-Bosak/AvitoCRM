import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask } from '@api/tasksApi';
import type { Issue } from '@/types/issue';

/**
 * Хук для обновления задачи
 * @returns Мутация для обновления задачи
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (task: Issue) => updateTask(task),
    onSuccess: (updatedTask) => {
      // Обновляем кэш для конкретной задачи
      queryClient.setQueryData(['task', updatedTask.id], updatedTask);
      
      // Инвалидируем общие кэши для списков задач
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
      
      return updatedTask;
    }
  });
}
