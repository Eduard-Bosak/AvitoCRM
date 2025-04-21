import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBoards, createBoard, updateBoard } from '../api/boardsApi'
import type { Board } from '@/types'

export const useBoards = () =>
  useQuery({
    queryKey: ['boards'],
    queryFn: getBoards,
  })

export const useCreateBoard = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { name: string }) => createBoard(data),
    onSuccess: () => {
      // Инвалидируем кэш, чтобы обновить список досок
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
  })
}

export const useUpdateBoard = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number, data: Partial<Board> }) => 
      updateBoard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
  })
}
