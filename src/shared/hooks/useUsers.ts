import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/usersApi'

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
