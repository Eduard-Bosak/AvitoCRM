import { useQuery } from '@tanstack/react-query'
import { getTask } from '@/shared/api/tasksApi'
import type { Task } from '@/types'

export function useTask(id: number) {
  return useQuery<Task>({
    queryKey: ['task', id],
    queryFn: () => getTask(id).then(res => res.data),
    enabled: !!id,
  })
}
