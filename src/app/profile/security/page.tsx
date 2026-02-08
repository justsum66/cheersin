'use client'

/**
 * P2-349：Session 管理 — 顯示目前登入狀態，可登出
 * 進階「遠端登出其他裝置」需 Supabase Auth Admin API，此頁提供目前裝置登出與說明
 */
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Shield, LogOut, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfileSecurityPage() {
  const [session, setSession] = useState<{ email?: string; createdAt?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) {
        router.replace('/login?next=/profile/security')
        return
      }
      setSession({
        email: s.user?.email ?? undefined,
        createdAt: s.user?.created_at,
      })
      setLoading(false)
    })
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('已登出')
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="p-4 text-white/70">載入中…</div>
    )
  }

  return (
    <main className="max-w-2xl mx-auto p-4 safe-area-px page-container-mobile" role="main" aria-label="帳戶安全">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/profile"
          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 min-h-[48px] min-w-[48px] flex items-center justify-center"
          aria-label="返回個人頁"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-400" />
          帳戶安全
        </h1>
      </div>

      <section className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4" aria-labelledby="current-session-heading">
        <h2 id="current-session-heading" className="text-sm font-semibold text-white/90 mb-2">目前登入</h2>
        {session?.email && (
          <p className="text-white/80 text-sm">信箱：{session.email}</p>
        )}
        <p className="text-white/50 text-xs mt-1">登出後需重新登入。遠端登出其他裝置需透過 Supabase Dashboard 或 Admin API。</p>
      </section>

      <button
        type="button"
        onClick={handleSignOut}
        className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        登出此裝置
      </button>
    </main>
  )
}
