'use client'

import { useEffect, useRef, useMemo } from 'react'
import type { AssistantMessage, AssistantMessageStored } from '@/types/assistant'
import { CHAT_HISTORY_KEY, MAX_HISTORY_MESSAGES, HISTORY_SAVE_DEBOUNCE_MS } from '@/config/assistant.config'
import type { SubscriptionTier } from '@/lib/subscription'

/** Phase 1 Tasks 13-14：免費用戶歷史限制 */
const FREE_HISTORY_MAX_MESSAGES = 10
const FREE_HISTORY_MAX_DATE_GROUPS = 3

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

function saveHistoryToStorage(messages: AssistantMessage[], tier?: SubscriptionTier): void {
  if (typeof window === 'undefined' || !messages.length) return
  /** Phase 1 Task 13：免費用戶只保存最近 10 條訊息 */
  const maxSave = (!tier || tier === 'free') ? FREE_HISTORY_MAX_MESSAGES : MAX_HISTORY_MESSAGES
  try {
    const toSave = messages.slice(-maxSave).map((m) => ({
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
  /** Phase 1 Tasks 13-14：訂閱等級，免費用戶限制歷史 */
  tier?: SubscriptionTier
}

/**
 * 歷史：首次載入、防抖儲存、依搜尋過濾並依日期分組、restartFromHere、clearAll
 */
export function useAssistantHistory(
  messages: AssistantMessage[],
  setMessages: React.Dispatch<React.SetStateAction<AssistantMessage[]>>,
  options: UseAssistantHistoryOptions
) {
  const { searchQuery, getDateGroupLabel, dateSortOrder, tier } = options
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
    const timer = setTimeout(() => saveHistoryToStorage(messages, tier), HISTORY_SAVE_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [messages, tier])

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

  /** Phase 1 Task 14：免費用戶只顯示最近 3 個日期群組 */
  const sortedDateKeys = useMemo(() => {
    const keys = Object.keys(groupedByDate).sort((a, b) => {
      const ai = dateSortOrder.indexOf(a)
      const bi = dateSortOrder.indexOf(b)
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      return a.localeCompare(b)
    })
    if (!tier || tier === 'free') return keys.slice(0, FREE_HISTORY_MAX_DATE_GROUPS)
    return keys
  }, [groupedByDate, dateSortOrder, tier])

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
