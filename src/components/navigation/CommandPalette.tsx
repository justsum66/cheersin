'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Search, Command, ArrowRight, Wine, Sparkles, Gamepad2, MessageCircle, GraduationCap, User, CreditCard, Settings, BookOpen, HelpCircle } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'

interface PaletteItem {
  id: string
  label: string
  href: string
  icon: React.ElementType
  keywords: string[]
  section: string
}

const PALETTE_ITEMS: PaletteItem[] = [
  { id: 'home', label: '首頁', href: '/', icon: Wine, keywords: ['home', '首頁', 'cheersin'], section: '導航' },
  { id: 'quiz', label: '靈魂酒測', href: '/quiz', icon: Sparkles, keywords: ['quiz', '酒測', '測驗', 'soul wine'], section: '導航' },
  { id: 'games', label: '派對遊戲', href: '/games', icon: Gamepad2, keywords: ['games', '遊戲', 'party', '派對'], section: '導航' },
  { id: 'assistant', label: 'AI 侍酒師', href: '/assistant', icon: MessageCircle, keywords: ['assistant', 'ai', '侍酒師', 'chat', '聊天'], section: '導航' },
  { id: 'learn', label: '品酒學院', href: '/learn', icon: GraduationCap, keywords: ['learn', '學習', '品酒', 'course', '課程'], section: '導航' },
  { id: 'profile', label: '個人檔案', href: '/profile', icon: User, keywords: ['profile', '個人', '帳號', 'account'], section: '帳號' },
  { id: 'pricing', label: '訂閱方案', href: '/pricing', icon: CreditCard, keywords: ['pricing', '訂閱', '方案', 'pro', 'vip', 'subscribe'], section: '帳號' },
  { id: 'subscription', label: '訂閱管理', href: '/subscription', icon: Settings, keywords: ['subscription', '管理', 'manage'], section: '帳號' },
  { id: 'script-murder', label: '劇本殺', href: '/script-murder', icon: BookOpen, keywords: ['script', 'murder', '劇本殺', '劇本'], section: '功能' },
  { id: 'party-dj', label: 'Party DJ', href: '/party-dj', icon: Sparkles, keywords: ['party', 'dj', '音樂', 'music'], section: '功能' },
  { id: 'about', label: '關於我們', href: '/about', icon: HelpCircle, keywords: ['about', '關於', '團隊'], section: '其他' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { t } = useTranslation()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PALETTE_ITEMS
    return PALETTE_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
    )
  }, [query])

  const openPalette = useCallback(() => {
    setOpen(true)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const navigate = useCallback(
    (href: string) => {
      closePalette()
      router.push(href)
    },
    [closePalette, router]
  )

  // Cmd/Ctrl+K global shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
        if (!open) {
          setQuery('')
          setSelectedIndex(0)
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard navigation within palette
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault()
        navigate(filtered[selectedIndex].href)
      } else if (e.key === 'Escape') {
        closePalette()
      }
    },
    [filtered, selectedIndex, navigate, closePalette]
  )

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    const selected = listRef.current?.children[selectedIndex] as HTMLElement | undefined
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closePalette}
          />

          {/* Palette */}
          <m.div
            className="relative w-full max-w-lg mx-4 bg-[#1a0a2e] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            onKeyDown={onKeyDown}
            role="dialog"
            aria-label="快速導航"
            aria-modal="true"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search className="w-5 h-5 text-white/40 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="輸入頁面名稱或功能..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 focus:outline-none"
                aria-label="搜尋頁面"
                autoComplete="off"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-white/30 bg-white/5 border border-white/10 rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[300px] overflow-y-auto py-2" role="listbox">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center text-white/40 text-sm">找不到結果</p>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon
                  const isSelected = idx === selectedIndex
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        isSelected ? 'bg-primary-500/15 text-white' : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-white/40" />
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="text-[10px] text-white/20">{item.section}</span>
                      {isSelected && <ArrowRight className="w-3 h-3 text-primary-400" />}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] text-white/25">
              <span>↑↓ 選擇 · Enter 前往 · Esc 關閉</span>
              <span className="inline-flex items-center gap-1">
                <Command className="w-3 h-3" />K 開啟
              </span>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
