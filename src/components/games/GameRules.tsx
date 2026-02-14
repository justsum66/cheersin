'use client'

import { useState, useEffect } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useGameRulesContext } from './GameWrapper'

interface GameRulesProps {
  /** 規則內文，支援多行 */
  rules: string
  /** 標題，預設「規則」 */
  title?: string
  /** 33–35 i18n：可選，供未來 data-i18n-key 對應規則文案 */
  rulesKey?: string
}

/** 可收合規則區塊，供各遊戲共用。無障礙：aria-expanded、按鈕可聚焦。長按遊戲內容區可由 GameWrapper 顯示規則。 */
export default function GameRules({ rules, title = '規則', rulesKey }: GameRulesProps) {
  const [open, setOpen] = useState(false)
  const ctx = useGameRulesContext()

  useEffect(() => {
    ctx?.setRulesContent(rules)
    return () => ctx?.setRulesContent(null)
  }, [ctx, rules])

  return (
    <section className="mb-4 w-full max-w-lg mx-auto" aria-label={title} {...(rulesKey ? { 'data-i18n-key': rulesKey } : {})}>
      {/* RWD-8：規則按鈕 48px、焦點環；內文 max-h-48 overflow-y-auto 已於下方套用 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="games-focus-ring games-touch-target flex items-center gap-2 w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
        aria-expanded={open}
        aria-controls="game-rules-content"
        id="game-rules-toggle"
      >
        <HelpCircle className="w-4 h-4 shrink-0" />
        <span>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            key="rules-content"
            id="game-rules-content"
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* RWD-14 內文 text-base md:text-lg；RWD-18 leading-relaxed；RWD-8 max-h-48 */}
            <p className="games-body mt-2 px-3 py-2 text-white/60 whitespace-pre-line border border-white/10 rounded-xl bg-white/[0.02] leading-relaxed max-h-48 overflow-y-auto">
              {rules}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  )
}
