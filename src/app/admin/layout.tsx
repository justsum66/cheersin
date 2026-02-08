'use client'

/**
 * P1-073：管理後台統一佈局 — 側邊導航、標題、子頁面插槽。
 * 輕量實現，無引入外部後台 UI 框架。
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, BarChart3, Users, ChevronLeft } from 'lucide-react'

const NAV = [
  { href: '/admin/users', label: '用戶與訂閱', icon: Users },
  { href: '/admin/knowledge', label: '知識庫', icon: BookOpen },
  { href: '/admin/usage', label: 'API 使用', icon: BarChart3 },
] as const

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-black/20">
        <div className="p-4 flex items-center gap-2 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center gap-1 text-white/60 hover:text-white text-sm"
            aria-label="返回首頁"
          >
            <ChevronLeft className="w-4 h-4" /> 返回
          </Link>
        </div>
        <nav className="p-2" aria-label="管理後台導航">
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm min-h-[44px] transition-colors ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-300 font-medium'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}
