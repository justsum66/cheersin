'use client'

/**
 * PR-16：派對房「房間已結束」狀態 — 本局統計、建立新房間/返回大廳
 */
import Link from 'next/link'
import { m , AnimatePresence } from 'framer-motion'
import { Users, Sparkles, Wine } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'

export interface PartyRoomEndedProps {
  /** 房間不存在或已關閉 */
  roomNotFound: boolean
  /** 乾杯次數 */
  cheersCount: number
}

export function PartyRoomEnded({ roomNotFound, cheersCount }: PartyRoomEndedProps) {
  const { t } = useTranslation()

  return (
    <AnimatePresence mode="wait">
      <m.div
        key="room-ended"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-8"
      >
        <div className="flex items-center gap-3 text-white/60">
          <Users className="w-12 h-12" aria-hidden />
          <Sparkles className="w-8 h-8" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-white text-center">
          {roomNotFound ? t('partyRoom.roomNotFoundTitle') : t('partyRoom.roomEndedTitle')}
        </h1>
        <p className="text-white/60 text-center max-w-md">
          {roomNotFound ? t('partyRoom.roomNotFoundDesc') : t('partyRoom.roomEndedDesc')}
        </p>
        <m.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className="w-full max-w-sm rounded-xl bg-white/5 border border-white/10 p-6 space-y-4"
        >
          <p className="text-white/50 text-sm font-medium">{t('partyRoom.statsLabel')}</p>
          <div className="flex items-center justify-center gap-2 text-white/80">
            <Wine className="w-5 h-5 text-amber-400" aria-hidden />
            <span>{t('partyRoom.cheersCount')} <strong className="text-white">{cheersCount}</strong> {t('partyRoom.statsCheersUnit')}</span>
          </div>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              href="/party-room"
              className="btn-primary games-focus-ring min-h-[48px] px-6 py-3 rounded-xl"
            >
              {t('partyRoom.createNewRoom')}
            </Link>
            <Link
              href="/games"
              className="btn-ghost games-focus-ring min-h-[48px] px-6 py-3 rounded-xl"
            >
              {t('partyRoom.backToLobby')}
            </Link>
          </div>
        </m.div>
        <Link href="/" className="text-white/50 hover:text-white/80 text-sm">
          {t('partyRoom.backHome')}
        </Link>
      </m.div>
    </AnimatePresence>
  )
}
