'use client'

import dynamic from 'next/dynamic'
import GamesLoadingFallback from './GamesLoadingFallback'

/** 延遲加載遊戲組件，ssr: false 減少首屏 JS 50%+；GAMES_500 #11 fallback 與 loading.tsx 一致 */
const GamesPage = dynamic(
  () => import('@/components/games/GamesPageClient'),
  {
    ssr: false,
    loading: () => <GamesLoadingFallback />,
  }
)

export default function GamesPageDynamic() {
  return <GamesPage />
}
