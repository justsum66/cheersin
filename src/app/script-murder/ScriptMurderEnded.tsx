'use client'

/**
 * 劇本殺結束統計：章節數、投票輪數、懲罰數；再玩一次 / 回大廳
 * SM-01：自 page 拆出
 * SM-012：分享結果 + 遊玩時間
 */
import { useCallback, useState } from 'react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { Trophy, Play, ListOrdered, Vote, Award, Share2, Clock, Star } from 'lucide-react'
import toast from 'react-hot-toast'
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
  /** SM-037: Script rating state */
  const [rating, setRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  /** SM-029: Achievement badges based on game stats */
  const achievements: { icon: string; label: string }[] = []
  if (stats.chaptersCompleted >= 5) achievements.push({ icon: '📖', label: '完讀者' })
  if (stats.voteRounds >= 3) achievements.push({ icon: '🗳️', label: '投票達人' })
  if (stats.punishmentCount >= 2) achievements.push({ icon: '🍺', label: '酒量王' })
  if (stats.chaptersCompleted > 0 && stats.punishmentCount === 0) achievements.push({ icon: '🛡️', label: '全身而退' })

  // SM-012: Share game results
  const handleShare = useCallback(() => {
    const title = scriptDetail?.title ?? '劇本殺'
    const text = `我在 Cheersin 完成了「${title}」！完成 ${stats.chaptersCompleted} 章、${stats.voteRounds} 輪投票、${stats.punishmentCount} 次懲罰！`
    const url = typeof window !== 'undefined' ? window.location.origin + '/script-murder' : 'https://cheersin.app/script-murder'

    if (navigator.share) {
      navigator.share({ title: `Cheersin 劇本殺 - ${title}`, text, url }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        toast.success('已複製分享文字')
      }).catch(() => {})
    }
  }, [scriptDetail, stats])

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto text-center">
        <m.div
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
        </m.div>
        {/** SM-029: Achievement badges */}
        {achievements.length > 0 && (
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-6">
            <h3 className="text-white/50 text-sm mb-2">成就解鎖</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {achievements.map((a, i) => (
                <m.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-sm"
                >
                  <span>{a.icon}</span>
                  <span className="text-primary-300 font-medium">{a.label}</span>
                </m.span>
              ))}
            </div>
          </m.div>
        )}
        {/** SM-037: Script rating after completion */}
        <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-6">
          {!ratingSubmitted ? (
            <div className="text-center">
              <p className="text-white/50 text-sm mb-2">為這個劇本評分</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setRating(s); setRatingSubmitted(true); toast.success(`已評分 ${s} 星`) }}
                    className="p-1 games-focus-ring"
                    aria-label={`${s} 星`}
                  >
                    <Star className={`w-7 h-7 transition-colors ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-yellow-400/80 text-sm">感謝評分！{rating} / 5 ⭐</p>
          )}
        </m.div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* SM-012: Share results button */}
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium games-focus-ring inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Share2 className="w-5 h-5" /> {t('common.share') || '分享結果'}
            </button>
          </m.div>
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link
              href={`/script-murder?room=${encodeURIComponent(roomSlug)}`}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Play className="w-5 h-5" /> {t('scriptMurder.playAgain')}
            </Link>
          </m.div>
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Link
              href="/script-murder"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white games-focus-ring inline-flex items-center justify-center w-full sm:w-auto"
            >
              {t('scriptMurder.backLobby')}
            </Link>
          </m.div>
        </div>
      </div>
    </div>
  )
}
