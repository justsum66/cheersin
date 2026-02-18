'use client'

import { useState, useRef, useCallback } from 'react'
import { parseWinesFromResponse } from '@/lib/wine-response'
import type { AssistantMessage, WineCardDataFromAI } from '@/types/assistant'
import {
  CHAT_TIMEOUT_MS,
  MAX_CONTEXT_MESSAGES,
  MAX_INPUT_LENGTH,
  QUIZ_RESULT_KEY,
  SEND_THROTTLE_MS,
  STREAM_THROTTLE_MS,
} from '@/config/assistant.config'
import { useTranslation } from '@/contexts/I18nContext'
import { useSubscription } from '@/hooks/useSubscription'
import { canUseAICall, getMaxAICallsPerDay, getAiCallsUsedToday, incrementAiCallsUsedToday } from '@/lib/subscription'
import { useApiLoading } from '@/contexts/ApiLoadingContext'
import { useErrorAnnouncer } from '@/contexts/ErrorAnnouncerContext'
import toast from 'react-hot-toast'

/** AST-25：對話與送訊邏輯 — sendMessage、abort、串流/Vision */

const TOPIC_KEYWORDS: Record<string, string[]> = {
  '#葡萄酒': ['紅酒', '白酒', '葡萄酒', '單寧', '波爾多', '勃艮第', 'Chardonnay', 'Cabernet'],
  '#威士忌': ['威士忌', 'Whisky', '蘇格蘭', '波本', '單一麥芽'],
  '#清酒': ['清酒', '大吟釀', '純米', '精米步合', '獺祭'],
  '#啤酒': ['啤酒', '精釀', 'IPA', '拉格', '艾爾'],
  '#餐酒搭配': ['牛排', '海鮮', '搭配', '配酒', '餐酒'],
}

function deriveTags(text: string): string[] {
  const tags: string[] = []
  for (const [tag, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) tags.push(tag)
  }
  return tags.slice(0, 3)
}

/** AST-46：關鍵行為埋點 — 與 page 共用 name 格式 assistant_* */
function trackAssistantAction(action: 'export' | 'share' | 'screenshot' | 'vision' | 'send_message'): void {
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `assistant_${action}`, value: 1, id: 'assistant' }),
    }).catch(() => { })
  } catch {
    /* noop */
  }
}

/** AST-47：對話長度與錯誤率 — 每輪結束送 messageCount + 是否含圖/錯誤，供優化用 */
function trackAssistantTurn(messageCount: number, kind: 'text' | 'vision' | 'error'): void {
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'assistant_turn', value: messageCount, id: kind }),
    }).catch(() => { })
  } catch {
    /* noop */
  }
}

export interface UseAssistantChatOptions {
  personality: 'fun' | 'pro'
  occasion: string | null
  budget: string | null
  preferredWineTypes: string[]
  setShowUpgradeModal: (show: boolean, reason?: string) => void
  /** 送出時清除輸入框（由 page 傳入 setInput 的 wrapper） */
  clearInput?: () => void
}

export function useAssistantChat(options: UseAssistantChatOptions) {
  const {
    personality,
    occasion,
    budget,
    preferredWineTypes,
    setShowUpgradeModal,
    clearInput,
  } = options
  const { t, locale } = useTranslation()
  const { tier } = useSubscription()
  const { setLoading: setApiLoading } = useApiLoading()
  const { announceError } = useErrorAnnouncer()

  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const userAbortedRef = useRef(false)
  const lastSendTimeRef = useRef<number>(0)
  /** AST-45：逾時/5xx 重試時不重算額度 */
  const skipIncrementRef = useRef(false)
  /** AST-07：串流 delta 累積與節流 flush */
  const streamContentRef = useRef('')
  const lastStreamFlushRef = useRef(0)

  const usedToday = getAiCallsUsedToday()
  const maxPerDay = getMaxAICallsPerDay(tier)
  const canSend = canUseAICall(tier, usedToday)

  /** PERF：使用 ref 追蹤 messages 以避免 sendMessage 依賴陣列包含 messages 導致每則訊息重新建立 callback */
  const messagesRef = useRef<AssistantMessage[]>([])
  messagesRef.current = messages

  const sendMessage = useCallback(
    async (content: string, imageBase64?: string, options?: { skipIncrement?: boolean }) => {
      skipIncrementRef.current = options?.skipIncrement ?? false
      const textContent = (content ?? '').trim() || (imageBase64 ? t('assistant.identifyWinePrompt') : '')
      if (!textContent && !imageBase64) return
      if (isLoading) return
      if (!canSend) {
        setShowUpgradeModal(true, 'daily_limit')
        return
      }
      /** AST-38：前端送出節流，2 秒內僅允許 1 次 */
      const now = Date.now()
      if (now - lastSendTimeRef.current < SEND_THROTTLE_MS) {
        toast(t('assistant.sendThrottleHint'), { icon: '⏱' })
        return
      }
      /** AST-38：前端輸入長度再限 */
      if (textContent.length > MAX_INPUT_LENGTH) {
        toast(t('assistant.overLimit'), { icon: '⚠' })
        return
      }
      lastSendTimeRef.current = now
      trackAssistantAction('send_message')
      if (imageBase64) trackAssistantAction('vision')

      const userMessage: AssistantMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: textContent,
        timestamp: new Date(),
        tags: deriveTags(textContent),
      }

      setMessages((prev) => [...prev, userMessage])
      clearInput?.()
      setIsLoading(true)
      setApiLoading(true)

      const assistantId = (Date.now() + 1).toString()
      const allMessages = [...messagesRef.current, userMessage]
      const contextMessages = allMessages.slice(-MAX_CONTEXT_MESSAGES)
      const last5Turns = contextMessages.slice(-5).map((m) => ({ role: m.role, content: m.content }))

      let soulWine: string | undefined
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(QUIZ_RESULT_KEY)
          if (raw) {
            const data = JSON.parse(raw) as { name?: string; type?: string }
            if (data?.name) soulWine = data.type ? `${data.name}（${data.type}）` : data.name
          }
        } catch {
          /* ignore */
        }
      }
      const body: Record<string, unknown> = {
        messages: contextMessages.map((m) => ({ role: m.role, content: m.content })),
        last5Turns,
        stream: !imageBase64,
        userContext: {
          personality: personality === 'pro' ? 'professional' : 'humorous',
          soulWine,
          occasion: occasion ?? undefined,
          budget: budget ?? undefined,
          /** AST-35：口味存 i18n key，送 API 時譯為當前語系文案 */
          preferredWineTypes: preferredWineTypes.length > 0 ? preferredWineTypes.map((k) => t(`assistant.${k}`)) : undefined,
          preferredLanguage: locale,
        },
      }
      if (imageBase64) body.imageBase64 = imageBase64
      body.subscriptionTier = tier

      streamContentRef.current = ''
      lastStreamFlushRef.current = 0
      /** AST-47：此輪結束後訊息數（user + assistant） */
      const turnMessageCount = messagesRef.current.length + 2
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date() },
      ])

      const maxAttempts = 2
      let lastError: Error | null = null

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        abortRef.current = new AbortController()
        const timeoutId = setTimeout(() => abortRef.current?.abort(), CHAT_TIMEOUT_MS)
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: abortRef.current.signal,
          })

          if (imageBase64 && response.ok && response.headers.get('content-type')?.includes('application/json')) {
            clearTimeout(timeoutId)
            const data = (await response.json()) as { message?: string; wines?: WineCardDataFromAI[]; sources?: { index: number; source: string }[]; similarQuestions?: string[] }
            const parsed = parseWinesFromResponse(data.message ?? '')
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantId) return m
                return {
                  ...m,
                  content: parsed.text,
                  wines: (data.wines ?? parsed.wines)?.length ? (data.wines ?? parsed.wines) : undefined,
                  sources: data.sources,
                  similarQuestions: data.similarQuestions,
                  tags: deriveTags(parsed.text),
                }
              })
            )
            if (!skipIncrementRef.current) incrementAiCallsUsedToday()
            trackAssistantTurn(turnMessageCount, 'vision')
            setIsLoading(false)
            setApiLoading(false)
            abortRef.current = null
            return
          }

          if (!response.ok || !response.body) {
            const data = await response.json().catch(() => ({}))
            const msg = (data as { message?: string })?.message || `HTTP ${response.status}`
            throw new Error(msg)
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          let sources: { index: number; source: string }[] = []
          let similarQuestions: string[] = []

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''
            for (const line of lines) {
              if (!line.trim()) continue
              try {
                const data = JSON.parse(line) as { type?: string; content?: string; sources?: typeof sources; similarQuestions?: string[]; message?: string }
                if (data.type === 'meta' && data.sources) sources = data.sources
                if (data.type === 'delta' && typeof data.content === 'string') {
                  streamContentRef.current += data.content
                  const now = Date.now()
                  if (now - lastStreamFlushRef.current >= STREAM_THROTTLE_MS) {
                    lastStreamFlushRef.current = now
                    const content = streamContentRef.current
                    setMessages((prev) =>
                      prev.map((m) => (m.id === assistantId ? { ...m, content } : m))
                    )
                  }
                }
                if (data.type === 'done' && data.similarQuestions) similarQuestions = data.similarQuestions
                if (data.type === 'error') throw new Error(data.message || 'Stream error')
              } catch (e) {
                if (e instanceof SyntaxError) continue
                throw e
              }
            }
          }

          const finalContent = streamContentRef.current || ''
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== assistantId) return m
              const parsed = parseWinesFromResponse(finalContent)
              return {
                ...m,
                content: parsed.text,
                wines: parsed.wines.length > 0 ? parsed.wines : undefined,
                sources,
                similarQuestions,
                tags: deriveTags(parsed.text),
              }
            })
          )
          if (!skipIncrementRef.current) incrementAiCallsUsedToday()
          trackAssistantTurn(turnMessageCount, imageBase64 ? 'vision' : 'text')
          lastError = null
          break
        } catch (error) {
          clearTimeout(timeoutId)
          lastError = error instanceof Error ? error : new Error(String(error))
          if (attempt === maxAttempts - 1) {
            const isAbort = lastError.name === 'AbortError'
            const userCancelled = userAbortedRef.current
            userAbortedRef.current = false
            const msg = lastError.message || ''
            const is429 = msg.includes('429') || msg.includes('Rate limited') || msg.includes('每分鐘')
            const isNetwork = /network|fetch|failed|load/i.test(msg) || (typeof navigator !== 'undefined' && !navigator.onLine)
            const errMsg = userCancelled
              ? t('assistant.cancelled')
              : is429
                ? t('assistant.rateLimit1Min')
                : isAbort
                  ? (maxAttempts > 1 ? t('assistant.replyTimeoutRetry') : t('assistant.replyTimeout'))
                  : isNetwork
                    ? t('assistant.networkError')
                    : msg || t('assistant.errorFallback')
            if (userCancelled) toast(t('assistant.cancelled'), { icon: '⏹' })
            else {
              announceError(errMsg)
              toast.error(errMsg, { duration: 5000 })
            }
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: errMsg, isError: true } : m))
            )
            trackAssistantTurn(turnMessageCount, 'error')
          }
        }
      }
      setIsLoading(false)
      setApiLoading(false)
      abortRef.current = null
    },
    [
      t,
      locale,
      tier,
      personality,
      occasion,
      budget,
      preferredWineTypes,
      isLoading,
      canSend,
      setShowUpgradeModal,
      clearInput,
      setApiLoading,
      announceError,
    ]
  )

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage,
    abortRef,
    userAbortedRef,
    canSend,
    usedToday,
    maxPerDay,
  }
}
