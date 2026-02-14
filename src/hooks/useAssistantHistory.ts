'use client'

import { useEffect, useRef, useMemo } from 'react'
import type { AssistantMessage, AssistantMessageStored } from '@/types/assistant'
import { CHAT_HISTORY_KEY, MAX_HISTORY_MESSAGES, HISTORY_SAVE_DEBOUNCE_MS } from '@/config/assistant.config'

/** AST-26：歷史載入/儲存/搜尋/分組/restartFromHere/clearAll */

function loadHistoryFromStorage(): AssistantMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AssistantMessageStored[]
    return (parsed || []).slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
      wines: m.wines,
    }))
  } catch {
    return []
  }
}

function saveHistoryToStorage(messages: AssistantMessage[]): void {
  if (typeof window === 'undefined' || !messages.length) return
  try {
    const toSave = messages.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
      wines: m.wines,
    }))
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(toSave))
  } catch {
    /* ignore */
  }
}

export type GetDateGroupLabel = (date: Date) => string

export interface UseAssistantHistoryOptions {
  searchQuery: string
  getDateGroupLabel: GetDateGroupLabel
  dateSortOrder: string[]
}

/**
 * 歷史：首次載入、防抖儲存、依搜尋過濾並依日期分組、restartFromHere、clearAll
 */
export function useAssistantHistory(
  messages: AssistantMessage[],
  setMessages: React.Dispatch<React.SetStateAction<AssistantMessage[]>>,
  options: UseAssistantHistoryOptions
) {
  const { searchQuery, getDateGroupLabel, dateSortOrder } = options
  const historyLoadedRef = useRef(false)

  /** 133 載入歷史（僅首次） */
  useEffect(() => {
    if (historyLoadedRef.current) return
    historyLoadedRef.current = true
    const saved = loadHistoryFromStorage()
    if (saved.length > 0) setMessages(saved)
  }, [setMessages])

  /** 133 儲存歷史（防抖）；AST-04 拉長防抖 */
  useEffect(() => {
    if (messages.length === 0 || !historyLoadedRef.current) return
    const timer = setTimeout(() => saveHistoryToStorage(messages), HISTORY_SAVE_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [messages])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return q ? messages.filter((m) => m.content.toLowerCase().includes(q)) : messages
  }, [messages, searchQuery])

  const groupedByDate = useMemo(() => {
    return filtered.reduce<Record<string, AssistantMessage[]>>((acc, m) => {
      const label = getDateGroupLabel(m.timestamp)
      if (!acc[label]) acc[label] = []
      acc[label].push(m)
      return acc
    }, {})
  }, [filtered, getDateGroupLabel])

  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedByDate).sort((a, b) => {
      const ai = dateSortOrder.indexOf(a)
      const bi = dateSortOrder.indexOf(b)
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      return a.localeCompare(b)
    })
  }, [groupedByDate, dateSortOrder])

  const restartFromHere = (messageId: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === messageId)
      return idx >= 0 ? prev.slice(0, idx + 1) : prev
    })
  }

  const clearAll = () => {
    setMessages([])
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY)
    } catch {
      /* ignore */
    }
  }

  return {
    groupedByDate,
    sortedDateKeys,
    restartFromHere,
    clearAll,
    historyLoadedRef,
  }
}
