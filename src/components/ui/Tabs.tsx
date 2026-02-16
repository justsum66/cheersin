'use client'

import { useState } from 'react'
import { m } from 'framer-motion'

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
            className={`relative px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 rounded-full z-10 ${activeId === tab.id ? 'text-white' : 'text-white/60 hover:text-white/90'}`}
          >
            {activeId === tab.id && (
              <m.span
                layoutId="active-tab-pill"
                className="absolute inset-0 bg-white/10 rounded-full -z-10 backdrop-blur-sm border border-white/5"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>
      {/* R2-061：切換 Tab 時內容淡入 */}
      <m.div
        role="tabpanel"
        id={`panel-${activeId}`}
        aria-labelledby={`tab-${activeId}`}
        className="pt-4"
        key={activeId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab?.content}
      </m.div>
    </div>
  )
}
