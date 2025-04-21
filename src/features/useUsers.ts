import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@api/usersApi';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    // Кэшируем список пользователей на 5 минут
    staleTime: 5 * 60 * 1000,
  });
};