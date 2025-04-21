import { useQuery } from '@tanstack/react-query';
import { fetchBoards, fetchBoardTasks } from '@api/boardsApi';
import { Board } from '../types/board';

export const useBoards = () => {
  return useQuery<Board[], Error>({
    queryKey: ['boards'],
    queryFn: fetchBoards,
  });
};

export const useBoardTasks = (boardId: number) => {
  return useQuery({
    queryKey: ['board', boardId, 'tasks'],
    queryFn: () => fetchBoardTasks(boardId),
    enabled: !!boardId,
  });
};
