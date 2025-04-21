import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIssues, patchIssue, updateIssueStatus, updateIssuePriority } from '@/shared/api/issuesApi';
import { useBoards } from './useBoards';
import { Issue } from '@/types/issue';

/**
 * Hook для получения всех задач с обогащенными данными о досках
 * Комбинирует данные задач с именами досок для лучшего отображения в UI
 */
export const useIssues = () => {
  const { data: boards, isLoading: boardsLoading } = useBoards();
  
  const issuesQuery = useQuery({ 
    queryKey: ['issues'], 
    queryFn: getIssues,
    select: (data) => {
      if (!boards) return data;
      
      // Добавляем имя доски к каждой задаче на основе boardId
      return data.map(task => {
        const board = boards.find(b => b.id === task.boardId);
        return {
          ...task,
          boardName: board?.name || `Доска #${task.boardId}`
        };
      });
    },
    enabled: !boardsLoading // Загружаем задачи только когда загружены доски
  });
  
  return issuesQuery;
}

/**
 * Хук для обновления задачи (любые поля)
 */
export const usePatchIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['patchIssue'],
    mutationFn: ([id, payload]: [number, Partial<Issue>]) => {
      console.log('usePatchIssue: вызов с аргументами', { id, payload });
      return patchIssue(id, payload);
    },
    
    onSuccess: (data) => {
      console.log('usePatchIssue: задача обновлена успешно', data);
      
      // Инвалидируем все связанные запросы, чтобы UI обновился
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boardTasks'] });
      
      // Обновляем кеш конкретной задачи, если она существует
      if (data && data.id) {
        queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      }
    },
    
    onError: (error, variables) => {
      console.error(`usePatchIssue: ошибка при обновлении задачи ${variables[0]}:`, error);
    }
  });
}

/**
 * Хук для обновления статуса задачи
 */
export const useUpdateIssueStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['updateIssueStatus'],
    mutationFn: ([id, status]: [number | string, string]) => {
      console.log('useUpdateIssueStatus: вызов с аргументами', { id, status });
      return updateIssueStatus(id, status);
    },
    
    onSuccess: (data, variables) => {
      console.log(`useUpdateIssueStatus: статус задачи ${variables[0]} успешно обновлен на ${variables[1]}`, data);
      
      // Инвалидируем кеши для обновления UI
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boardTasks'] });
      
      // ID задачи может быть строкой или числом
      const taskId = typeof variables[0] === 'string' ? parseInt(variables[0], 10) : variables[0];
      if (!isNaN(taskId)) {
        queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      }
    },
    
    onError: (error, variables) => {
      console.error(`useUpdateIssueStatus: ошибка при обновлении статуса задачи ${variables[0]}:`, error);
    }
  });
}

/**
 * Хук для обновления приоритета задачи
 */
export const useUpdateIssuePriority = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['updateIssuePriority'],
    mutationFn: ([id, priority]: [number | string, string]) => {
      console.log('useUpdateIssuePriority: вызов с аргументами', { id, priority });
      return updateIssuePriority(id, priority);
    },
    
    onSuccess: (data, variables) => {
      console.log(`useUpdateIssuePriority: приоритет задачи ${variables[0]} успешно обновлен на ${variables[1]}`, data);
      
      // Инвалидируем кеши для обновления UI
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boardTasks'] });
      
      // ID задачи может быть строкой или числом
      const taskId = typeof variables[0] === 'string' ? parseInt(variables[0], 10) : variables[0];
      if (!isNaN(taskId)) {
        queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      }
    },
    
    onError: (error, variables) => {
      console.error(`useUpdateIssuePriority: ошибка при обновлении приоритета задачи ${variables[0]}:`, error);
    }
  });
}
