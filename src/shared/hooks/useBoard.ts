import { useQuery } from '@tanstack/react-query';
import { getBoard } from '@/shared/api/boardsApi';
import type { Board } from '@/types';
export function useBoard(boardId?: number) {
  return useQuery<Board>({
    queryKey: ['board', boardId],
    queryFn: () => getBoard(boardId!).then(r => r.data),
    enabled: Boolean(boardId),
  });
}
