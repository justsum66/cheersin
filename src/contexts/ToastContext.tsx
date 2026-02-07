'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import toast from 'react-hot-toast'

/**
 * F181 ToastContext - 統一 Toast 管理
 * 委派 react-hot-toast，便於後續替換或擴充
 */
interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  loading: (message: string) => string
  dismiss: (id?: string) => void
  promise: <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) => Promise<T>
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const success = useCallback((message: string) => {
    toast.success(message, { duration: 3000 })
  }, [])
  const error = useCallback((message: string) => {
    toast.error(message, { duration: 4000 })
  }, [])
  const loading = useCallback((message: string) => {
    return toast.loading(message)
  }, [])
  const dismiss = useCallback((id?: string) => {
    toast.dismiss(id)
  }, [])
  const promise = useCallback(
    <T,>(p: Promise<T>, messages: { loading: string; success: string; error: string }) => {
      return toast.promise(p, messages)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ success, error, loading, dismiss, promise }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      success: (m) => toast.success(m),
      error: (m) => toast.error(m),
      loading: (m) => toast.loading(m),
      dismiss: (id) => toast.dismiss(id),
      promise: (p, msgs) => toast.promise(p, msgs),
    }
  }
  return ctx
}
