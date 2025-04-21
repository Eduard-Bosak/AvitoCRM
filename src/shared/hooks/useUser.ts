import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/shared/api/usersApi';
import type { User } from '@/types';
export function useUser(userId?: number) {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId!).then(r => r.data),
    enabled: Boolean(userId),
  });
}
