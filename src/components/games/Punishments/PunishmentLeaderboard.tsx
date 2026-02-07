'use client'

import { usePunishment } from './PunishmentContext'
import type { PlayerPunishmentStats } from './types'

interface PunishmentLeaderboardProps {
  /** 最多顯示幾名 */
  maxItems?: number
  className?: string
}

/** 懲罰排行榜：顯示當晚誰被懲罰最多次 */
export default function PunishmentLeaderboard({ maxItems = 10, className = '' }: PunishmentLeaderboardProps) {
  const punishment = usePunishment()
  const leaderboard = punishment?.getLeaderboard() ?? []
  const top = leaderboard.slice(0, maxItems).filter((p) => p.count > 0)

  if (top.length === 0) {
    return (
      <div className={`text-white/50 text-sm ${className}`}>
        尚無懲罰紀錄
      </div>
    )
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-white/70 text-sm font-medium mb-2">懲罰排行榜（當晚）</p>
      <ol className="list-decimal list-inside text-white/80 text-sm space-y-0.5">
        {top.map((p: PlayerPunishmentStats, i: number) => (
          <li key={p.playerIndex}>
            {p.playerName}：{p.count} 次
          </li>
        ))}
      </ol>
    </div>
  )
}
