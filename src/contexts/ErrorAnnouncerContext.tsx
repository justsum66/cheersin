'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

/** 130 錯誤提示無障礙：aria-live 即時播報錯誤給螢幕閱讀器 */
interface ErrorAnnouncerContextValue {
  announceError: (message: string) => void
}

const ErrorAnnouncerContext = createContext<ErrorAnnouncerContextValue | null>(null)

export function ErrorAnnouncerProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('')

  const announceError = useCallback((msg: string) => {
    setMessage('')
    requestAnimationFrame(() => setMessage(msg))
  }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 5000)
    return () => clearTimeout(t)
  }, [message])

  return (
    <ErrorAnnouncerContext.Provider value={{ announceError }}>
      {children}
      {/* 視覺隱藏，僅供螢幕閱讀器即時播報 */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="error-announcer"
      >
        {message}
      </div>
    </ErrorAnnouncerContext.Provider>
  )
}

export function useErrorAnnouncer() {
  const ctx = useContext(ErrorAnnouncerContext)
  return ctx ?? { announceError: () => {} }
}
