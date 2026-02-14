'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'

/** EXPERT_60 P2 / P1-043：404 友善化 — 返回首頁 + 熱門連結；i18n 接線 notFound.*。R2-288：提供搜尋功能 — 連結與輸入導向 /games?q=。 */
export default function NotFound() {
  const { t } = useTranslation()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) router.push(`/games?q=${encodeURIComponent(q)}`)
    else router.push('/games')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}
      role="main"
      aria-labelledby="not-found-title"
      aria-describedby="not-found-desc"
    >
      <h1 id="not-found-title" className="home-heading-2 font-display font-bold mb-2">
        <span className="gradient-text">404</span>
      </h1>
      <p id="not-found-desc" className="home-text-muted mb-2">{t('notFound.title')}</p>
      <p className="text-white/50 text-sm mb-6">{t('notFound.hint')}</p>
      <Link href="/" className="btn-primary mb-6">
        {t('notFound.back')}
      </Link>
      <p className="text-white/50 text-sm mb-2">搜尋遊戲</p>
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 mb-6 w-full max-w-xs">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="輸入關鍵字"
          className="flex-1 min-h-[48px] px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm games-focus-ring"
          aria-label="搜尋遊戲關鍵字"
        />
        <button type="submit" className="btn-secondary min-h-[48px] inline-flex items-center justify-center gap-2 text-sm">
          <Search className="w-4 h-4" aria-hidden />
          前往搜尋
        </button>
      </form>
      <p className="text-white/50 text-sm mb-3">{t('notFound.popularLinks')}</p>
      <nav className="flex flex-wrap justify-center gap-3" aria-label={t('notFound.popularLinks')}>
        <Link href="/quiz" className="btn-ghost min-h-[48px] inline-flex items-center justify-center text-sm">
          {t('nav.quiz')}
        </Link>
        <Link href="/games" className="btn-ghost min-h-[48px] inline-flex items-center justify-center text-sm">
          {t('nav.games')}
        </Link>
        <Link href="/pricing" className="btn-ghost min-h-[48px] inline-flex items-center justify-center text-sm">
          {t('nav.pricing')}
        </Link>
      </nav>
    </div>
  )
}
