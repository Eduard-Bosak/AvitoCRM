import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, patchTask } from '../api/tasksApi';
import type { Task } from '@/types';

/**
 * Хук для получения всех задач (issues) с помощью React Query v5 object-сигнатуры.
 */
export const useTasks = () =>
  useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

/**
 * Хук для частичного обновления задачи (Kanban drag-n-drop).
 * После успешного patchTask инвалидация tasks.
 */
export const usePatchTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: Parameters<typeof patchTask>) => patchTask(args[0], args[1]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};
