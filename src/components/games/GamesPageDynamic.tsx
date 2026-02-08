'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import GamesLoadingFallback from './GamesLoadingFallback'
import ErrorBoundaryBlock from '@/components/ErrorBoundaryBlock'

/** 延遲加載遊戲組件，ssr: false 減少首屏 JS 50%+；GAMES_500 #11 fallback 與 loading.tsx 一致 */
const GamesPage = dynamic(
  () => import('@/components/games/GamesPageClient'),
  {
    ssr: false,
    loading: () => <GamesLoadingFallback />,
  }
)

/** 遊戲頁內層錯誤/ chunk 載入失敗時之 fallback：與 (app)/games/error.tsx 文案一致，提供重試與返回 */
function GamesPageErrorFallback({ onReset }: { onReset?: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 games-content"
      style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}
      role="alert"
      aria-labelledby="games-inner-error-title"
      aria-describedby="games-inner-error-desc"
    >
      <h1 id="games-inner-error-title" className="text-xl font-bold text-white mb-2">
        遊戲頁載入失敗
      </h1>
      <p id="games-inner-error-desc" className="text-white/60 text-sm text-center max-w-md mb-6">
        派對遊樂場暫時無法載入，請重新整理或返回遊戲大廳再試。
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="btn-primary min-h-[48px] px-6"
          aria-label="重新載入遊戲頁"
        >
          再試一次
        </button>
        <Link
          href="/games"
          className="btn-ghost min-h-[48px] inline-flex items-center justify-center px-6"
          aria-label="返回遊戲大廳"
        >
          返回遊戲大廳
        </Link>
      </div>
    </div>
  )
}

export default function GamesPageDynamic() {
  const [retryKey, setRetryKey] = useState(0)
  return (
    <ErrorBoundaryBlock
      key={retryKey}
      blockName="派對遊樂場"
      fallback={<GamesPageErrorFallback onReset={() => setRetryKey((k) => k + 1)} />}
    >
      <GamesPage />
    </ErrorBoundaryBlock>
  )
}
