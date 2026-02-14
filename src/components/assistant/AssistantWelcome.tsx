'use client'

/** AST-28：歡迎區 — 場合/預算/口味、快捷提問、SUGGESTION_CATEGORIES、知識/Pro 連結 */

import Link from 'next/link'
import { m } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Wine, BookOpen, Crown, Search } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'

export interface QuickPromptItem {
  icon: LucideIcon
  text: string
  href?: string
}

export interface SuggestionCategoryItem {
  title: string
  icon: LucideIcon
  questions: string[]
}

export interface AssistantWelcomeProps {
  occasion: string | null
  setOccasion: (v: string | null) => void
  budget: string | null
  setBudget: (v: string | null) => void
  preferredWineTypes: string[]
  setPreferredWineTypes: (fn: (prev: string[]) => string[]) => void
  tasteOptions: string[]
  quickPrompts: QuickPromptItem[]
  suggestionCategories: SuggestionCategoryItem[]
  activeCategory: number
  setActiveCategory: (index: number) => void
  onSetInput: (text: string) => void
  onFocusInput: () => void
  onSendMessage: (text: string) => void
}

export function AssistantWelcome({
  occasion,
  setOccasion,
  budget,
  setBudget,
  preferredWineTypes,
  setPreferredWineTypes,
  tasteOptions,
  quickPrompts,
  suggestionCategories,
  activeCategory,
  setActiveCategory,
  onSetInput,
  onFocusInput,
  onSendMessage,
}: AssistantWelcomeProps) {
  const { t } = useTranslation()

  return (
    <m.div
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

        <m.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="home-heading-2 font-display font-bold mb-4 text-balance"
        >
          {t('assistant.todayExplore')} <br />
          <span className="gradient-text">{t('assistant.flavorJourney')}</span>
        </m.h2>

        <p className="home-body text-white/70 max-w-lg mx-auto mb-2">
          {t('assistant.welcomeSubtitle')}
        </p>
        <p className="home-text-muted text-sm max-w-md mx-auto">
          {t('assistant.trySuggestions')}
        </p>
      </div>

      <m.div
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
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[48px] min-w-[48px] ${occasion === occ ? 'bg-primary-500/30 border border-primary-500/50 text-white' : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'}`}
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
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[48px] min-w-[48px] ${budget === b ? 'bg-primary-500/30 border border-primary-500/50 text-white' : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'}`}
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
          {tasteOptions.map((optKey) => {
            const isSelected = preferredWineTypes.includes(optKey)
            return (
              <button
                key={optKey}
                type="button"
                onClick={() => setPreferredWineTypes((prev) => (isSelected ? prev.filter((x) => x !== optKey) : [...prev, optKey]))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[48px] min-w-[48px] ${isSelected ? 'bg-secondary-500/30 border border-secondary-500/50 text-white' : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'}`}
              >
                {t(`assistant.${optKey}`)}
              </button>
            )
          })}
        </div>
        {preferredWineTypes.length > 0 && (
          <p className="text-white/50 text-xs w-full text-center mt-2">
            {t('assistant.preferredFilters', { value: preferredWineTypes.map((k) => t(`assistant.${k}`)).join('、') })}
          </p>
        )}
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex overflow-x-auto gap-3 mb-12 pb-2 -mx-2 px-2 scrollbar-hide justify-start md:justify-center"
      >
        {quickPrompts.map((prompt) =>
          prompt.href ? (
            <Link key={prompt.text} href={prompt.href}>
              <m.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="shrink-0 min-h-[48px] min-w-[48px] px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm font-medium flex items-center gap-2 transition-colors games-focus-ring inline-flex"
              >
                <prompt.icon className="w-4 h-4 text-primary-400 shrink-0" />
                <span>{prompt.text}</span>
              </m.span>
            </Link>
          ) : (
            <m.button
              key={prompt.text}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onSetInput(prompt.text); onFocusInput(); }}
              className="shrink-0 min-h-[48px] min-w-[48px] px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm font-medium flex items-center gap-2 transition-colors games-focus-ring"
            >
              <prompt.icon className="w-4 h-4 text-primary-400 shrink-0" />
              <span>{prompt.text}</span>
            </m.button>
          )
        )}
      </m.div>

      <div className="mb-8">
        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {suggestionCategories.map((cat, index) => (
            <button
              key={cat.title}
              onClick={() => setActiveCategory(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[48px] min-w-[48px] ${activeCategory === index
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
          {suggestionCategories[activeCategory].questions.map((q, i) => (
            <m.button
              key={q}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSendMessage(q)}
              className="glass-card p-4 text-left min-h-[48px] rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/10 group transition-all games-focus-ring"
            >
              <div className="flex items-center justify-between">
                <span className="text-white/70 group-hover:text-white text-sm">{q}</span>
                <Search className="w-3 h-3 text-white/20 group-hover:text-primary-500" />
              </div>
            </m.button>
          ))}
        </div>
      </div>

      <m.div
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
      </m.div>
      <m.div
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
      </m.div>
    </m.div>
  )
}
