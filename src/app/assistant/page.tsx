'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { FixedSizeList as List } from 'react-window'
import {
  Bot, Sparkles, Wine,
  Settings, Zap, Crown,
  Beer, Gift, Heart, Coins, Gamepad2, Users, Music2,
  Utensils
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { BRAND_NAME } from '@/components/BrandLogo'
import type { AssistantMessage, AssistantMessageStored, WineCardDataFromAI } from '@/types/assistant'
import {
  CHAT_HISTORY_KEY,
  MAX_HISTORY_MESSAGES,
  MAX_CONTEXT_MESSAGES,
  CHAT_TIMEOUT_MS,
  MAX_IMAGE_MB,
  QUIZ_RESULT_KEY,
  TASTE_PREFERENCES_KEY,
  WISHLIST_KEY,
  FEEDBACK_STORAGE_KEY,
  MAX_FEEDBACK_ENTRIES,
  VIRTUALIZE_MESSAGES_THRESHOLD,
  VIRTUAL_MESSAGE_ESTIMATED_HEIGHT,
} from '@/config/assistant.config'
import { useTranslation } from '@/contexts/I18nContext'
import { formatDateTime } from '@/lib/formatters'
import { sanitizeForExport } from '@/lib/assistant-export'
import { UpgradeModal } from '@/components/UpgradeModal'
import { logger } from '@/lib/logger'
import { AssistantHeader } from '@/components/assistant/AssistantHeader'
import { AssistantHistorySidebar } from '@/components/assistant/AssistantHistorySidebar'
import { AssistantWelcome } from '@/components/assistant/AssistantWelcome'
import { AssistantInputBar } from '@/components/assistant/AssistantInputBar'
import { AssistantMessageBubble } from '@/components/assistant/AssistantMessageBubble'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useAssistantHistory } from '@/hooks/useAssistantHistory'
import { useAssistantChat } from '@/hooks/useAssistantChat'

/** AST-33：建議分類 i18n key 前綴與 icon 對應 */
const SUGGESTION_CATEGORY_KEYS: { key: string; icon: typeof Wine }[] = [
  { key: 'Wine', icon: Wine },
  { key: 'Spirits', icon: Beer },
  { key: 'Pairing', icon: Utensils },
  { key: 'Asia', icon: Zap },
  { key: 'Party', icon: Gamepad2 },
]

/** AST-35：口味選項 i18n key（preferredWineTypes 存 key，送 API 時在 hook 內譯為文案） */
const TASTE_OPTION_KEYS = ['tasteRed', 'tasteWhite', 'tasteRose', 'tasteChampagne', 'tasteWhisky', 'tasteSake', 'tasteBeer', 'tasteCocktail'] as const

/** 舊版 localStorage 口味文案 → 新 key，僅用於初次載入遷移 */
const LEGACY_TASTE_TO_KEY: Record<string, string> = {
  紅酒: 'tasteRed', 白酒: 'tasteWhite', 粉紅酒: 'tasteRose', 香檳: 'tasteChampagne',
  威士忌: 'tasteWhisky', 清酒: 'tasteSake', 啤酒: 'tasteBeer', 調酒: 'tasteCocktail',
}

/** AST-35：快捷提問 i18n key 與 icon、href */
const QUICK_PROMPT_KEYS: { key: string; icon: typeof Gamepad2; href?: string }[] = [
  { key: 'PickGame', icon: Gamepad2 },
  { key: 'Party4', icon: Users },
  { key: 'PartyPlan', icon: Music2, href: '/party-dj' },
  { key: 'Gift', icon: Gift },
  { key: 'Date', icon: Heart },
  { key: 'Value', icon: Coins },
  { key: 'Steak', icon: Utensils },
]

/** AST-01：虛擬列表單一列；react-window 2.x List 傳入 rowComponent，收到 index + style + rowProps */
type VirtualRowProps = {
  messages: AssistantMessage[]
  isLoading: boolean
  prefersReducedMotion: boolean
  speakingMessageId: string | null
  feedbackMessageId: string | null
  feedbackText: string
  sendMessage: (content: string, imageBase64?: string) => void
  copyMessage: (content: string) => void
  speakReply: (content: string, messageId: string) => void
  setSpeakingMessageId: (id: string | null) => void
  addToWishlist: (content: string, messageId: string) => void
  handleLike: (messageId: string, liked: boolean) => void
  handleRetryFromError: (messageId: string) => void
  setFeedbackText: (v: string) => void
  submitFeedback: (messageId: string) => void
  setFeedbackMessageId: (id: string | null) => void
  addToWishlistWine: (wine: WineCardDataFromAI) => void
  isWineInWishlist: (wineId: string) => boolean
  t: (key: string, opts?: Record<string, string | number>) => string
}

function VirtualMessageRow({
  index,
  style,
  ...data
}: { index: number; style: React.CSSProperties } & VirtualRowProps) {
  const message = data.messages[index]
  return (
    <div style={style}>
      <AssistantMessageBubble
        message={message}
        isLastAndLoading={data.isLoading && data.messages[data.messages.length - 1]?.id === message.id}
        prefersReducedMotion={data.prefersReducedMotion}
        speakingMessageId={data.speakingMessageId}
        isFeedbackOpen={data.feedbackMessageId === message.id}
        feedbackText={data.feedbackText}
        onSendMessage={data.sendMessage}
        onCopy={data.copyMessage}
        onSpeak={data.speakReply}
        onStopSpeak={() => {
          if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
          data.setSpeakingMessageId(null)
        }}
        onAddToWishlistMessage={data.addToWishlist}
        onLike={data.handleLike}
        onRetry={data.handleRetryFromError}
        onFeedbackTextChange={data.setFeedbackText}
        onSubmitFeedback={data.submitFeedback}
        onCloseFeedback={() => {
          data.setFeedbackMessageId(null)
          data.setFeedbackText('')
        }}
        onAddToWishlistWine={data.addToWishlistWine}
        isWineInWishlist={data.isWineInWishlist}
        t={data.t}
      />
    </div>
  )
}

export default function AssistantPage() {
  const { t, locale } = useTranslation()
  /** AST-33：建議分類由 i18n 組裝 */
  const suggestionCategories = useMemo(
    () =>
      SUGGESTION_CATEGORY_KEYS.map(({ key, icon }) => ({
        title: t(`assistant.suggestionCategory${key}Title`),
        icon,
        questions: [
          t(`assistant.suggestionCategory${key}Q1`),
          t(`assistant.suggestionCategory${key}Q2`),
          t(`assistant.suggestionCategory${key}Q3`),
        ],
      })),
    [t]
  )
  /** AST-35：快捷提問由 i18n 組裝 */
  const quickPrompts = useMemo(
    () =>
      QUICK_PROMPT_KEYS.map(({ key, icon, href }) => ({
        icon,
        text: t(`assistant.quickPrompt${key}`),
        ...(href ? { href } : {}),
      })),
    [t]
  )
  const [input, setInput] = useState('')
  const [activeCategory, setActiveCategory] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null)
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
      if (!Array.isArray(parsed)) return []
      return parsed.map((v) => (LEGACY_TASTE_TO_KEY[v] ?? v))
    } catch {
      return []
    }
  })
  const [personality, setPersonality] = useState<'fun' | 'pro'>('fun')

  /** AST-25：對話與送訊邏輯 */
  const {
    messages,
    setMessages,
    isLoading,
    sendMessage,
    abortRef,
    userAbortedRef,
    canSend,
    usedToday,
    maxPerDay,
  } = useAssistantChat({
    personality,
    occasion,
    budget,
    preferredWineTypes,
    setShowUpgradeModal: (show, reason) => {
      setShowUpgradeModal(show)
      if (reason) setUpgradeReason(reason)
    },
    clearInput: () => setInput(''),
  })

  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<{ stop: () => void } | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  /** C45 {t('assistant.history')}側欄：左側滑出、日期分組、搜索過濾 */
  const [showHistorySidebar, setShowHistorySidebar] = useState(false)
  /** AST-19：新助理訊息時 aria-live 朗讀摘要 */
  const [liveAnnounce, setLiveAnnounce] = useState('')
  const lastAnnouncedMessageIdRef = useRef<string | null>(null)
  /** AST-20：歷史側欄關閉時焦點回到此按鈕 */
  const historyButtonRef = useRef<HTMLButtonElement | null>(null)
  /** AST-01：虛擬列表用 — 可滾動區高度 */
  const chatScrollRef = useRef<HTMLDivElement | null>(null)
  const [listHeight, setListHeight] = useState(400)
  /** AST-43：離線時禁用送出 */
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  /** AST-42：建議問題橫向捲動區，focus 時 scrollIntoView */
  const suggestionsScrollRef = useRef<HTMLDivElement | null>(null)
  /** AST-17：對話區捲動時是否顯示「回到最新」按鈕 */
  const [showBackToLatest, setShowBackToLatest] = useState(false)
  const [historySearchQuery, setHistorySearchQuery] = useState('')
  /** C47 圖片上傳：拖拽狀態（相機圖標 + 拖拽上傳） */
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  /** AST-15：選圖後預覽，確認再送出 — { dataUrl 預覽, base64 送 API } */
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; base64: string } | null>(null)
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

  /** B1 Task 48：根據上一則 AI 回覆的 similarQuestions 動態顯示建議問題；PERF：memoize reverse find */
  const dynamicSuggestions = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === 'assistant' && (m.content?.trim() ?? '').length > 0)
    return last?.similarQuestions?.slice(0, 6) ?? []
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

  /** AST-16：Esc 關閉歷史側欄或語言下拉，焦點回到輸入區 */
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (showHistorySidebar) {
        setShowHistorySidebar(false)
        inputRef.current?.focus()
      } else if (languageDropdownOpen) {
        setLanguageDropdownOpen(false)
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [showHistorySidebar, languageDropdownOpen])

  /** AST-19：當最後一則為助理訊息且尚未朗讀過時，更新 aria-live 區域 */
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant' && last.id !== lastAnnouncedMessageIdRef.current) {
      lastAnnouncedMessageIdRef.current = last.id
      setLiveAnnounce(t('assistant.newReplyAnnounce'))
    }
  }, [messages, t])

  /** AST-01：量測可滾動區高度，供虛擬列表使用 */
  useEffect(() => {
    const el = chatScrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setListHeight(el.clientHeight)
    })
    ro.observe(el)
    setListHeight(el.clientHeight)
    return () => ro.disconnect()
  }, [])

  /** AST-43：監聽線上/離線 */
  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  /** AST-17：對話區捲動時，未貼底則顯示「回到最新」按鈕 */
  useEffect(() => {
    const el = chatScrollRef.current
    if (!el) return
    const check = () => {
      const { scrollTop, clientHeight, scrollHeight } = el
      setShowBackToLatest(scrollHeight - scrollTop - clientHeight > 120)
    }
    el.addEventListener('scroll', check, { passive: true })
    check()
    return () => el.removeEventListener('scroll', check)
  }, [messages.length])

  /** AST-42：建議問題橫向捲動區，鍵盤 focus 時將目前項捲入視窗 */
  const handleSuggestionsFocus = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest?.('button') && suggestionsScrollRef.current?.contains(target)) {
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
    }
  }, [])

  /** AILog-02 / AST-14：trim 後空字串不送 API，toast 提示；AST-15：有預覽圖時可僅送圖 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed && !pendingImage) {
      toast(t('assistant.emptySendHint'), { icon: '💬' })
      return
    }
    if (pendingImage) {
      sendMessage(trimmed || t('assistant.identifyWinePrompt'), pendingImage.base64)
      setPendingImage(null)
    } else {
      sendMessage(trimmed)
    }
  }

  /** AST-13：錯誤/逾時時重試；AST-45：重試不重算額度 */
  const handleRetryFromError = (errorMessageId: string) => {
    const idx = messages.findIndex((m) => m.id === errorMessageId)
    if (idx <= 0 || messages[idx]?.role !== 'assistant' || !messages[idx]?.isError) return
    const prevMsg = messages[idx - 1]
    if (prevMsg.role !== 'user') return
    const userContent = prevMsg.content
    setMessages((prev) => prev.filter((_, i) => i !== idx && i !== idx - 1))
    sendMessage(userContent, undefined, { skipIncrement: true })
  }

  /** 任務 55：文字回饋（👎 時可選填改進建議） */
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  /** R2-124：語音播報視覺 — 正在朗讀的訊息 id */
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
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
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list.slice(-MAX_FEEDBACK_ENTRIES)))
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

  /** AST-37：複製前淨化內容；SEC：clipboard API failure handling */
  const copyMessage = useCallback((content: string) => {
    const sanitized = sanitizeForExport(content, 100_000)
    navigator.clipboard.writeText(sanitized).catch(() => {
      toast.error(t('common.copyError'))
    })
  }, [t])

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

  const isWineInWishlist = useCallback((wineId: string): boolean => {
    if (typeof window === 'undefined') return false
    try {
      const raw = localStorage.getItem(WISHLIST_KEY)
      const list: { id: string }[] = raw ? JSON.parse(raw) : []
      return list.some((item) => item.id === wineId)
    } catch {
      return false
    }
  }, [])

  /** CLEANUP: 頁面離開時取消語音播報與語音輸入，防止記憶體洩漏 */
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
      recognitionRef.current?.stop()
    }
  }, [])

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

  const speakReply = (content?: string, messageId?: string) => {
    const text = content ?? [...messages].reverse().find((m) => m.role === 'assistant')?.content
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-TW'
    u.rate = 0.95
    u.onend = () => setSpeakingMessageId(null)
    u.onerror = () => setSpeakingMessageId(null)
    window.speechSynthesis.speak(u)
    setSpeakingMessageId(messageId ?? null)
  }

  /** AST-37：從最近一輪對話產生分享用文字（淨化後） */
  const getShareText = useCallback((): string => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
    const q = sanitizeForExport(lastUser?.content ?? '', 80) || '與 AI 侍酒師的對話'
    const a = sanitizeForExport(lastAssistant?.content ?? '', 120)
    const line = a ? `\n— ${a}${a.length >= 120 ? '…' : ''}` : ''
    return `Cheersin 侍酒師\nQ: ${q}${line}`
  }, [messages])

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

  /** AST-26：歷史載入/儲存/搜尋/分組 */
  const dateSortOrder = [t('assistant.today'), t('assistant.yesterday'), t('assistant.daysAgo', { n: 2 }), t('assistant.daysAgo', { n: 3 }), t('assistant.daysAgo', { n: 4 }), t('assistant.daysAgo', { n: 5 }), t('assistant.daysAgo', { n: 6 })]
  const { groupedByDate, sortedDateKeys, restartFromHere, clearAll } = useAssistantHistory(messages, setMessages, {
    searchQuery: historySearchQuery,
    getDateGroupLabel,
    dateSortOrder,
  })

  /** C45 側欄內點擊訊息後捲動至該訊息並關閉側欄 */
  const scrollToMessage = (messageId: string) => {
    setShowHistorySidebar(false)
    requestAnimationFrame(() => {
      document.getElementById(`msg-${messageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  /** B1-46 酒標辨識；AST-15：選圖後僅設預覽，送出時再送 API */
  const handleImageSelect = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(t('assistant.maxSizeImage', { max: MAX_IMAGE_MB }))
      if (imageInputRef.current) imageInputRef.current.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return
      const base64 = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : dataUrl
      setPendingImage({ dataUrl, base64 })
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

  /** 134 清除對話（需確認）；AST-26 使用 hook clearAll */
  const requestClearChat = () => setShowClearConfirm(true)
  const confirmClearChat = () => {
    clearAll()
    setShowClearConfirm(false)
  }

  /** EXPERT_60 P1/P2 + AST-46：關鍵行為埋點 — 送出/建議/歷史/專家/場合/預算/匯出/分享/截圖 */
  const trackAssistantAction = (action: 'export' | 'share' | 'screenshot' | 'vision' | 'history_open' | 'expert_toggle' | 'occasion_select' | 'budget_select' | 'suggestion_click') => {
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `assistant_${action}`, value: 1, id: 'assistant' }),
      }).catch(() => { })
    } catch { /* noop */ }
  }

  /** 135 匯出對話記錄為 .txt；AST-37 每則內容淨化 */
  const exportConversation = () => {
    if (messages.length === 0) return
    trackAssistantAction('export')
    const lines = messages.map((m) => {
      const time = formatDateTime(m.timestamp, locale)
      const who = m.role === 'user' ? t('assistant.me') : t('assistant.aiSommelier')
      const body = sanitizeForExport(m.content ?? '', 20_000)
      return `[${time}] ${who}：\n${body}`
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
      {/* AST-19：新助理訊息時螢幕閱讀器朗讀 */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic>
        {liveAnnounce}
      </div>
      {/* EXPERT_60 P1：額度用盡時固定橫幅；AST-24 與 live 文案一致、僅此處朗讀 */}
      {!canSend && (
        <div className="sticky top-0 z-[60] w-full py-3 px-4 bg-primary-900/95 border-b border-primary-500/30 text-center flex flex-wrap items-center justify-center gap-3" role="alert" aria-live="polite" aria-atomic>
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

      <AssistantHeader
        soulWineDisplay={soulWineDisplay}
        language={language}
        languageDropdownOpen={languageDropdownOpen}
        onLanguageToggle={() => setLanguageDropdownOpen((v) => !v)}
        onLanguageSelect={(loc) => { setLanguage(loc); setLanguageDropdownOpen(false) }}
        onShare={shareConversation}
        onExport={exportConversation}
        onScreenshot={downloadScreenshot}
        shareDisabled={messages.length === 0 || shareLoading}
        exportDisabled={messages.length === 0}
        personality={personality}
        onPersonalityToggle={() => {
          setPersonality((p) => (p === 'fun' ? 'pro' : 'fun'))
          trackAssistantAction('expert_toggle')
        }}
        showHistorySidebar={showHistorySidebar}
        onHistoryToggle={() => {
          setShowHistorySidebar((v) => {
            const next = !v
            if (next) trackAssistantAction('history_open')
            return next
          })
        }}
        languageDropdownRef={languageDropdownRef}
        historyButtonRef={historyButtonRef}
      />

      <AssistantHistorySidebar
        open={showHistorySidebar}
        onClose={() => {
          setShowHistorySidebar(false)
          requestAnimationFrame(() => historyButtonRef.current?.focus())
        }}
        groupedByDate={groupedByDate}
        sortedDateKeys={sortedDateKeys}
        searchQuery={historySearchQuery}
        onSearchChange={setHistorySearchQuery}
        onScrollToMessage={scrollToMessage}
        onRestartFromHere={(id) => {
          restartFromHere(id)
          setShowHistorySidebar(false)
          inputRef.current?.focus()
        }}
        onClearAll={() => {
          setShowHistorySidebar(false)
          requestClearChat()
        }}
      />

      {/* Chat Area；AST-01 虛擬化時量測高度用 */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 pt-0 pb-32 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <AssistantWelcome
              occasion={occasion}
              setOccasion={(v) => {
                trackAssistantAction('occasion_select')
                setOccasion(v)
              }}
              budget={budget}
              setBudget={(v) => {
                trackAssistantAction('budget_select')
                setBudget(v)
              }}
              preferredWineTypes={preferredWineTypes}
              setPreferredWineTypes={setPreferredWineTypes}
              tasteOptions={[...TASTE_OPTION_KEYS]}
              quickPrompts={quickPrompts}
              suggestionCategories={suggestionCategories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onSetInput={setInput}
              onFocusInput={() => inputRef.current?.focus()}
              onSendMessage={(q) => {
                trackAssistantAction('suggestion_click')
                sendMessage(q)
              }}
            />
          )}

          {/* B1 Task 48：有對話時根據上一則回覆顯示動態建議問題 */}
          {messages.length > 0 && dynamicSuggestions.length > 0 && (
            <m.div
              ref={suggestionsScrollRef}
              onFocus={handleSuggestionsFocus}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : undefined}
              className="flex overflow-x-auto gap-2 mb-6 pb-2 -mx-2 px-2 scrollbar-hide items-center"
            >
              <span className="text-white/40 text-xs shrink-0 mr-1">{t('assistant.fromLastReply')}</span>
              {dynamicSuggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    trackAssistantAction('suggestion_click')
                    sendMessage(q)
                  }}
                  className="shrink-0 px-4 py-2.5 min-h-[48px] min-w-[48px] rounded-full text-xs font-medium bg-white/5 border border-white/10 hover:border-primary-500/40 text-white/80 hover:text-white transition-colors games-focus-ring"
                >
                  {q}
                </button>
              ))}
            </m.div>
          )}

          {/* Messages List（89 分享用 ref）；AST-06 氣泡 memo；AST-01 超過閾值時虛擬化 */}
          {messages.length > VIRTUALIZE_MESSAGES_THRESHOLD ? (
            <div ref={messagesContainerRef} style={{ height: listHeight }}>
              <List<VirtualRowProps>
                rowComponent={VirtualMessageRow}
                rowCount={messages.length}
                rowHeight={VIRTUAL_MESSAGE_ESTIMATED_HEIGHT + 32}
                rowProps={{
                  messages,
                  isLoading,
                  prefersReducedMotion,
                  speakingMessageId,
                  feedbackMessageId,
                  feedbackText,
                  sendMessage,
                  copyMessage,
                  speakReply,
                  setSpeakingMessageId,
                  addToWishlist,
                  handleLike,
                  handleRetryFromError,
                  setFeedbackText,
                  submitFeedback,
                  setFeedbackMessageId,
                  addToWishlistWine,
                  isWineInWishlist,
                  t,
                }}
                style={{ height: listHeight, width: '100%' }}
              />
            </div>
          ) : (
            <div ref={messagesContainerRef} className="space-y-8">
              <AnimatePresence>
                {messages.map((message) => (
                  <AssistantMessageBubble
                    key={message.id}
                    message={message}
                    isLastAndLoading={isLoading && messages[messages.length - 1]?.id === message.id}
                    prefersReducedMotion={prefersReducedMotion}
                    speakingMessageId={speakingMessageId}
                    isFeedbackOpen={feedbackMessageId === message.id}
                    feedbackText={feedbackText}
                    onSendMessage={sendMessage}
                    onCopy={copyMessage}
                    onSpeak={speakReply}
                    onStopSpeak={() => { if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel(); setSpeakingMessageId(null) }}
                    onAddToWishlistMessage={addToWishlist}
                    onLike={handleLike}
                    onRetry={handleRetryFromError}
                    onFeedbackTextChange={setFeedbackText}
                    onSubmitFeedback={submitFeedback}
                    onCloseFeedback={() => { setFeedbackMessageId(null); setFeedbackText('') }}
                    onAddToWishlistWine={addToWishlistWine}
                    isWineInWishlist={isWineInWishlist}
                    t={t}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* 128 打字中動畫指示 */}
          {/* 載入中動畫：三個漸變圓點跳動 */}
          {isLoading && (
            <m.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : undefined}
              className="flex gap-6 items-center"
              aria-live="polite"
              aria-label={t('assistant.repliesIn')}
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
            </m.div>
          )}
        </div>
        <div ref={messagesEndRef} id="chat-latest" aria-hidden />
      </div>

      {/* AST-17：捲動上去時顯示「回到最新」按鈕 */}
      {showBackToLatest && messages.length > 0 && (
        <button
          type="button"
          onClick={() => document.getElementById('chat-latest')?.scrollIntoView({ behavior: 'smooth' })}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium hover:bg-white/20 transition-colors games-focus-ring"
          aria-label={t('assistant.backToLatest')}
        >
          {t('assistant.backToLatest')}
        </button>
      )}

      {/* AST-18：額度即將用盡時提示 */}
      {canSend && maxPerDay > 1 && usedToday === maxPerDay - 1 && (
        <p className="text-center text-xs text-amber-400/90 px-4 py-1" role="status">
          {t('assistant.quotaAlmostExhausted')}
        </p>
      )}

      {/* AST-50：全頁鍵盤快捷鍵說明 */}
      <p className="text-center text-[10px] text-white/30 px-4 pb-1 safe-area-pb" aria-hidden>
        {t('assistant.keyboardShortcuts')}
      </p>
      <AssistantInputBar
        inputRef={inputRef}
        imageInputRef={imageInputRef}
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onImageSelect={handleImageSelect}
        onImageDrop={handleImageDrop}
        isDraggingImage={isDraggingImage}
        setIsDraggingImage={setIsDraggingImage}
        isLoading={isLoading}
        canSend={canSend}
        isListening={isListening}
        onVoiceStart={startVoiceInput}
        onVoiceStop={stopVoiceInput}
        onStopReply={() => { userAbortedRef.current = true; abortRef.current?.abort() }}
        usedToday={usedToday}
        maxPerDay={maxPerDay}
        onUpgradeClick={() => setShowUpgradeModal(true)}
        isOffline={isOffline}
        pendingImageDataUrl={pendingImage?.dataUrl ?? null}
        onRemovePendingImage={() => setPendingImage(null)}
      />

      {/* 134 清除對話確認 */}
      <AnimatePresence>
        {showClearConfirm && (
          <m.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : undefined}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <m.div
              initial={prefersReducedMotion ? false : { scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={prefersReducedMotion ? { scale: 1 } : { scale: 0.9 }}
              transition={prefersReducedMotion ? { duration: 0 } : undefined}
              className="rounded-2xl bg-dark-800 border border-white/10 p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-modal="true"
              aria-label={t('assistant.clearAllConfirm')}
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
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={upgradeReason === 'daily_limit' ? t('assistant.dailyLimitReachedTitle') : undefined}
        description={upgradeReason === 'daily_limit' ? t('assistant.dailyLimitReachedDesc') : undefined}
        requiredTier="basic"
      />
    </main>
  );
}
