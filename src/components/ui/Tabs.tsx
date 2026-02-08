'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

/** P1-161：帶平滑下劃線動畫的標籤頁，用於遊戲大廳分類等 */
export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  defaultTab?: string
  onChange?: (id: string) => void
  className?: string
  /** 標籤列額外 class */
  tabListClassName?: string
}

export function Tabs({ tabs, defaultTab, onChange, className = '', tabListClassName = '' }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTab ?? tabs[0]?.id ?? '')

  const activeIndex = tabs.findIndex((t) => t.id === activeId)
  const activeTab = tabs.find((t) => t.id === activeId)

  const handleSelect = (id: string) => {
    setActiveId(id)
    onChange?.(id)
  }

  if (tabs.length === 0) return null

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="分類"
        className={`flex gap-1 border-b border-white/10 ${tabListClassName}`}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeId === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => handleSelect(tab.id)}
            className="relative px-4 py-3 text-sm font-medium text-white/70 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 rounded-t"
          >
            {tab.label}
            {activeId === tab.id && (
              <motion.span
                layoutId="tabs-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${activeId}`}
        aria-labelledby={`tab-${activeId}`}
        className="pt-4"
      >
        {activeTab?.content}
      </div>
    </div>
  )
}
