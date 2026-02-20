import { QueryClient, queryOptions } from '@tanstack/react-query'
import { getMe } from './auth'

export const queryClient = new QueryClient()

export const getMeQueryOptions = queryOptions({
  queryKey: ['me'],
  queryFn: () => getMe(),
  // User data only changes on login/logout, both of which explicitly invalidate
  // this query. Never refetch automatically.
  staleTime: Infinity,
})
