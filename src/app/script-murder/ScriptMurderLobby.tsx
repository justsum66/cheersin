'use client'

/**
 * 劇本殺大廳：劇本列表、建立房間、現有房間列表（無 room 參數時顯示）
 * SM-01：自 page 拆出
 */
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, AlertCircle, Lock, ChevronLeft } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { InViewAnimate } from '@/components/ui/InViewAnimate'
import { SkeletonCard } from '@/components/ui/Skeleton'
import type { ScriptSummary } from '@/types/script-murder'

export interface ScriptMurderLobbyProps {
  scripts: ScriptSummary[]
  scriptRooms: Array<{ slug: string; scriptTitle: string | null; playerCount: number; maxPlayers: number }>
  loadingScripts: boolean
  error: string | null
  createRoom: (scriptId: string) => void
  creating: boolean
  freeScriptLimit: number
  onRetry?: () => void
}

export function ScriptMurderLobby({
  scripts,
  scriptRooms,
  loadingScripts,
  error,
  createRoom,
  creating,
  freeScriptLimit,
  onRetry,
}: ScriptMurderLobbyProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6">
          <ChevronLeft className="w-4 h-4" /> {t('scriptMurder.backToHome')}
        </Link>
        <div className="flex items-center gap-3 text-primary-400 mb-6">
          <BookOpen className="w-10 h-10" aria-hidden />
          <h1 className="text-2xl font-bold text-white">{t('scriptMurder.title')}</h1>
        </div>
        <p className="text-white/70 mb-8">{t('scriptMurder.description')}</p>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4"
            role="alert"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="sm:ml-auto min-h-[44px] px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium games-focus-ring"
              >
                {t('gamesError.retry')}
              </button>
            )}
          </motion.div>
        )}
        {loadingScripts ? (
          <div className="grid gap-4 sm:grid-cols-2" role="status" aria-label={t('scriptMurder.loadingScriptsAria')}>
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} className="min-h-[120px]" />
            ))}
          </div>
        ) : scripts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center p-6 rounded-xl bg-white/5 border border-white/10"
            role="status"
          >
            <BookOpen className="w-14 h-14 text-white/20 mx-auto mb-4" aria-hidden />
            <p className="text-white/50 mb-4">{t('scriptMurder.noScripts')}</p>
            <Link href="/games" className="text-primary-400 hover:text-primary-300 text-sm">
              {t('scriptMurder.goToPartyGames')}
            </Link>
          </motion.div>
        ) : (
          <InViewAnimate y={30} amount={0.15}>
            <ul className="grid gap-4 sm:grid-cols-2" role="list">
              {scripts.map((s, idx) => {
                const isLocked = idx >= freeScriptLimit
                return (
                  <li key={s.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.3 }}
                      whileHover={!isLocked ? { scale: 1.02 } : undefined}
                      className={`relative p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[120px] ${isLocked ? 'bg-white/[0.02] border-white/5 opacity-80' : 'bg-white/5 border-white/10'}`}
                    >
                      {isLocked && (
                        <div
                          className="absolute inset-0 rounded-xl bg-dark-900/60 flex items-center justify-center z-10"
                          aria-hidden
                        >
                          <Lock className="w-8 h-8 text-white/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-white truncate">{s.title}</h2>
                        <p className="text-white/50 text-sm mt-1">
                          {t('scriptMurder.playersAndDuration')
                            .replace('{{min}}', String(s.minPlayers))
                            .replace('{{max}}', String(s.maxPlayers))
                            .replace('{{minDur}}', String(s.durationMin ?? 0))}
                        </p>
                        {s.is18Plus && (
                          <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-300">
                            18+
                          </span>
                        )}
                      </div>
                      {isLocked ? (
                        <Link
                          href="/pricing"
                          className="min-h-[48px] px-4 py-2 rounded-xl bg-primary-500/80 hover:bg-primary-500 text-white font-medium games-focus-ring shrink-0 inline-flex items-center justify-center gap-2"
                          aria-label={t('scriptMurder.upgradeUnlockAria')}
                        >
                          <Lock className="w-4 h-4" aria-hidden />
                          {t('scriptMurder.upgradeUnlock')}
                        </Link>
                      ) : (
                        <motion.button
                          type="button"
                          disabled={creating}
                          onClick={() => createRoom(s.id)}
                          whileTap={{ scale: 0.97 }}
                          className="min-h-[48px] px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium disabled:opacity-50 games-focus-ring shrink-0"
                          aria-label={t('scriptMurder.createRoomAria').replace('{{title}}', s.title)}
                        >
                          {creating ? t('scriptMurder.creating') : t('scriptMurder.createRoom')}
                        </motion.button>
                      )}
                    </motion.div>
                  </li>
                )
              })}
            </ul>
          </InViewAnimate>
        )}
        {scriptRooms.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-3">{t('scriptMurder.existingRooms')}</h2>
            <ul className="space-y-2">
              {scriptRooms.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/script-murder?room=${encodeURIComponent(r.slug)}`}
                    className="block p-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <span className="font-medium">{r.scriptTitle ?? t('scriptMurder.roomFallbackTitle')}</span>
                    <span className="text-white/50 text-sm ml-2">
                      {t('scriptMurder.playersCount')
                        .replace('{{current}}', String(r.playerCount))
                        .replace('{{max}}', String(r.maxPlayers))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-8 flex gap-4">
          <Link href="/games" className="text-white/60 hover:text-white text-sm">
            {t('scriptMurder.partyGamesLink')}
          </Link>
          <Link href="/learn" className="text-white/60 hover:text-white text-sm">
            {t('scriptMurder.academyLink')}
          </Link>
        </div>
      </div>
    </div>
  )
}
