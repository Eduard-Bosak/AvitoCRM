import { useQuery } from '@tanstack/react-query';
import { getBoardTasks } from '@/shared/api/boardsApi';
import type { Task } from '@/types';

/**
 * Хук для получения списка задач, принадлежащих конкретной доске
 * @param boardId - ID доски 
 */
export function useBoardTasks(boardId?: number) {
  return useQuery<Task[]>({
    queryKey: ['boardTasks', boardId],
    queryFn: async () => {
      if (!boardId) return [];
      
      try {
        console.log(`Fetching tasks for board ID: ${boardId}`);
        const result = await getBoardTasks(boardId);
        console.log(`Received ${result?.length || 0} tasks for board ID: ${boardId}`, result);
        return result || [];
      } catch (error) {
        console.error(`Error fetching board tasks for board ID: ${boardId}`, error);
        throw error;
      }
    },
    enabled: Boolean(boardId),
    staleTime: 30000, // 30 секунд до следующего автоматического обновления
  });
}
