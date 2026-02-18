/**
 * Phase 3 Stage 2: useSubscriptionManager Hook
 * Generic subscription management pattern for event-based systems
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

type UnsubscribeFunction = () => void

interface SubscriptionOptions {
  /** Enable automatic resubscription on failure */
  autoResubscribe?: boolean
  /** Maximum retry attempts */
  maxRetries?: number
  /** Delay between retry attempts (ms) */
  retryDelay?: number
  /** Buffer events when unsubscribed */
  bufferEvents?: boolean
  /** Maximum buffer size */
  maxBufferSize?: number
}

interface SubscriptionState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isSubscribed: boolean
  retryCount: number
}

/**
 * Generic subscription manager hook for handling event-based data streams
 */
export function useSubscriptionManager<T>(
  subscribeFn: (callback: (data: T) => void) => UnsubscribeFunction,
  options: SubscriptionOptions = {}
) {
  const {
    autoResubscribe = true,
    maxRetries = 3,
    retryDelay = 1000,
    bufferEvents = false,
    maxBufferSize = 100
  } = options

  const [state, setState] = useState<SubscriptionState<T>>({
    data: null,
    error: null,
    isLoading: true,
    isSubscribed: false,
    retryCount: 0
  })

  const unsubscribeRef = useRef<UnsubscribeFunction | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventBufferRef = useRef<T[]>([])
  const isMountedRef = useRef(true)

  // Clear retry timeout
  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  // Handle subscription data
  const handleData = useCallback((data: T) => {
    if (!isMountedRef.current) return

    // Buffer events if not subscribed
    if (bufferEvents && !state.isSubscribed) {
      eventBufferRef.current.push(data)
      if (eventBufferRef.current.length > maxBufferSize) {
        eventBufferRef.current.shift()
      }
      return
    }

    setState(prev => ({
      ...prev,
      data,
      error: null,
      isLoading: false
    }))
  }, [state.isSubscribed, bufferEvents, maxBufferSize])

  // Handle subscription error
  const handleError = useCallback((error: Error) => {
    if (!isMountedRef.current) return

    setState(prev => ({
      ...prev,
      error,
      isLoading: false
    }))

    // Auto-resubscribe on error
    if (autoResubscribe && state.retryCount < maxRetries) {
      clearRetryTimeout()
      retryTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            retryCount: prev.retryCount + 1
          }))
          subscribe()
        }
      }, retryDelay * Math.pow(2, state.retryCount))
    }
  }, [autoResubscribe, maxRetries, retryDelay, state.retryCount, clearRetryTimeout])

  // Subscribe function
  const subscribe = useCallback(() => {
    if (!isMountedRef.current) return

    // Clear existing subscription
    unsubscribe()

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }))

    try {
      const unsubscribeFn = subscribeFn(handleData)
      unsubscribeRef.current = unsubscribeFn
      
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        retryCount: 0
      }))

      // Process buffered events
      if (bufferEvents && eventBufferRef.current.length > 0) {
        const bufferedEvents = [...eventBufferRef.current]
        eventBufferRef.current = []
        bufferedEvents.forEach(event => handleData(event))
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)))
    }
  }, [subscribeFn, handleData, handleError, bufferEvents])

  // Unsubscribe function
  const unsubscribe = useCallback(() => {
    clearRetryTimeout()
    
    if (unsubscribeRef.current) {
      try {
        unsubscribeRef.current()
      } catch (error) {
        console.warn('Error during unsubscribe:', error)
      }
      unsubscribeRef.current = null
    }

    setState(prev => ({
      ...prev,
      isSubscribed: false
    }))
  }, [clearRetryTimeout])

  // Reset function
  const reset = useCallback(() => {
    unsubscribe()
    eventBufferRef.current = []
    setState({
      data: null,
      error: null,
      isLoading: true,
      isSubscribed: false,
      retryCount: 0
    })
  }, [unsubscribe])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      clearRetryTimeout()
      unsubscribe()
    }
  }, [unsubscribe, clearRetryTimeout])

  // Initial subscription
  useEffect(() => {
    subscribe()
    return unsubscribe
  }, [subscribe, unsubscribe])

  return {
    ...state,
    subscribe,
    unsubscribe,
    reset,
    buffer: bufferEvents ? eventBufferRef.current : undefined
  }
}

/**
 * Hook for managing multiple subscriptions with shared state
 */
export function useMultiSubscriptionManager<T extends Record<string, any>>(
  subscriptions: {
    [K in keyof T]: {
      subscribe: (callback: (data: T[K]) => void) => UnsubscribeFunction
      options?: SubscriptionOptions
    }
  }
) {
  const [states, setStates] = useState<Record<keyof T, SubscriptionState<T[keyof T]>>>(() => {
    const initialState: any = {}
    Object.keys(subscriptions).forEach(key => {
      initialState[key] = {
        data: null,
        error: null,
        isLoading: true,
        isSubscribed: false,
        retryCount: 0
      }
    })
    return initialState
  })

  const unsubscribeRefs = useRef<Record<string, UnsubscribeFunction | null>>({})
  const isMountedRef = useRef(true)

  const updateState = useCallback(<K extends keyof T>(
    key: K,
    updater: (prevState: SubscriptionState<T[K]>) => SubscriptionState<T[K]>
  ) => {
    if (!isMountedRef.current) return
    
    setStates(prev => ({
      ...prev,
      [key]: updater(prev[key] as SubscriptionState<T[K]>)
    }))
  }, [])

  const subscribeTo = useCallback(<K extends keyof T>(key: K) => {
    const subscription = subscriptions[key]
    if (!subscription) return

    // Clear existing subscription
    if (unsubscribeRefs.current[key as string]) {
      unsubscribeRefs.current[key as string]?.()
      unsubscribeRefs.current[key as string] = null
    }

    updateState(key, prev => ({
      ...prev,
      isLoading: true,
      error: null
    }))

    try {
      const unsubscribeFn = subscription.subscribe((data: T[K]) => {
        if (!isMountedRef.current) return
        
        updateState(key, prev => ({
          ...prev,
          data,
          error: null,
          isLoading: false
        }))
      })

      unsubscribeRefs.current[key as string] = unsubscribeFn
      
      updateState(key, prev => ({
        ...prev,
        isSubscribed: true,
        retryCount: 0
      }))
    } catch (error) {
      updateState(key, prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false
      }))
    }
  }, [subscriptions, updateState])

  const unsubscribeFrom = useCallback(<K extends keyof T>(key: K) => {
    if (unsubscribeRefs.current[key as string]) {
      try {
        unsubscribeRefs.current[key as string]?.()
      } catch (error) {
        console.warn(`Error unsubscribing from ${String(key)}:`, error)
      }
      unsubscribeRefs.current[key as string] = null
    }

    updateState(key, prev => ({
      ...prev,
      isSubscribed: false
    }))
  }, [updateState])

  const resetAll = useCallback(() => {
    Object.keys(subscriptions).forEach(key => {
      unsubscribeFrom(key as keyof T)
    })
    setStates(prev => {
      const newState: any = {}
      Object.keys(subscriptions).forEach(key => {
        newState[key] = {
          data: null,
          error: null,
          isLoading: true,
          isSubscribed: false,
          retryCount: 0
        }
      })
      return newState
    })
  }, [subscriptions, unsubscribeFrom])

  // Subscribe to all on mount
  useEffect(() => {
    isMountedRef.current = true
    Object.keys(subscriptions).forEach(key => {
      subscribeTo(key as keyof T)
    })

    return () => {
      isMountedRef.current = false
      Object.keys(subscriptions).forEach(key => {
        if (unsubscribeRefs.current[key]) {
          unsubscribeRefs.current[key]?.()
          unsubscribeRefs.current[key] = null
        }
      })
    }
  }, [subscriptions, subscribeTo])

  return {
    states,
    subscribeTo,
    unsubscribeFrom,
    resetAll,
    allSubscribed: Object.values(states).every(state => state.isSubscribed),
    anyLoading: Object.values(states).some(state => state.isLoading),
    anyError: Object.values(states).some(state => state.error !== null)
  }
}

/**
 * Hook for WebSocket-like subscriptions with reconnection logic
 */
export function useWebSocketSubscription<T>(
  url: string,
  protocols?: string | string[],
  options: SubscriptionOptions & {
    /** WebSocket heartbeat interval (ms) */
    heartbeatInterval?: number
    /** Reconnect on close */
    reconnectOnClose?: boolean
  } = {}
) {
  const {
    heartbeatInterval = 30000,
    reconnectOnClose = true,
    ...subscriptionOptions
  } = options

  const [webSocket, setWebSocket] = useState<WebSocket | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const subscribeFn = useCallback((callback: (data: T) => void) => {
    const ws = new WebSocket(url, protocols)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T
        callback(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket closed')
      if (reconnectOnClose) {
        // Reconnect logic would go here
        setTimeout(() => {
          // This would trigger a re-render and new connection
        }, 1000)
      }
    }

    setWebSocket(ws)

    // Setup heartbeat
    if (heartbeatInterval > 0) {
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        }
      }, heartbeatInterval)
    }

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [url, protocols, heartbeatInterval, reconnectOnClose])

  const { data, error, isLoading, isSubscribed, subscribe, unsubscribe, reset } = 
    useSubscriptionManager<T>(subscribeFn, subscriptionOptions)

  // Send message through WebSocket
  const sendMessage = useCallback((message: any) => {
    if (webSocket?.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected')
    }
  }, [webSocket])

  return {
    data,
    error,
    isLoading,
    isSubscribed,
    subscribe,
    unsubscribe,
    reset,
    sendMessage,
    readyState: webSocket?.readyState,
    url
  }
}

/**
 * Hook for managing event emitter subscriptions
 */
export function useEventEmitterSubscription<T>(
  emitter: {
    on: (event: string, callback: (data: T) => void) => void
    off: (event: string, callback: (data: T) => void) => void
  },
  event: string,
  options: SubscriptionOptions = {}
) {
  const subscribeFn = useCallback((callback: (data: T) => void) => {
    emitter.on(event, callback)
    return () => emitter.off(event, callback)
  }, [emitter, event])

  return useSubscriptionManager<T>(subscribeFn, options)
}