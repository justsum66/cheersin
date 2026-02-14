'use client'

/** AST-29：歷史側欄 — 左側滑出、日期分組、搜尋、從此重新開始、清除所有；AST-20 focus trap */

import { useLayoutEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { MessageSquare, Search } from 'lucide-react'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import { useTranslation } from '@/contexts/I18nContext'
import type { AssistantMessage } from '@/types/assistant'

export interface AssistantHistorySidebarProps {
  open: boolean
  onClose: () => void
  groupedByDate: Record<string, AssistantMessage[]>
  sortedDateKeys: string[]
  searchQuery: string
  onSearchChange: (value: string) => void
  onScrollToMessage: (messageId: string) => void
  onRestartFromHere: (messageId: string) => void
  onClearAll: () => void
}

export function AssistantHistorySidebar({
  open,
  onClose,
  groupedByDate,
  sortedDateKeys,
  searchQuery,
  onSearchChange,
  onScrollToMessage,
  onRestartFromHere,
  onClearAll,
}: AssistantHistorySidebarProps) {
  const { t } = useTranslation()
  const hasMessages = sortedDateKeys.some((key) => (groupedByDate[key]?.length ?? 0) > 0)
  const asideRef = useRef<HTMLElement | null>(null)

  /** AST-20：側欄開啟時將焦點移入側欄第一個可聚焦元素 */
  useLayoutEffect(() => {
    if (!open) return
    const el = asideRef.current
    if (!el) return
    const focusable = el.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <m.aside
            ref={asideRef}
            className="fixed left-0 top-0 bottom-0 w-full sm:w-[min(320px,85vw)] z-[61] bg-dark-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 1,
            }}
            aria-label={t('assistant.history')}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="font-display font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-400" />
                {t('assistant.history')}
              </h2>
              <ModalCloseButton onClick={onClose} aria-label={t('common.close')} />
            </div>
            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t('assistant.searchPlaceholder')}
                  className="input-glass pl-9 text-sm"
                  aria-label={t('assistant.searchPlaceholder')}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {!hasMessages ? (
                <p className="text-white/40 text-sm text-center py-8">{t('assistant.noHistory')}</p>
              ) : (
                <div className="space-y-4">
                  {sortedDateKeys.map((label) => (
                    <div key={label}>
                      <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2 px-2">{label}</p>
                      <ul className="space-y-1">
                        {(groupedByDate[label] ?? []).map((m) => (
                          <li key={m.id} className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => onScrollToMessage(m.id)}
                              className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors min-h-[48px]"
                            >
                              <span className={`text-xs font-medium ${m.role === 'user' ? 'text-primary-300' : 'text-white/70'}`}>
                                {m.role === 'user' ? t('assistant.me') : t('assistant.aiSommelier')}
                              </span>
                              <p className="text-white/80 text-sm truncate mt-0.5">{m.content || t('assistant.emptyReply')}</p>
                              <p className="text-white/40 text-[10px] mt-1">{m.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</p>
                            </button>
                            <button
                              type="button"
                              onClick={() => onRestartFromHere(m.id)}
                              className="text-left px-3 py-1.5 rounded-lg text-[11px] text-primary-400 hover:bg-primary-500/10 border border-transparent hover:border-primary-500/20 min-h-[48px] min-w-[48px]"
                            >
                              {t('assistant.restartFromHere')}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClearAll}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors min-h-[48px]"
                title={t('assistant.clearAll')}
              >
                {t('assistant.clearAll')}
              </button>
            </div>
          </m.aside>
        </>
      )}
    </AnimatePresence>
  )
}
