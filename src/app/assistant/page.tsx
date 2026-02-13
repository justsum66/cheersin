'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Send, Bot, User, Sparkles, Wine,
  Mic, Image as ImageIcon, Camera, Settings, History, Zap, Crown,
  ThumbsUp, ThumbsDown, Copy, Volume2, Share2, Download,
  Beer, Gift, Heart, Coins, Gamepad2, Users, Music2,
  Search, BookOpen, Utensils, MessageSquare, Globe, ChevronDown, Square
} from 'lucide-react'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import FeatureIcon from '@/components/ui/FeatureIcon'
import { BRAND_NAME } from '@/components/BrandLogo'
import { WineCard } from '@/components/wine/WineCard'
import { parseWinesFromResponse, type WineCardDataFromAI } from '@/lib/wine-response'
import { useApiLoading } from '@/contexts/ApiLoadingContext'
import { useErrorAnnouncer } from '@/contexts/ErrorAnnouncerContext'
import { useTranslation } from '@/contexts/I18nContext'
import { formatDateTime } from '@/lib/formatters'
import { useSubscription } from '@/hooks/useSubscription'
import { canUseAICall, getMaxAICallsPerDay, getAiCallsUsedToday, incrementAiCallsUsedToday } from '@/lib/subscription'
import { UpgradeModal } from '@/components/UpgradeModal'
import { logger } from '@/lib/logger'
import { MarkdownMessage } from '@/components/assistant/MarkdownMessage'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  liked?: boolean
  sources?: { index: number; source: string }[]
  similarQuestions?: string[]
  tags?: string[]
  /** 141, 143-145 結構化酒款（AI 回傳 [WINES] JSON 時） */
  wines?: WineCardDataFromAI[]
}

/** 133 {t('assistant.history')} localStorage key */
const CHAT_HISTORY_KEY = 'cheersin_assistant_history'
const MAX_HISTORY_MESSAGES = 100
/** B1 Task 42：送 API 的上下文訊息上限（避免 token 爆掉、回應變慢） */
const MAX_CONTEXT_MESSAGES = 32

function loadHistory(): Message[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; wines?: WineCardDataFromAI[] }[]
    return (parsed || []).slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      ...m,
      timestamp: new Date(m.timestamp),
      wines: m.wines,
    }))
  } catch {
    return []
  }
}

function saveHistory(messages: Message[]) {
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

// Fixed Categories with Lucide Icons (no emojis)
const SUGGESTION_CATEGORIES = [
  {
    title: '葡萄酒入門',
    icon: Wine,
    questions: [
      '推薦適合新手的紅酒',
      '白酒和紅酒的差別',
      '什麼是單寧？',
    ]
  },
  {
    title: '烈酒與調酒',
    icon: Beer,
    questions: [
      '威士忌入門推薦',
      '干邑和白蘭地差在哪',
      '調酒基酒怎麼選',
    ]
  },
  {
    title: '餐酒搭配',
    icon: Utensils,
    questions: [
      '牛排配什麼酒',
      '海鮮適合配什麼',
      '甜點配酒推薦',
    ]
  },
  {
    title: '亞洲酒類',
    icon: Zap,
    questions: [
      '清酒怎麼挑選？',
      '大吟釀和純米酒差別',
      '紹興酒怎麼品嚐',
    ]
  },
  /** P0-006：派對選遊戲 — AI 成為派對組織者 */
  {
    title: '派對選遊戲',
    icon: Gamepad2,
    questions: [
      '幫我選一款適合 2 人的遊戲',
      '4 個人聚會推薦什麼遊戲？',
      '不想喝酒的派對遊戲有哪些？',
    ]
  },
]

/** P0-006：AI 侍酒師派對屬性 — 預設問題讓 AI 成為派對組織者；killer 29 派對策劃引導 */
const QUICK_PROMPTS: { icon: typeof Gamepad2; text: string; href?: string }[] = [
  { icon: Gamepad2, text: '幫我選遊戲' },
  { icon: Users, text: '我們 4 個人，推薦什麼派對遊戲？' },
  { icon: Music2, text: '幫我規劃派對流程（派對策劃）', href: '/party-dj' },
  { icon: Gift, text: '送禮指南' },
  { icon: Heart, text: '約會選酒' },
  { icon: Coins, text: '高CP值推薦' },
  { icon: Utensils, text: '今晚吃牛排配什麼酒？' },
]

const CHAT_TIMEOUT_MS = 30000
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

/** 136 靈魂酒測結果 localStorage key */
const QUIZ_RESULT_KEY = 'quiz-last-result'
/** 139 口味偏好 localStorage key */
const TASTE_PREFERENCES_KEY = 'cheersin_taste_preferences'
/** 142 願望清單 localStorage key（與 profile 一致） */
const WISHLIST_KEY = 'cheersin_wishlist'

const TASTE_OPTIONS = ['紅酒', '白酒', '粉紅酒', '香檳', '威士忌', '清酒', '啤酒', '調酒']

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  /** 134 清除對話確認 */
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  /** 137 場合、138 預算、139 口味偏好 */
  const [occasion, setOccasion] = useState<string | null>(null)
  const [budget, setBudget] = useState<string | null>(null)
  const [preferredWineTypes, setPreferredWineTypes] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(TASTE_PREFERENCES_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as string[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const { tier } = useSubscription()
  const { locale, t } = useTranslation()
  const usedToday = getAiCallsUsedToday()
  const maxPerDay = getMaxAICallsPerDay(tier)
  const canSend = canUseAICall(tier, usedToday)
  const [personality, setPersonality] = useState<'fun' | 'pro'>('fun')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  /** AILog-09：使用者{t('common.cancel')}請求時標記，錯誤處理顯示「已{t('common.cancel')}」 */
  const userAbortedRef = useRef(false)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  /** C45 {t('assistant.history')}側欄：左側滑出、日期分組、搜索過濾 */
  const [showHistorySidebar, setShowHistorySidebar] = useState(false)
  const [historySearchQuery, setHistorySearchQuery] = useState('')
  /** C47 圖片上傳：拖拽狀態（相機圖標 + 拖拽上傳） */
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  /** C49 多語言；P3 B1-50 依瀏覽器語系預設，非繁中用戶以英文回覆 */
  const [language, setLanguage] = useState<'zh-TW' | 'en'>('zh-TW')
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const lang = navigator.language?.toLowerCase() ?? ''
      if (lang.startsWith('en')) setLanguage('en')
    }
  }, [])
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  /** EXPERT_60 P3: personalization banner when soul wine exists */
  const [soulWineDisplay, setSoulWineDisplay] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(QUIZ_RESULT_KEY)
      if (raw) {
        const data = JSON.parse(raw) as { name?: string; type?: string }
        if (data?.name) setSoulWineDisplay(data.type ? `${data.name}（${data.type}）` : data.name)
      }
    } catch {
      /* ignore */
    }
  }, [])

  /** B1 Task 48：根據上一則 AI 回覆的 similarQuestions 動態顯示建議問題 */
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant' && (m.content?.trim() ?? '').length > 0)
  const dynamicSuggestions = lastAssistantMessage?.similarQuestions?.slice(0, 6) ?? []

  const historyLoadedRef = useRef(false)
  /** 133 載入{t('assistant.history')}（僅首次） */
  useEffect(() => {
    if (historyLoadedRef.current) return
    historyLoadedRef.current = true
    const saved = loadHistory()
    if (saved.length > 0) setMessages(saved)
  }, [])

  /** 133 儲存{t('assistant.history')}（防抖） */
  useEffect(() => {
    if (messages.length === 0 || !historyLoadedRef.current) return
    const t = setTimeout(() => saveHistory(messages), 500)
    return () => clearTimeout(t)
  }, [messages])

  /** 139 儲存口味偏好 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(TASTE_PREFERENCES_KEY, JSON.stringify(preferredWineTypes))
    } catch {
      /* ignore */
    }
  }, [preferredWineTypes])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /** C49 語言下拉：點擊外部關閉 */
  useEffect(() => {
    if (!languageDropdownOpen) return
    const onOutside = (e: MouseEvent) => {
      if (languageDropdownRef.current?.contains(e.target as Node)) return
      setLanguageDropdownOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [languageDropdownOpen])

  const { setLoading: setApiLoading } = useApiLoading()
  const { announceError } = useErrorAnnouncer()

  /** B1-46 酒標辨識：可傳 imageBase64，API 會走 Vision 並回傳 JSON（非串流） */
  const sendMessage = async (content: string, imageBase64?: string) => {
    const textContent = (content ?? '').trim() || (imageBase64 ? t('assistant.identifyWinePrompt') : '')
    if (!textContent && !imageBase64) return
    if (isLoading) return
    if (!canSend) {
      setShowUpgradeModal(true)
      return
    }
    if (imageBase64) trackAssistantAction('vision')

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textContent,
      timestamp: new Date(),
      tags: deriveTags(textContent),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setApiLoading(true)

    const assistantId = (Date.now() + 1).toString()
    const allMessages = [...messages, userMessage]
    /** B1 Task 42：只送最近 N 則訊息給 API，長對話不爆 token */
    const contextMessages = allMessages.slice(-MAX_CONTEXT_MESSAGES)
    const last5Turns = contextMessages.slice(-5).map((m) => ({ role: m.role, content: m.content }))

    /** 136 靈魂酒測結果、137 場合、138 預算 */
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
        preferredWineTypes: preferredWineTypes.length > 0 ? preferredWineTypes : undefined,
        /** P2-398：依全站 locale 讓 AI 以對應語言回覆（六語系） */
        preferredLanguage: locale,
      },
    }
    if (imageBase64) body.imageBase64 = imageBase64
    /** EXPERT_60 P2：傳送 tier 供 API 速率限制分級 */
    body.subscriptionTier = tier

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

        /** B1-46：有附圖時 API 回傳 JSON（非串流） */
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
          incrementAiCallsUsedToday()
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
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + data.content } : m
                  )
                )
              }
              if (data.type === 'done' && data.similarQuestions) similarQuestions = data.similarQuestions
              if (data.type === 'error') throw new Error(data.message || 'Stream error')
            } catch (e) {
              if (e instanceof SyntaxError) continue
              throw e
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== assistantId) return m
            const parsed = parseWinesFromResponse(m.content)
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
        incrementAiCallsUsedToday()
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
          else { announceError(errMsg); toast.error(errMsg, { duration: 5000 }) }
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: errMsg } : m))
          )
        }
      }
    }
    setIsLoading(false)
    setApiLoading(false)
    abortRef.current = null
  }

  /** AILog-02：送出前 trim、空字串不送 API（sendMessage 內亦檢查） */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input.trim() || '')
  }

  /** 任務 55：文字回饋（👎 時可選填改進建議） */
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const FEEDBACK_STORAGE_KEY = 'cheersin_assistant_feedback'
  /** P2-385：送出反饋到後端並保留本地；倒讚時 helpful: false + 選填 comment */
  const submitFeedback = async (messageId: string) => {
    const comment = feedbackText.trim() || undefined
    try {
      const res = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, helpful: false, comment }),
      })
      if (!res.ok) throw new Error('API error')
    } catch {
      /* 仍寫入本地 */
    }
    try {
      const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY)
      const list = raw ? (JSON.parse(raw) as { messageId: string; text?: string }[]) : []
      list.push({ messageId, text: comment })
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list.slice(-100)))
      toast.success(t('assistant.feedbackThanks'))
    } catch {
      toast.error(t('assistant.feedbackError'))
    }
    setFeedbackMessageId(null)
    setFeedbackText('')
  }

  /** P2-385：讚/倒讚時更新 UI；讚送後端，倒讚顯示文字框由 submitFeedback 送 */
  const handleLike = (messageId: string, liked: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, liked } : m)))
    if (liked === true) {
      void fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, helpful: true }),
      })
    } else {
      setFeedbackMessageId(messageId)
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  /** 142 加入願望清單：將推薦內容加入 cheersin_wishlist（與 profile 相容：id, name, type） */
  const addToWishlist = (content: string, messageId: string) => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY)
      const list: { id: string; name: string; type: string; date?: string }[] = raw ? JSON.parse(raw) : []
      list.push({
        id: messageId,
        name: content.slice(0, 80),
        type: '推薦',
        date: new Date().toISOString(),
      })
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list))
      toast.success(t('assistant.addToWishlistSuccess'))
    } catch {
      toast.error(t('assistant.addToWishlistError'))
    }
  }

  /** 142 從酒款卡片加入願望清單（profile 顯示 name / type） */
  const addToWishlistWine = (wine: WineCardDataFromAI) => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY)
      const list: { id: string; name: string; type: string; date?: string }[] = raw ? JSON.parse(raw) : []
      list.push({
        id: wine.id,
        name: wine.name,
        type: wine.type,
        date: new Date().toISOString(),
      })
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list))
      toast.success(t('assistant.addToWishlistSuccess'))
    } catch {
      toast.error(t('assistant.addToWishlistError'))
    }
  }

  const isWineInWishlist = (wineId: string): boolean => {
    if (typeof window === 'undefined') return false
    try {
      const raw = localStorage.getItem(WISHLIST_KEY)
      const list: { id: string }[] = raw ? JSON.parse(raw) : []
      return list.some((item) => item.id === wineId)
    } catch {
      return false
    }
  }

  const startVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }
    const Win = typeof window !== 'undefined' ? window : null
    type SpeechRecognitionInstance = {
      start: () => void
      stop: () => void
      lang: string
      continuous: boolean
      interimResults: boolean
      onresult: (e: { results: Iterable<{ [key: number]: { transcript: string } }> }) => void
      onend: () => void
    }
    const SR = Win && ((Win as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition || (Win as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition)
    if (!SR) {
      setInput((prev) => prev + (prev ? ' ' : '') + t('assistant.voiceNotSupported'))
      return
    }
    const recognition = new SR()
    recognition.lang = 'zh-TW'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e: { results: Iterable<{ [key: number]: { transcript: string } }> }) => {
      const transcript = Array.from(e.results)[0]?.[0]?.transcript ?? ''
      if (transcript) setInput((prev) => (prev ? prev + ' ' + transcript : transcript))
    }
    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const stopVoiceInput = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const speakReply = (content?: string) => {
    const text = content ?? [...messages].reverse().find((m) => m.role === 'assistant')?.content
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-TW'
    u.rate = 0.95
    window.speechSynthesis.speak(u)
  }

  /** 從最近一輪對話產生分享用文字敘述（供社群貼文 caption） */
  const getShareText = (): string => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
    const q = lastUser?.content?.trim().slice(0, 80) ?? '與 AI 侍酒師的對話'
    const a = lastAssistant?.content?.trim().slice(0, 120) ?? ''
    const line = a ? `\n— ${a}${a.length >= 120 ? '…' : ''}` : ''
    return `Cheersin 侍酒師\nQ: ${q}${line}`
  }

  /** C45 依日期分組標題（今天、昨天、日期字串） */
  const getDateGroupLabel = (date: Date): string => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)
    const diff = Math.floor((d.getTime() - dateObj.getTime()) / 86400000)
    if (diff === 0) return t('assistant.today')
    if (diff === 1) return t('assistant.yesterday')
    if (diff < 7) return t('assistant.daysAgo', { n: diff })
    return date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
  }

  /** C45 側欄內點擊訊息後捲動至該訊息並關閉側欄 */
  const scrollToMessage = (messageId: string) => {
    setShowHistorySidebar(false)
    requestAnimationFrame(() => {
      document.getElementById(`msg-${messageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  /** B1-46 酒標辨識：轉 base64 送 chat API（Groq Vision，base64 上限約 4MB） */
  const handleImageSelect = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return
    const MAX_BASE64_MB = 4
    if (file.size > MAX_BASE64_MB * 1024 * 1024) {
      toast.error(t('assistant.maxSizeImage', { max: MAX_BASE64_MB }))
      if (imageInputRef.current) imageInputRef.current.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return
      const base64 = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : dataUrl
      sendMessage(input.trim() || t('assistant.identifyWinePrompt'), base64)
    }
    reader.onerror = () => toast.error(t('assistant.readImageError'))
    reader.readAsDataURL(file)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingImage(false)
    const file = e.dataTransfer.files[0]
    handleImageSelect(file ?? null)
  }

  /** 134 清除對話（需確認） */
  const requestClearChat = () => setShowClearConfirm(true)
  const confirmClearChat = () => {
    setMessages([])
    setShowClearConfirm(false)
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY)
    } catch {
      /* ignore */
    }
  }

  /** EXPERT_60 P1/P2：導出/分享/酒標辨識追蹤 — 送 analytics 事件 source: assistant */
  const trackAssistantAction = (action: 'export' | 'share' | 'screenshot' | 'vision') => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `assistant_${action}`, value: 1, id: 'assistant' }),
      }).catch(() => {})
    } catch { /* noop */ }
  }

  /** 135 匯出對話記錄為 .txt */
  const exportConversation = () => {
    if (messages.length === 0) return
    trackAssistantAction('export')
    const lines = messages.map((m) => {
      const time = formatDateTime(m.timestamp, locale)
      const who = m.role === 'user' ? t('assistant.me') : t('assistant.aiSommelier')
      return `[${time}] ${who}：\n${m.content}`
    })
    const blob = new Blob([lines.join('\n\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cheersin-對話記錄-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  /** B1-49：下載截圖 PNG（不分享，僅下載）；EXPERT_60 P1：追蹤 */
  const downloadScreenshot = async () => {
    const el = messagesContainerRef.current
    if (!el || messages.length === 0) return
    trackAssistantAction('screenshot')
    setShareLoading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(el, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png', 0.95))
      if (!blob) throw new Error('toBlob failed')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cheersin-對話截圖-${new Date().toISOString().slice(0, 10)}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('assistant.downloadScreenshotSuccess'))
    } catch (e) {
      logger.error('Screenshot failed', { err: e instanceof Error ? e.message : String(e) })
      toast.error(t('assistant.downloadScreenshotError'))
    } finally {
      setShareLoading(false)
    }
  }

  const shareConversation = async () => {
    const el = messagesContainerRef.current
    if (!el || messages.length === 0) return
    trackAssistantAction('share')
    setShareLoading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(el, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png', 0.95))
      if (!blob) throw new Error('toBlob failed')
      if (typeof navigator !== 'undefined' && navigator.share) {
        const file = new File([blob], 'cheersin-chat.png', { type: 'image/png' })
        await navigator.share({
          title: 'AI 侍酒師對話',
          text: getShareText(),
          files: [file],
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cheersin-chat-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      logger.error('Share failed', { err: e instanceof Error ? e.message : String(e) })
    } finally {
      setShareLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-dark-950 safe-area-px page-container-mobile" role="main" aria-label={t('nav.assistant')}>
      {/* EXPERT_60 P1：額度用盡時固定橫幅 — 「今日 X 次已用完，升級無限暢聊」+ 按鈕直連 /pricing */}
      {!canSend && (
        <div className="sticky top-0 z-[60] w-full py-3 px-4 bg-primary-900/95 border-b border-primary-500/30 text-center flex flex-wrap items-center justify-center gap-3">
          <span className="text-white font-medium">{t('assistant.todayLimitReached', { max: maxPerDay > 0 ? maxPerDay : 3 })}</span>
          <Link href="/pricing#faq" className="btn-primary text-sm py-2 px-4 min-h-[44px] inline-flex items-center gap-2">
            <Crown className="w-4 h-4" />
            {t('assistant.upgradePro')}
          </Link>
        </div>
      )}

      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Header - Glass Heavy；P3 個人化：有靈魂酒款時顯示「根據你的靈魂酒款」 */}
      <header className="sticky top-0 z-50 glass-heavy">
        <div className="max-w-5xl xl:max-w-[1440px] mx-auto px-4 py-4">
          {soulWineDisplay && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3 py-2 px-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-sm">
              <span className="text-white/80">{t('assistant.bySoulWine')}</span>
              <span className="text-primary-300 font-medium">{soulWineDisplay}</span>
              <span className="text-white/60">{t('assistant.recommendForYou')}</span>
              <Link href="/quiz" className="ml-2 text-primary-400 hover:text-primary-300 text-xs font-medium">
                {t('assistant.retakeQuiz')}
              </Link>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {/* 127 AI 頭像：品牌風格（logo + 漸層） */}
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-white/10 overflow-hidden">
                  <Image src="/sizes/icon_128_gold.png" alt={BRAND_NAME} width={24} height={24} className="object-contain" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500 border-2 border-dark-950"></span>
                </span>
              </div>
              <div className="text-left">
                <h1 className="font-display font-bold text-lg leading-tight tracking-wide">
                  {t('nav.assistant')}
                </h1>
                <p className="text-xs text-white/40">{t('assistant.tagline')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* C49 多語言選擇：右上角語言下拉選單 */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLanguageDropdownOpen((v) => !v)}
                  className="flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                  title={t('assistant.language')}
                  aria-expanded={languageDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label={t('assistant.language')}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-medium">{language === 'zh-TW' ? t('assistant.zhTW') : t('assistant.en')}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {languageDropdownOpen && (
                    <motion.ul
                      role="listbox"
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 400, 
                        damping: 25,
                        mass: 0.8
                      }}
                      className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-xl bg-dark-800 border border-white/10 shadow-xl z-50"
                    >
                      {(['zh-TW', 'en'] as const).map((loc) => (
                        <li key={loc} role="option" aria-selected={language === loc}>
                          <button
                            type="button"
                            onClick={() => { setLanguage(loc); setLanguageDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${language === loc ? 'bg-primary-500/20 text-primary-300' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                          >
                            {loc === 'zh-TW' ? t('assistant.zhTW') : t('assistant.en')}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={shareConversation}
                disabled={messages.length === 0 || shareLoading}
                className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-40 transition-colors"
                title={t('assistant.shareConversation')}
              >
                <Share2 className="w-5 h-5" />
              </button>
              {/* B1-52 專家模式：新手友善 / 專家術語，標籤與 aria 明確 */}
              <button
                onClick={() => setPersonality((p) => (p === 'fun' ? 'pro' : 'fun'))}
                className="flex items-center gap-2 min-h-[44px] px-4 rounded-xl text-sm font-medium border transition-colors"
                title={personality === 'pro' ? t('assistant.newbieMode') : t('assistant.expertMode')}
                aria-label={personality === 'pro' ? t('assistant.expertMode') : t('assistant.newbieMode')}
                aria-pressed={personality === 'pro'}
                style={{
                  backgroundColor: personality === 'pro' ? 'rgba(139,0,0,0.25)' : 'rgba(255,255,255,0.05)',
                  borderColor: personality === 'pro' ? 'rgba(139,0,0,0.5)' : 'rgba(255,255,255,0.1)',
                  color: personality === 'pro' ? '#fca5a5' : 'rgba(255,255,255,0.7)',
                }}
              >
                <Zap className="w-4 h-4" />
                {personality === 'fun' ? t('assistant.newbieMode') : t('assistant.expertMode')}
              </button>
              <button
                onClick={() => setShowHistorySidebar((v) => !v)}
                className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                title={t('assistant.history')}
                aria-expanded={showHistorySidebar}
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={exportConversation}
                disabled={messages.length === 0}
                className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-40 transition-colors"
                title={t('assistant.exportTxt')}
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={downloadScreenshot}
                disabled={messages.length === 0 || shareLoading}
                className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-40 transition-colors"
                title={t('assistant.downloadScreenshot')}
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* C45 {t('assistant.history')}側欄：左側滑出、日期分組、搜索過濾 */}
      <AnimatePresence>
        {showHistorySidebar && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistorySidebar(false)}
              aria-hidden
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-[min(320px,85vw)] z-[61] bg-dark-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30,
                mass: 1
              }}
              aria-label={t('assistant.history')}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="font-display font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary-400" />
                  {t('assistant.history')}
                </h2>
                <ModalCloseButton onClick={() => setShowHistorySidebar(false)} aria-label={t('common.close')} />
              </div>
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="search"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder={t('assistant.searchPlaceholder')}
                    className="input-glass pl-9 text-sm"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {messages.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">{t('assistant.noHistory')}</p>
                ) : (
                  (() => {
                    const q = historySearchQuery.trim().toLowerCase()
                    const filtered = q ? messages.filter((m) => m.content.toLowerCase().includes(q)) : messages
                    const byDate = filtered.reduce<Record<string, Message[]>>((acc, m) => {
                      const label = getDateGroupLabel(m.timestamp)
                      if (!acc[label]) acc[label] = []
                      acc[label].push(m)
                      return acc
                    }, {})
                    const order = [t('assistant.today'), t('assistant.yesterday'), t('assistant.daysAgo', { n: 2 }), t('assistant.daysAgo', { n: 3 }), t('assistant.daysAgo', { n: 4 }), t('assistant.daysAgo', { n: 5 }), t('assistant.daysAgo', { n: 6 })]
                    const keys = Object.keys(byDate).sort((a, b) => {
                      const ai = order.indexOf(a)
                      const bi = order.indexOf(b)
                      if (ai !== -1 && bi !== -1) return ai - bi
                      if (ai !== -1) return -1
                      if (bi !== -1) return 1
                      return a.localeCompare(b)
                    })
                    return (
                      <div className="space-y-4">
                        {keys.map((label) => (
                          <div key={label}>
                            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 px-2">{label}</p>
                            <ul className="space-y-1">
                              {byDate[label].map((m) => {
                                const idx = messages.findIndex((msg) => msg.id === m.id)
                                return (
                                  <li key={m.id} className="flex flex-col gap-1">
                                    <button
                                      type="button"
                                      onClick={() => scrollToMessage(m.id)}
                                      className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors"
                                    >
                                      <span className={`text-xs font-medium ${m.role === 'user' ? 'text-primary-300' : 'text-white/70'}`}>
                                        {m.role === 'user' ? t('assistant.me') : t('assistant.aiSommelier')}
                                      </span>
                                      <p className="text-white/80 text-sm truncate mt-0.5">{m.content || t('assistant.emptyReply')}</p>
                                      <p className="text-white/40 text-[10px] mt-1">{m.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </button>
                                    {idx >= 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setMessages((prev) => prev.slice(0, idx + 1))
                                          setShowHistorySidebar(false)
                                          inputRef.current?.focus()
                                        }}
                                        className="text-left px-3 py-1.5 rounded-lg text-[11px] text-primary-400 hover:bg-primary-500/10 border border-transparent hover:border-primary-500/20"
                                      >
                                        {t('assistant.restartFromHere')}
                                      </button>
                                    )}
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )
                  })()
                )}
              </div>
              <div className="p-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => { setShowHistorySidebar(false); requestClearChat(); }}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                  title={t('assistant.clearAll')}
                >
                  {t('assistant.clearAll')}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-0 pb-32 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Screen */}
          {/* 空狀態：大圖標 + 歡迎文字 + 建議問題 */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-0 pb-12"
            >
              <div className="text-center mb-16">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-white/10">
                    <Wine className="w-12 h-12 text-primary-400/90" />
                  </div>
                </div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="home-heading-2 font-display font-bold mb-4 text-balance"
                >
                  {t('assistant.todayExplore')} <br />
                  <span className="gradient-text">{t('assistant.flavorJourney')}</span>
                </motion.h2>

                <p className="home-body text-white/70 max-w-lg mx-auto mb-2">
                  搭載先進感官演算法。詢問餐酒搭配、產區知識，或個人化選酒建議。
                </p>
                <p className="home-text-muted text-sm max-w-md mx-auto">
                  {t('assistant.trySuggestions')}
                </p>
              </div>

              {/* 137 場合、138 預算：選後會帶入後續推薦 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap justify-center gap-2 mb-6"
              >
                <span className="text-white/40 text-xs w-full text-center mb-1">{t('assistant.occasion')}</span>
                {[t('assistant.occasionDating'), t('assistant.occasionParty'), t('assistant.occasionSolo')].map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setOccasion(occasion === occ ? null : occ)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${occasion === occ ? 'bg-primary-500/30 border border-primary-500/50 text-white' : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'}`}
                  >
                    {occ}
                  </button>
                ))}
                <span className="text-white/40 text-xs w-full text-center mb-1 mt-3">{t('assistant.budget')}</span>
                {[t('assistant.budgetUnder500'), t('assistant.budget500to1000'), t('assistant.budget1000Plus')].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudget(budget === b ? null : b)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${budget === b ? 'bg-primary-500/30 border border-primary-500/50 text-white' : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'}`}
                  >
                    {b}
                  </button>
                ))}
                {(occasion || budget) && (
                  <p className="text-white/50 text-xs w-full text-center mt-2">
                    {t('assistant.selectedFilters', { value: [occasion, budget].filter(Boolean).join(' · ') })}
                  </p>
                )}
                <span className="text-white/40 text-xs w-full text-center mb-1 mt-3">{t('assistant.tastePreference')}</span>
                <div className="flex flex-wrap justify-center gap-2">
                  {TASTE_OPTIONS.map((opt) => {
                    const isSelected = preferredWineTypes.includes(opt)
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPreferredWineTypes((prev) => (isSelected ? prev.filter((x) => x !== opt) : [...prev, opt]))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected ? 'bg-secondary-500/30 border border-secondary-500/50 text-white' : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {preferredWineTypes.length > 0 && (
                  <p className="text-white/50 text-xs w-full text-center mt-2">
                    {t('assistant.preferredFilters', { value: preferredWineTypes.join('、') })}
                  </p>
                )}
              </motion.div>

              {/* 快捷提問 Chips：水平滾動，點擊可填入輸入框或直接送出 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex overflow-x-auto gap-3 mb-12 pb-2 -mx-2 px-2 scrollbar-hide justify-start md:justify-center"
              >
                {QUICK_PROMPTS.map((prompt) =>
                  prompt.href ? (
                    <Link key={prompt.text} href={prompt.href}>
                      <motion.span
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="shrink-0 min-h-[48px] px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm font-medium flex items-center gap-2 transition-colors games-focus-ring inline-flex"
                      >
                        <prompt.icon className="w-4 h-4 text-primary-400 shrink-0" />
                        <span>{prompt.text}</span>
                      </motion.span>
                    </Link>
                  ) : (
                    <motion.button
                      key={prompt.text}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setInput(prompt.text); inputRef.current?.focus(); }}
                      className="shrink-0 min-h-[48px] px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm font-medium flex items-center gap-2 transition-colors games-focus-ring"
                    >
                      <prompt.icon className="w-4 h-4 text-primary-400 shrink-0" />
                      <span>{prompt.text}</span>
                    </motion.button>
                  )
                )}
              </motion.div>

              {/* Category Tabs & Grid */}
              <div className="mb-8">
                <div className="flex justify-center flex-wrap gap-2 mb-8">
                  {SUGGESTION_CATEGORIES.map((cat, index) => (
                    <button
                      key={cat.title}
                      onClick={() => setActiveCategory(index)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === index
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      <cat.icon className={`w-4 h-4 ${activeCategory === index ? 'text-primary-500' : ''}`} />
                      {cat.title}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SUGGESTION_CATEGORIES[activeCategory].questions.map((q, i) => (
                    <motion.button
                      key={q}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => sendMessage(q)}
                      className="glass-card p-4 text-left min-h-[48px] rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/10 group transition-all games-focus-ring"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 group-hover:text-white text-sm">{q}</span>
                        <Search className="w-3 h-3 text-white/20 group-hover:text-primary-500" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 146–149 酒類知識（WSET/CMS/MW） */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="text-center pt-6 border-t border-white/5"
              >
                <Link
                  href="/learn/knowledge"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors mb-4"
                >
                  <BookOpen className="w-4 h-4" />
                  {t('assistant.wineKnowledgeFaq')}
                </Link>
              </motion.div>
              {/* Pro Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center pt-4 border-t border-white/5"
              >
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary-400 hover:text-secondary-300 transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  {t('assistant.upgradeProTitle')}
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* B1 Task 48：有對話時根據上一則回覆顯示動態建議問題 */}
          {messages.length > 0 && dynamicSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex overflow-x-auto gap-2 mb-6 pb-2 -mx-2 px-2 scrollbar-hide items-center"
            >
              <span className="text-white/40 text-xs shrink-0 mr-1">{t('assistant.fromLastReply')}</span>
              {dynamicSuggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="shrink-0 px-4 py-2.5 min-h-[48px] min-w-[48px] rounded-full text-xs font-medium bg-white/5 border border-white/10 hover:border-primary-500/40 text-white/80 hover:text-white transition-colors games-focus-ring"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          )}

          {/* Messages List（89 分享用 ref） */}
          <div ref={messagesContainerRef} className="space-y-8">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  id={`msg-${message.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-6 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar：用戶右側深色頭像；AI 左側品牌 Logo 變體，回覆時呼吸動畫 */}
                  <div className="flex-shrink-0 mt-1">
                    {message.role === 'assistant' ? (
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-white/10 overflow-hidden ${isLoading && messages[messages.length - 1]?.id === message.id ? 'animate-pulse' : ''}`}>
                        <Image src="/sizes/icon_128_gold.png" alt={BRAND_NAME} width={24} height={24} className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary-800/60 flex items-center justify-center border border-primary-500/30">
                        <User className="w-5 h-5 text-white/90" />
                      </div>
                    )}
                  </div>

                  {/* 對話氣泡：用戶右對齊深色，AI 左對齊淺色玻璃態；411/AI-14 RWD 小螢幕全寬、大螢幕 max-w */}
                  <div className={`flex flex-col w-full max-w-[85%] md:max-w-2xl min-w-0 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`
                            relative px-6 py-4 rounded-3xl text-[15px] leading-relaxed tracking-wide
                            ${message.role === 'user'
                        ? 'bg-primary-500/20 border border-primary-500/30 text-white rounded-tr-sm shadow-lg text-right'
                        : 'glass-card bg-white/[0.06] border border-white/10 text-gray-100 rounded-tl-sm backdrop-blur-xl text-left'}
                        `}>
                      {message.role === 'assistant' ? (
                        <MarkdownMessage content={message.content?.trim() ? message.content : t('assistant.emptyReply')} />
                      ) : (
                        message.content
                      )}
                      {message.role === 'assistant' && isLoading && messages[messages.length - 1]?.id === message.id && !message.content && (
                        <span className="inline-flex gap-1 ml-1">
                          <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-primary-400/80 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-primary-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>
                    {/* 141, 143-145 結構化酒款卡片（AI 回傳 [WINES] 時）；WineRec-10/11/20 grid RWD、不遮擋、ARIA */}
                    {message.role === 'assistant' && message.wines?.length ? (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full min-w-0" role="region" aria-label={`推薦 ${message.wines.length} 款酒`}>
                        {message.wines.map((wine) => (
                          <WineCard
                            key={wine.id}
                            wine={wine}
                            onAddToWishlist={addToWishlistWine}
                            inWishlist={isWineInWishlist(wine.id)}
                            variant="horizontal"
                          />
                        ))}
                      </div>
                    ) : null}
                    {/* 129 訊息時間戳記：用戶與 AI 皆顯示 */}
                    <span className={`mt-1.5 text-[10px] font-mono text-white/30 ${message.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                      {message.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* 對話主題標籤 */}
                    {message.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {message.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {/* 來源引用樣式：數字上標 [1]，hover 顯示來源 */}
                    {message.role === 'assistant' && message.sources?.length ? (
                      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
                        {message.sources.map((s) => (
                          <span key={s.index} className="text-xs text-white/50 hover:text-white/80 transition-colors cursor-default" title={s.source}>
                            <sup className="text-[10px] font-mono">[{s.index}]</sup> {s.source.slice(0, 40)}{s.source.length > 40 ? '…' : ''}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {/* 相似問題推薦 */}
                    {message.role === 'assistant' && message.similarQuestions?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.similarQuestions.map((q) => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="text-xs px-3 py-1.5 min-h-[48px] rounded-full bg-white/5 border border-white/10 hover:border-primary-500/40 text-white/70 hover:text-white transition-colors games-focus-ring"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {/* 訊息底部右側：複製/朗讀/願望清單；回饋 👍👎 點擊後變色；48px 觸控 */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-3 ml-auto flex-wrap justify-end">
                        <button onClick={() => copyMessage(message.content)} className="p-1.5 min-h-[48px] min-w-[48px] rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors games-focus-ring flex items-center justify-center" title={t('assistant.copy')}>
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => speakReply(message.content)} className="p-1.5 min-h-[48px] min-w-[48px] rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors games-focus-ring flex items-center justify-center" title={t('assistant.speak')}>
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => addToWishlist(message.content, message.id)} className="p-1.5 min-h-[48px] min-w-[48px] rounded-lg text-white/30 hover:text-primary-400 transition-colors games-focus-ring flex items-center justify-center" title={t('assistant.addToWishlist')}>
                          <Heart className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleLike(message.id, true)} className={`p-1.5 min-h-[48px] min-w-[48px] rounded-lg transition-colors games-focus-ring flex items-center justify-center ${message.liked === true ? 'text-primary-500 bg-primary-500/20' : 'text-white/30 hover:text-primary-400 hover:bg-white/10'}`} title="讚">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleLike(message.id, false)} className={`p-1.5 min-h-[48px] min-w-[48px] rounded-lg transition-colors games-focus-ring flex items-center justify-center ${message.liked === false ? 'text-red-400 bg-red-500/20' : 'text-white/30 hover:text-red-400 hover:bg-white/10'}`} title="倒讚">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {/* 任務 55：👎 後可選填文字回饋 */}
                    {message.role === 'assistant' && feedbackMessageId === message.id && (
                      <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2 max-w-sm">
                        <label className="text-xs text-white/60">{t('assistant.improveHint')}</label>
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder={t('assistant.placeholderFeedback')}
                          maxLength={500}
                          rows={2}
                          className="input-glass text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { setFeedbackMessageId(null); setFeedbackText(''); }} className="px-3 py-1.5 min-h-[48px] rounded-lg text-white/60 hover:text-white text-sm games-focus-ring">{t('assistant.skip')}</button>
                          <button type="button" onClick={() => submitFeedback(message.id)} className="px-3 py-1.5 min-h-[48px] rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm games-focus-ring">{t('assistant.send')}</button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 128 打字中動畫指示 */}
            {/* 載入中動畫：三個漸變圓點跳動 */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-6 items-center"
                aria-live="polite"
                aria-label="AI 正在回覆"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-white/10 flex-shrink-0 overflow-hidden animate-pulse">
                  <Image src="/sizes/icon_128_gold.png" alt={BRAND_NAME} width={24} height={24} className="object-contain" />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary-400/80 to-secondary-400/80 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary-400/60 to-secondary-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-white/50">{t('assistant.repliesIn')}</span>
                </div>
              </motion.div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* P1：輸入區 fixed 底、safe-area、主內容區 padding-bottom 避免被擋 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-pb-min-1">
        <div className="max-w-3xl mx-auto">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label={t('assistant.uploadImage')}
            onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
          />
          <form
            onSubmit={handleSubmit}
            className="relative rounded-full focus-within:ring-2 focus-within:ring-primary-400/30 focus-within:ring-offset-2 focus-within:ring-offset-[#0a0a1a]"
            onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
            onDragLeave={() => setIsDraggingImage(false)}
            onDrop={handleImageDrop}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault()
                if (input.trim() && canSend) e.currentTarget.requestSubmit()
              }
            }}
          >
            <div className={`absolute inset-0 backdrop-blur-xl rounded-full border shadow-2xl transition-colors ${isDraggingImage ? 'bg-primary-500/20 border-primary-500/50' : 'bg-white/5 border-white/10'}`} />

            <div className="relative flex items-center pl-5 pr-2 py-2 gap-2">
              <button type="button" className="p-2.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring" title={t('assistant.knowledgeBase')}>
                <BookOpen className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring"
                title={t('assistant.uploadImage')}
                aria-label={t('assistant.uploadImage')}
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('assistant.placeholder')}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-white placeholder-white/40 px-2 py-3 min-h-[48px] font-medium text-[15px]"
                disabled={isLoading}
                title={t('assistant.ctrlEnter')}
              />

              <button
                type="button"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                aria-pressed={isListening}
                aria-label={isListening ? t('assistant.recordingStop') : t('assistant.voiceInput')}
                className={`p-2.5 rounded-full transition-colors shrink-0 min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring ${isListening ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
                title={isListening ? t('assistant.recordingStop') : t('assistant.voiceInput')}
              >
                {isListening ? <Square className="w-5 h-5" aria-hidden /> : <Mic className="w-5 h-5" aria-hidden />}
              </button>

              {isLoading ? (
                <button
                  type="button"
                  onClick={() => { userAbortedRef.current = true; abortRef.current?.abort() }}
                  className="min-h-[48px] min-w-[48px] flex items-center justify-center p-2.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 shrink-0 games-focus-ring"
                  title={t('assistant.stopReply')}
                  aria-label={t('assistant.stopReply')}
                >
                  <Square className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || !canSend}
                  className={`min-h-[48px] min-w-[48px] flex items-center justify-center p-2.5 rounded-full transition-all duration-300 shrink-0 games-focus-ring ${input.trim() && canSend
                      ? 'bg-primary-500 text-white shadow-[0_0_20px_rgba(139,0,0,0.4)] hover:scale-105'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  title={!canSend ? t('assistant.upgradeUnlock') : t('assistant.sendAria')}
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-[10px] text-white/30 mt-1.5" aria-hidden>{t('assistant.ctrlEnter')}</p>
          {/* 輸入長度提示 */}
          {input.length > 0 && (
            <p className={`text-center text-xs mt-2 ${input.length > 1800 ? 'text-orange-400' : 'text-white/40'}`}>
              {input.length}/2000 {t('assistant.charCount')}
              {input.length > 2000 && <span className="text-red-400 ml-1">（{t('assistant.overLimit')}）</span>}
            </p>
          )}
          {maxPerDay >= 0 && (
            <p className="text-center text-xs text-white/40 mt-2">
              {t('assistant.usedToday', { used: usedToday, max: maxPerDay })}
              {!canSend && (
                <button type="button" onClick={() => setShowUpgradeModal(true)} className="ml-2 text-primary-400 hover:underline">
                  {t('assistant.upgradeUnlock')}
                </button>
              )}
            </p>
          )}
          <p className="text-center text-[10px] text-white/20 mt-3 font-mono">
            {t('assistant.disclaimer')}
          </p>
          {/* 150 酒精健康提醒 */}
          <p className="text-center text-[10px] text-white/30 mt-2">
            {t('assistant.alcoholDisclaimer')}
          </p>
        </div>
      </div>

      {/* 134 清除對話確認 */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="rounded-2xl bg-dark-800 border border-white/10 p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white font-medium mb-4">{t('assistant.clearAllConfirm')}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 min-h-[48px] rounded-xl bg-white/10 text-white hover:bg-white/20 games-focus-ring"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={confirmClearChat}
                  className="flex-1 py-2.5 min-h-[48px] rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 games-focus-ring"
                >
                  {t('assistant.confirmClear')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={t('assistant.limitReachedTitle')}
        description={t('assistant.limitReachedDesc')}
        requiredTier="basic"
      />
    </main>
  );
}
