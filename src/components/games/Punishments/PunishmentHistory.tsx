'use client'

import { m , AnimatePresence } from 'framer-motion'
import { usePunishment } from './PunishmentContext'
import type { PunishmentHistoryEntry } from './types'
import { PUNISHMENT_LEVEL_LABEL } from './types'
import { useGameReduceMotion } from '../GameWrapper'

interface PunishmentHistoryProps {
  /** 最多顯示幾筆 */
  maxItems?: number
  className?: string
}

/** 懲罰歷史回顧：遊戲結束時顯示精彩懲罰時刻 */
export default function PunishmentHistory({ maxItems = 20, className = '' }: PunishmentHistoryProps) {
  const punishment = usePunishment()
  const reducedMotion = useGameReduceMotion()
  const history = punishment?.getHistory() ?? []
  const recent = history.slice(0, maxItems)

  if (recent.length === 0) {
    return (
      <div className={`text-white/50 text-sm ${className}`}>
        尚無懲罰紀錄
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-white/70 text-sm font-medium mb-2">懲罰歷史回顧</p>
      {/* Phase 1 C4.4: 懲罰記錄逐一淡入 + 左侧滑入動畫 */}
      <ul className="space-y-1.5 text-sm max-h-48 overflow-auto">
        <AnimatePresence mode="popLayout">
        {recent.map((h: PunishmentHistoryEntry, i: number) => (
          <m.li 
            key={h.id} 
            className="text-white/70 flex flex-wrap gap-x-2 gap-y-0.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            initial={reducedMotion ? false : { x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reducedMotion ? undefined : { x: 10, opacity: 0, height: 0 }}
            transition={{ 
              delay: reducedMotion ? 0 : Math.min(i * 0.04, 0.3),
              duration: reducedMotion ? 0 : 0.25,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            layout={!reducedMotion}
          >
            {h.skipped ? (
              <span className="text-white/50">{h.playerName} 使用豁免券跳過</span>
            ) : h.isGroup ? (
              <span className="text-blue-300/90">全場：{h.punishment.text}</span>
            ) : (
              <>
                <span className="text-primary-300 font-medium">{h.playerName}</span>
                <span className="text-white/50">—</span>
                <span>{h.punishment.text}</span>
                <span className="text-white/40 text-xs">({PUNISHMENT_LEVEL_LABEL[h.punishment.level]})</span>
              </>
            )}
          </m.li>
        ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
