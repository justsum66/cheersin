'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'

/**
 * P3-442：博客/內容營銷板塊 — 佔位頁，後續可接 CMS 或 MDX
 */
export default function BlogPage() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 px-4">
      <BookOpen className="w-12 h-12 text-primary-400" aria-hidden />
      <h1 className="text-2xl font-bold text-white text-center">Cheersin 部落格</h1>
      <p className="text-white/70 text-center max-w-md">
        酒、派對、遊戲相關文章，即將上線。
      </p>
      <Link href="/" className="text-white/50 hover:text-white/80 text-sm">
        返回首頁
      </Link>
    </div>
  )
}
