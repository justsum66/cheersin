'use client'

/**
 * PR-16：派對房「無房間」狀態 — 建立房間中的 loading 畫面
 */
import { m } from 'framer-motion'
import { useTranslation } from '@/contexts/I18nContext'
import { SkeletonCard } from '@/components/ui/Skeleton'

export interface PartyRoomLobbyProps {
  /** 是否正在建立房間 */
  creating: boolean
}

export function PartyRoomLobby({ creating }: PartyRoomLobbyProps) {
  const { t } = useTranslation()
  if (!creating) return null

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4"
      role="status"
      aria-label={t('common.loading')}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" aria-hidden />
        <p className="text-white/70">{t('common.loading')}</p>
        <p className="text-white/50 text-xs">{t('partyRoom.creatingRoom') ?? '正在建立派對房…'}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </m.div>
  )
}
