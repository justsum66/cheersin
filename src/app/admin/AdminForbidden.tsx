'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

/** 無權限時顯示（API 回 401/403） */
export function AdminForbidden({ message = '您沒有權限存取此頁面' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-red-400" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-white">403 無權限</h2>
      <p className="text-white/70 max-w-md">{message}</p>
      <Link
        href="/"
        className="min-h-[44px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium games-focus-ring"
      >
        返回首頁
      </Link>
    </div>
  )
}
