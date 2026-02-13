'use client'

import { useEffect } from 'react'
import { PageErrorContent } from '@/components/PageErrorContent'
import { useTranslation } from '@/contexts/I18nContext'
import { logger } from '@/lib/logger'

/** GAMES_500 #10 / UX-007：遊戲頁錯誤邊界 — 使用 PageErrorContent 與設計系統一致 */
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
    <PageErrorContent
      title={t('gamesError.title')}
      description={t('gamesError.desc')}
      onRetry={reset}
      retryLabel={t('gamesError.retry')}
      className="games-content bg-[linear-gradient(180deg,#1a0a2e_0%,#0a0a0a_100%)]"
      links={[{ href: '/games', label: t('gamesError.backLobby') }]}
    />
  )
}
