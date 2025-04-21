import { api } from '@/shared/api/axios'
import type { Project } from '@/types'

/**
 * Fetch projects data from the boards endpoint
 * Since the backend doesn't have a dedicated projects endpoint,
 * we'll use the boards endpoint which contains similar data
 */
export const getProjects = () =>
  api.get('/boards').then(res => res.data.data as Project[])
