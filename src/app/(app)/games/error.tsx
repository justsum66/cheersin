'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/contexts/I18nContext'
import { logger } from '@/lib/logger'

/** GAMES_500 #10：遊戲頁路由錯誤邊界專用文案 — 遊戲頁載入失敗時顯示；i18n Phase 3 t('gamesError.*') */
export default function GamesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useTranslation()
  useEffect(() => {
    logger.error('[Games]', { message: error instanceof Error ? error.message : String(error) })
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 games-content"
      style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}
      role="alert"
      aria-labelledby="games-error-title"
      aria-describedby="games-error-desc"
    >
      <h1 id="games-error-title" className="text-xl font-bold text-white mb-2">
        {t('gamesError.title')}
      </h1>
      <p id="games-error-desc" className="text-white/60 text-sm text-center max-w-md mb-6">
        {t('gamesError.desc')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-primary min-h-[48px] px-6"
          aria-label={t('gamesError.retry')}
        >
          {t('gamesError.retry')}
        </button>
        <Link
          href="/games"
          className="btn-ghost min-h-[48px] inline-flex items-center justify-center px-6"
          aria-label={t('gamesError.backLobby')}
        >
          {t('gamesError.backLobby')}
        </Link>
      </div>
    </div>
  )
}
