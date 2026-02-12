/**
 * R2-025：react-query 共用 QueryClient — 統一 staleTime、retry
 * PERF-005：staleTime/gcTime 一致，refetchOnWindowFocus: false 避免過度 refetch
 */
import { QueryClient } from '@tanstack/react-query'

const STALE_TIME_MS = 2 * 60 * 1000 // 2 分鐘
const CACHE_TIME_MS = 5 * 60 * 1000 // 5 分鐘（inactive 保留）

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: CACHE_TIME_MS,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

let browserClient: QueryClient | undefined
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserClient) browserClient = makeQueryClient()
  return browserClient
}
