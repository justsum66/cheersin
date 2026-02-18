'use client'

import { memo, useMemo } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { Trophy, Medal, Award } from 'lucide-react'

interface Player {
  name: string
  score: number
  avatar?: string
}

interface GameScoreBoardProps {
  players: Player[]
  /** Title for the scoreboard */
  title?: string
  /** Show rank badges (trophy, medal, etc.) */
  showRank?: boolean
  /** Maximum score for percentage bar calculation (auto-detected if not set) */
  maxScore?: number
  /** Highlight leading player */
  highlightLeader?: boolean
  className?: string
}

const RANK_ICONS = [
  { icon: Trophy, color: 'text-yellow-400' },
  { icon: Medal, color: 'text-gray-300' },
  { icon: Award, color: 'text-amber-600' },
]

/** GAME-052: Reusable game scoreboard with animated bars and rank badges */
export const GameScoreBoard = memo(function GameScoreBoard({
  players,
  title = '排行榜',
  showRank = true,
  maxScore: maxScoreProp,
  highlightLeader = true,
  className = '',
}: GameScoreBoardProps) {
  const reducedMotion = useReducedMotion()

  const sorted = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players]
  )

  const maxScore = maxScoreProp ?? Math.max(1, ...sorted.map(p => p.score))

  if (sorted.length === 0) {
    return (
      <div className={`text-center text-white/40 text-sm py-4 ${className}`}>
        尚無玩家分數
      </div>
    )
  }

  return (
    <div className={`rounded-2xl bg-white/5 border border-white/10 p-4 ${className}`}>
      <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-primary-400" />
        {title}
      </h3>
      <div className="space-y-2">
        {sorted.map((player, idx) => {
          const pct = maxScore > 0 ? (player.score / maxScore) * 100 : 0
          const isLeader = highlightLeader && idx === 0 && player.score > 0
          const RankIcon = showRank && idx < 3 ? RANK_ICONS[idx] : null

          return (
            <div
              key={player.name}
              className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${isLeader ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-white/5'}`}
            >
              {/* Rank */}
              {showRank && (
                <span className="w-6 text-center shrink-0">
                  {RankIcon ? (
                    <RankIcon.icon className={`w-4 h-4 mx-auto ${RankIcon.color}`} />
                  ) : (
                    <span className="text-xs text-white/40">{idx + 1}</span>
                  )}
                </span>
              )}

              {/* Avatar / Initial */}
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70 shrink-0">
                {player.avatar ?? player.name.charAt(0).toUpperCase()}
              </span>

              {/* Name + Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium truncate ${isLeader ? 'text-primary-300' : 'text-white/80'}`}>
                    {player.name}
                  </span>
                  <span className="text-xs font-mono text-white/50 ml-2 tabular-nums">
                    {player.score}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <m.div
                    className={`h-full rounded-full ${isLeader ? 'bg-gradient-to-r from-primary-500 to-primary-300' : 'bg-white/30'}`}
                    initial={reducedMotion ? { width: `${pct}%` } : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
