'use client'

import { m } from 'framer-motion'
import { Star } from 'lucide-react'

/** R2-081：投票揭曉柱狀圖 — 可重用，stagger 入場、尊重 reducedMotion */
export function VoteBarChart({
  items,
  maxBarWidth = '100%',
  reducedMotion = false,
  highlightFirst = true,
  barClassName = 'bg-gradient-to-r from-pink-500 to-rose-500',
}: {
  items: { label: string; count: number; subtitle?: string }[]
  maxBarWidth?: string
  reducedMotion?: boolean
  highlightFirst?: boolean
  barClassName?: string
}) {
  const maxCount = Math.max(...items.map((i) => i.count), 1)

  return (
    <div className="space-y-3 w-full" role="list" aria-label="投票結果">
      {items.map((item, index) => (
        <m.div
          key={item.label}
          className="flex flex-col gap-1"
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="listitem"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className={`truncate font-bold shrink-0 ${
                  highlightFirst && index === 0 ? 'text-yellow-400' : 'text-white'
                }`}
              >
                {item.label}
              </span>
              {highlightFirst && index === 0 && (
                <Star className="w-4 h-4 shrink-0 text-yellow-400" aria-hidden />
              )}
            </div>
            <div
              className="flex-1 flex items-center gap-2 min-w-0"
              style={{ maxWidth: maxBarWidth }}
            >
              <div className="flex-1 h-6 rounded-full bg-white/10 overflow-hidden min-w-[40px]">
                <m.div
                  className={`h-full rounded-full ${barClassName}`}
                  initial={reducedMotion ? { width: `${(item.count / maxCount) * 100}%` } : { width: 0 }}
                  animate={{ width: `${(item.count / maxCount) * 100}%` }}
                  transition={{ delay: index * 0.08 + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="text-sm font-bold tabular-nums shrink-0 w-10 text-right">
                {item.count} 票
              </span>
            </div>
          </div>
          {item.subtitle && (
            <p className="text-white/80 text-sm pl-0 truncate" title={item.subtitle}>
              &quot;{item.subtitle}&quot;
            </p>
          )}
        </m.div>
      ))}
    </div>
  )
}
