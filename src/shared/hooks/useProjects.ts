import { useQuery } from '@tanstack/react-query'
import { getProjects } from '@/shared/api/projectsApi'

export const useProjects = () =>
  useQuery({ queryKey: ['projects'], queryFn: getProjects })
