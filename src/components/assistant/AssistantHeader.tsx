'use client'

/** AST-27：頂部區塊 — logo、語言、分享、專家模式、歷史、匯出、截圖；AST-21 listbox 鍵盤 */

import { useRef, useLayoutEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { m, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronDown,
  Globe,
  Share2,
  Zap,
  History,
  Download,
  Camera,
} from 'lucide-react'
import { BRAND_NAME } from '@/components/BrandLogo'
import { useTranslation } from '@/contexts/I18nContext'

export interface AssistantHeaderProps {
  soulWineDisplay: string | null
  language: 'zh-TW' | 'en'
  languageDropdownOpen: boolean
  onLanguageToggle: () => void
  onLanguageSelect: (loc: 'zh-TW' | 'en') => void
  onShare: () => void
  onExport: () => void
  onScreenshot: () => void
  shareDisabled: boolean
  exportDisabled: boolean
  personality: 'fun' | 'pro'
  onPersonalityToggle: () => void
  showHistorySidebar: boolean
  onHistoryToggle: () => void
  languageDropdownRef: React.RefObject<HTMLDivElement | null>
  /** AST-20：關閉歷史側欄時焦點回到此按鈕 */
  historyButtonRef?: React.RefObject<HTMLButtonElement | null>
}

export function AssistantHeader({
  soulWineDisplay,
  language,
  languageDropdownOpen,
  onLanguageToggle,
  onLanguageSelect,
  onShare,
  onExport,
  onScreenshot,
  shareDisabled,
  exportDisabled,
  personality,
  onPersonalityToggle,
  showHistorySidebar,
  onHistoryToggle,
  languageDropdownRef,
  historyButtonRef,
}: AssistantHeaderProps) {
  const { t } = useTranslation()
  const listboxRef = useRef<HTMLUListElement | null>(null)

  useLayoutEffect(() => {
    if (!languageDropdownOpen || !listboxRef.current) return
    listboxRef.current.focus()
  }, [languageDropdownOpen])

  const handleListboxKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const list = listboxRef.current
    if (!list) return
    const options = Array.from(list.querySelectorAll<HTMLElement>('[role="option"]'))
    if (options.length === 0) return
    const current = options.findIndex((el) => el.contains(document.activeElement))
    let next = current
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      next = current < options.length - 1 ? current + 1 : 0
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      next = current <= 0 ? options.length - 1 : current - 1
    } else if (e.key === 'Enter' && current >= 0) {
      e.preventDefault()
      options[current].querySelector<HTMLButtonElement>('button')?.click()
      return
    } else return
    options[next]?.querySelector<HTMLButtonElement>('button')?.focus()
  }

  return (
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
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-white/10 overflow-hidden">
                <Image src="/sizes/icon_128_gold.png" alt={BRAND_NAME} width={24} height={24} className="object-contain" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500 border-2 border-dark-950" />
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
            <div className="relative" ref={languageDropdownRef}>
              <button
                type="button"
                onClick={onLanguageToggle}
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
                  <m.ul
                    ref={listboxRef}
                    role="listbox"
                    tabIndex={0}
                    onKeyDown={handleListboxKeyDown}
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                      mass: 0.8,
                    }}
                    className="absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-xl bg-dark-800 border border-white/10 shadow-xl z-50"
                  >
                    {(['zh-TW', 'en'] as const).map((loc) => (
                      <li key={loc} role="option" aria-selected={language === loc}>
                        <button
                          type="button"
                          onClick={() => onLanguageSelect(loc)}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${language === loc ? 'bg-primary-500/20 text-primary-300' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                        >
                          {loc === 'zh-TW' ? t('assistant.zhTW') : t('assistant.en')}
                        </button>
                      </li>
                    ))}
                  </m.ul>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={onShare}
              disabled={shareDisabled}
              className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-40 transition-colors"
              title={t('assistant.shareConversation')}
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onPersonalityToggle}
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
              ref={historyButtonRef}
              type="button"
              onClick={onHistoryToggle}
              className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              title={t('assistant.history')}
              aria-expanded={showHistorySidebar}
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={onExport}
              disabled={exportDisabled}
              className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-40 transition-colors"
              title={t('assistant.exportTxt')}
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onScreenshot}
              disabled={shareDisabled}
              className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-40 transition-colors"
              title={t('assistant.downloadScreenshot')}
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
