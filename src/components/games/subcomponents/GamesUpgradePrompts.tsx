'use client'

import { m } from 'framer-motion'
import Link from 'next/link'
import { Crown, X } from 'lucide-react'

import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { getActiveLaunchAnnouncements } from '@/config/announcements.config'
import { getGameMeta } from '@/config/games.config'

interface GamesUpgradePromptsProps {
  roomSlug: string | null
  joinedDisplayName: string | null
  tier: string
  freeGamesPlayedCount: number
  upgradePromptDismissed: boolean
  setUpgradePromptDismissed: (dismissed: boolean) => void
  lastSession: { gameId: string; timestamp: number } | null
  setLastSession: (session: { gameId: string; timestamp: number } | null) => void
  showRestoreBanner: boolean
  setShowRestoreBanner: (show: boolean) => void
  clearLastSession: () => void
  startGame: (gameId: string) => void
}

export function GamesUpgradePrompts({
  roomSlug,
  joinedDisplayName,
  tier,
  freeGamesPlayedCount,
  upgradePromptDismissed,
  setUpgradePromptDismissed,
  lastSession,
  setLastSession,
  showRestoreBanner,
  setShowRestoreBanner,
  clearLastSession,
  startGame
}: GamesUpgradePromptsProps) {
  const showPrompts = !roomSlug || joinedDisplayName

  return (
    <>
      {/* E90 P2：新遊戲上線預告橫幅 — announcements.config 有 type=game 時顯示 */}
      {showPrompts && getActiveLaunchAnnouncements().filter((a) => a.type === 'game').map((a) => {
        const id = a.id
        const meta = typeof id === 'string' ? getGameMeta(id) : null
        return meta ? (
          <GlassCard key={a.id} className="mb-4 p-4 border-accent-500/20 bg-accent-500/10" role="region" aria-label="新作上線">
            <p className="text-accent-300 text-sm font-medium">{a.label}：{meta.name}</p>
            <p className="text-white/60 text-xs mt-1">快去試玩</p>
          </GlassCard>
        ) : null
      })}

      {/* 任務 23：存檔恢復橫幅 — 意外關閉後可恢復上次遊戲 */}
      {showPrompts && lastSession && showRestoreBanner && getGameMeta(lastSession.gameId) && (
        <GlassCard className="mb-4 p-4 border-primary-500/30 bg-primary-500/15 flex flex-wrap items-center justify-between gap-3" role="region" aria-label="恢復上次遊戲">
          <p className="text-white/90 text-sm">
            是否恢復上次的遊戲？<span className="font-medium text-primary-300">{getGameMeta(lastSession.gameId)?.name}</span>
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => { clearLastSession(); setLastSession(null); setShowRestoreBanner(false); }}
              variant="ghost"
              size="sm"
              className="bg-white/10 hover:bg-white/15"
            >
              不用
            </Button>
            <Button
              type="button"
              onClick={() => { startGame(lastSession.gameId) }}
              size="sm"
            >
              恢復
            </Button>
          </div>
        </GlassCard>
      )}

      {/* P1-258 + Task 12：免費用戶「>4人？升級 Pro」upsell banner */}
      {showPrompts && tier === 'free' && (
        <GlassCard gradient="glow" className="mb-4 p-4 border-primary-500/30 flex flex-wrap items-center justify-between gap-3" role="region" aria-label="升級 Pro 解鎖更多">
          <div>
            <p className="text-white/90 text-sm font-medium">超過 4 人？升級 Pro 暢玩 12 人大房</p>
            <p className="text-white/50 text-xs mt-0.5">解鎖辣味題庫 · 18+ 專屬 · 全部 50+ 遊戲</p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 min-h-[48px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity games-focus-ring shadow-hero-glow"
            aria-label="升級 Pro 解鎖 12 人大房間和全部遊戲"
          >
            <Crown className="w-4 h-4" aria-hidden />
            升級 Pro
          </Link>
        </GlassCard>
      )}
      {/* R2-181：玩了 3 局後提示升級解鎖 18+ 與更多遊戲；可關閉 */}
      {showPrompts && tier === 'free' && freeGamesPlayedCount >= 3 && !upgradePromptDismissed && (
        <GlassCard className="mb-4 p-4 border-primary-500/30 bg-primary-500/15 flex flex-wrap items-center justify-between gap-3" role="region" aria-label="升級 Pro 解鎖更多">
          <p className="text-white/90 text-sm">
            升級到 Pro 解鎖 18+ 模式和 50+ 遊戲
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center min-h-[48px] px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium games-focus-ring shadow-lg shadow-primary-500/20"
            >
              升級
            </Link>
            <Button
              type="button"
              onClick={() => setUpgradePromptDismissed(true)}
              className="bg-white/10 hover:bg-white/15 px-3 rounded-xl"
              size="sm"
              aria-label="關閉"
            >
              <X className="w-4 h-4" aria-hidden />
            </Button>
          </div>
        </GlassCard>
      )}
    </>
  )
}