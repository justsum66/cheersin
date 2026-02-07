'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface ApiLoadingContextValue {
  loading: boolean
  setLoading: (v: boolean) => void
}

const ApiLoadingContext = createContext<ApiLoadingContextValue | null>(null)

export function ApiLoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoadingState] = useState(false)
  const setLoading = useCallback((v: boolean) => setLoadingState(v), [])
  return (
    <ApiLoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </ApiLoadingContext.Provider>
  )
}

export function useApiLoading() {
  const ctx = useContext(ApiLoadingContext)
  return ctx ?? { loading: false, setLoading: () => {} }
}
