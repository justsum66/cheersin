'use client'

import { useState, ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** P1-160：可摺疊側邊欄導航 — 管理後台與品酒學院深層頁面 */
export interface SidebarItem {
  href: string
  label: string
  icon?: ReactNode
}

interface SidebarProps {
  items: SidebarItem[]
  title?: string
  defaultCollapsed?: boolean
  className?: string
}

export function Sidebar({
  items,
  title = '導航',
  defaultCollapsed = false,
  className = '',
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <aside
      className={`flex flex-col border-r border-white/10 bg-black/20 transition-[width] duration-200 ${
        collapsed ? 'w-14' : 'w-56'
      } ${className}`}
      aria-label={title}
    >
      <div className="flex items-center justify-between p-3 border-b border-white/10 min-h-[48px]">
        {!collapsed && (
          <span className="text-sm font-semibold text-white truncate">{title}</span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors games-focus-ring"
          aria-label={collapsed ? '展開側邊欄' : '收合側邊欄'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm min-h-[44px]"
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
