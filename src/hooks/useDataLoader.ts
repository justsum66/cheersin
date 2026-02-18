/**
 * Phase 3 Stage 2: useDataLoader Hook
 * Generic data loading pattern with caching, retry, and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'

type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

interface DataLoaderOptions<T> {
  /** Enable caching of loaded data */
  cache?: boolean
  /** Cache key for identifying cached data */
  cacheKey?: string
  /** Maximum number of retry attempts */
  maxRetries?: number
  /** Delay between retry attempts (ms) */
  retryDelay?: number
  /** Enable automatic refetch on window focus */
  refetchOnWindowFocus?: boolean
  /** Enable automatic refetch on network reconnect */
  refetchOnReconnect?: boolean
  /** Stale time before considering data outdated (ms) */
  staleTime?: number
  /** Keep previous data while loading new data */
  keepPreviousData?: boolean
}

interface DataLoaderResult<T> {
  data: T | null
  error: Error | null
  status: FetchStatus
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  isIdle: boolean
  refetch: () => Promise<void>
  reset: () => void
}

// Simple in-memory cache
const dataCache = new Map<string, { data: any; timestamp: number }>()

/**
 * Generic data loader hook for handling async data fetching with advanced features
 */
export function useDataLoader<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = [],
  options: DataLoaderOptions<T> = {}
): DataLoaderResult<T> {
  const {
    cache = false,
    cacheKey,
    maxRetries = 3,
    retryDelay = 1000,
    refetchOnWindowFocus = false,
    refetchOnReconnect = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    keepPreviousData = false
  } = options

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [retryCount, setRetryCount] = useState(0)
  const previousDataRef = useRef<T | null>(null)
  
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  // Cache key generation
  const effectiveCacheKey = cacheKey || JSON.stringify(deps)

  // Check if cached data is still valid
  const isCacheValid = useCallback((key: string) => {
    if (!cache) return false
    const cached = dataCache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < staleTime
  }, [cache, staleTime])

  // Get cached data
  const getCachedData = useCallback((key: string) => {
    if (!cache) return null
    const cached = dataCache.get(key)
    return cached ? cached.data : null
  }, [cache])

  // Set cached data
  const setCachedData = useCallback((key: string, data: T) => {
    if (!cache) return
    dataCache.set(key, { data, timestamp: Date.now() })
  }, [cache])

  // Clear cache
  const clearCache = useCallback((key?: string) => {
    if (key) {
      dataCache.delete(key)
    } else {
      dataCache.clear()
    }
  }, [])

  // Main loading function
  const loadData = useCallback(async (isRetry = false) => {
    // Check cache first
    if (!isRetry && isCacheValid(effectiveCacheKey)) {
      const cachedData = getCachedData(effectiveCacheKey)
      if (cachedData !== null) {
        setData(cachedData)
        setStatus('success')
        setError(null)
        return
      }
    }

    setStatus('loading')
    if (!keepPreviousData) {
      setError(null)
    }

    try {
      const result = await loaderRef.current()
      
      setData(result)
      setStatus('success')
      setError(null)
      setRetryCount(0)
      
      // Cache the result
      setCachedData(effectiveCacheKey, result)
      
    } catch (err) {
      const typedError = err instanceof Error ? err : new Error(String(err))
      
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1)
        setStatus('idle') // Reset to idle to allow retry
        setTimeout(() => {
          loadData(true)
        }, retryDelay * Math.pow(2, retryCount)) // Exponential backoff
        return
      }
      
      setError(typedError)
      setStatus('error')
      setRetryCount(0)
    }
  }, [
    effectiveCacheKey,
    isCacheValid,
    getCachedData,
    setCachedData,
    keepPreviousData,
    retryCount,
    maxRetries,
    retryDelay
  ])

  // Refetch function
  const refetch = useCallback(async () => {
    // Clear cache for this key before refetching
    clearCache(effectiveCacheKey)
    await loadData()
  }, [loadData, clearCache, effectiveCacheKey])

  // Reset function
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setStatus('idle')
    setRetryCount(0)
    clearCache(effectiveCacheKey)
  }, [clearCache, effectiveCacheKey])

  // Store previous data when loading
  useEffect(() => {
    if (status === 'loading' && keepPreviousData && data !== null) {
      previousDataRef.current = data
    }
  }, [status, keepPreviousData, data])

  // Initial load effect
  useEffect(() => {
    loadData()
  }, [loadData, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      if (status === 'success' && isCacheValid(effectiveCacheKey)) {
        refetch()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, status, isCacheValid, effectiveCacheKey, refetch])

  // Network reconnect refetch
  useEffect(() => {
    if (!refetchOnReconnect) return

    const handleOnline = () => {
      if (status === 'error') {
        refetch()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [refetchOnReconnect, status, refetch])

  return {
    data: status === 'loading' && keepPreviousData ? previousDataRef.current : data,
    error,
    status,
    isLoading: status === 'loading',
    isError: status === 'error',
    isSuccess: status === 'success',
    isIdle: status === 'idle',
    refetch,
    reset
  }
}

/**
 * Specialized hook for paginated data loading
 */
export function usePaginatedDataLoader<T>(
  loader: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  pageSize: number = 20,
  options: Omit<DataLoaderOptions<T[]>, 'cacheKey'> = {}
) {
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [allData, setAllData] = useState<T[]>([])

  const { data, ...rest } = useDataLoader(
    () => loader(page, pageSize),
    [page, pageSize],
    {
      ...options,
      cacheKey: `paginated_page_${page}`
    }
  )

  // Handle data updates
  useEffect(() => {
    if (data && data.data) {
      if (page === 1) {
        setAllData(data.data)
      } else {
        setAllData(prev => [...prev, ...data.data])
      }
      setHasMore(allData.length + data.data.length < data.total)
    }
  }, [data, page, allData.length])

  const loadMore = useCallback(() => {
    if (hasMore && !rest.isLoading) {
      setPage(prev => prev + 1)
    }
  }, [hasMore, rest.isLoading])

  const resetPagination = useCallback(() => {
    setPage(1)
    setAllData([])
    setHasMore(true)
    rest.reset()
  }, [rest])

  return {
    ...rest,
    data: allData,
    currentPage: page,
    hasMore,
    loadMore,
    reset: resetPagination,
    goToPage: setPage
  }
}

/**
 * Hook for batch data loading with progress tracking
 */
export function useBatchDataLoader<T, R>(
  items: T[],
  loader: (item: T) => Promise<R>,
  batchSize: number = 5,
  options: DataLoaderOptions<R[]> = {}
) {
  const [progress, setProgress] = useState({ loaded: 0, total: items.length })
  const [results, setResults] = useState<R[]>([])

  const { data, ...rest } = useDataLoader(
    async () => {
      const batchResults: R[] = []
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        const batchPromises = batch.map(item => loader(item))
        const batchResultsChunk = await Promise.all(batchPromises)
        
        batchResults.push(...batchResultsChunk)
        setProgress({ loaded: Math.min(i + batchSize, items.length), total: items.length })
      }
      
      setResults(batchResults)
      return batchResults
    },
    [items, batchSize],
    options
  )

  return {
    ...rest,
    data: data || results,
    progress,
    isComplete: progress.loaded === progress.total && progress.total > 0
  }
}