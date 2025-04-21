import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '@/shared/api/tasksApi';
import type { NewTaskPayload } from '@/types';

/** Хук: создать задачу */
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewTaskPayload) => createTask(payload),
    onSuccess: (_, variables) => { 
      qc.invalidateQueries({ queryKey: ['tasks'] }); 
      // Also invalidate board tasks to update Kanban board
      qc.invalidateQueries({ queryKey: ['boardTasks', variables.boardId] });
    },
  });
}
