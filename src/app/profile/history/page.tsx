'use client'

import Link from 'next/link'
import { History, ArrowLeft } from 'lucide-react'
import { Timeline } from '@/components/ui/Timeline'
import type { TimelineItem } from '@/components/ui/Timeline'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTranslation } from '@/contexts/I18nContext'

/** P1-213 / UX-011：遊戲歷史記錄頁 — 記錄玩過的每局時間、參與者與結果；空狀態有說明與行動引導 */
export default function ProfileHistoryPage() {
  const { t } = useTranslation()
  const items: TimelineItem[] = []

  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回個人頁
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <History className="w-8 h-8 text-primary-400" aria-hidden />
        <h1 className="text-2xl font-display font-bold text-white">遊戲歷史</h1>
      </div>
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-8" role="status" aria-live="polite">
          <EmptyState
            title={t('profile.historyEmpty')}
            description={t('profile.historyEmptyDesc')}
            action={
              <Link
                href="/games"
                className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium"
              >
                {t('profile.historyEmptyAction')}
              </Link>
            }
          />
        </div>
      ) : (
        <Timeline items={items} />
      )}
    </main>
  )
}
