'use client'

/**
 * 劇本殺結束統計：章節數、投票輪數、懲罰數；再玩一次 / 回大廳
 * SM-01：自 page 拆出
 */
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Play, ListOrdered, Vote, Award } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import type { ScriptState, ScriptDetail } from '@/types/script-murder'

export interface ScriptMurderEndedProps {
  scriptState: ScriptState
  scriptDetail: ScriptDetail | null
  roomSlug: string
}

export function ScriptMurderEnded({ scriptState, scriptDetail, roomSlug }: ScriptMurderEndedProps) {
  const { t } = useTranslation()
  const stats = scriptState.stats ?? { chaptersCompleted: 0, voteRounds: 0, punishmentCount: 0 }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Trophy className="w-16 h-16 text-primary-400 mx-auto mb-4" aria-hidden />
          <h1 className="text-2xl font-bold text-white mb-2">{t('scriptMurder.gameEndTitle')}</h1>
          <p className="text-white/60 mb-6">{scriptDetail?.title}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3" role="img" aria-label={`${t('scriptMurder.chaptersCompleted')} ${stats.chaptersCompleted}`}>
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center" aria-hidden>
                <ListOrdered className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">{t('scriptMurder.chaptersCompleted')}</p>
                <p className="text-white font-semibold tabular-nums">{stats.chaptersCompleted}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3" role="img" aria-label={`${t('scriptMurder.voteRounds')} ${stats.voteRounds}`}>
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center" aria-hidden>
                <Vote className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">{t('scriptMurder.voteRounds')}</p>
                <p className="text-white font-semibold tabular-nums">{stats.voteRounds}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3" role="img" aria-label={`${t('scriptMurder.punishmentCount')} ${stats.punishmentCount}`}>
              <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center" aria-hidden>
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white/50 text-xs">{t('scriptMurder.punishmentCount')}</p>
                <p className="text-white font-semibold tabular-nums">{stats.punishmentCount}</p>
              </div>
            </div>
          </div>
        </motion.div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link
              href={`/script-murder?room=${encodeURIComponent(roomSlug)}`}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Play className="w-5 h-5" /> {t('scriptMurder.playAgain')}
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Link
              href="/script-murder"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white games-focus-ring inline-flex items-center justify-center w-full sm:w-auto"
            >
              {t('scriptMurder.backLobby')}
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
