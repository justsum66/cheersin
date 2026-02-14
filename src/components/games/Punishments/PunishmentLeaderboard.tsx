'use client'

import { m } from 'framer-motion'
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
      {/* R2-104：排行榜名次入場動畫，名次變化時有視覺回饋 */}
      <ol className="list-decimal list-inside text-white/80 text-sm space-y-0.5">
        {top.map((p: PlayerPunishmentStats, i: number) => (
          <m.li
            key={`${p.playerIndex}-${p.count}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.2 }}
          >
            {p.playerName}：{p.count} 次
          </m.li>
        ))}
      </ol>
    </div>
  )
}
