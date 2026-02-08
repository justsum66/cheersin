'use client'

import { ReactNode } from 'react'

/** P1-158：時間線組件 — 以時間為軸展示活動歷史（遊戲記錄、學習歷程） */
export interface TimelineItem {
  id: string
  title: string
  description?: string
  timestamp: string
  icon?: ReactNode
  meta?: string
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <ul className={`space-y-0 ${className}`} role="list">
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
          {i < items.length - 1 && (
            <span
              className="absolute left-[11px] top-6 bottom-0 w-px bg-white/20"
              aria-hidden
            />
          )}
          <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/20 border border-primary-400/40 text-primary-300">
            {item.icon ?? <span className="h-2 w-2 rounded-full bg-primary-400" />}
          </span>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium text-white">{item.title}</p>
            {item.description && (
              <p className="text-sm text-white/70 mt-0.5">{item.description}</p>
            )}
            <p className="text-xs text-white/50 mt-1">{item.timestamp}</p>
            {item.meta && (
              <p className="text-xs text-white/40 mt-0.5">{item.meta}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
