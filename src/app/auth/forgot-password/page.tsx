'use client'

/**
 * P2-347：忘記密碼 — 輸入信箱後發送重設連結，用戶從郵件點連結後至 set-password 設新密碼
 * R2-017：Turnstile 真人驗證，防機器人濫發重設信
 */
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Wine, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      toast.error('請輸入電子郵件')
      return
    }
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error('請完成真人驗證')
      return
    }
    if (turnstileToken) {
      try {
        const verifyRes = await fetch('/api/auth/verify-turnstile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: turnstileToken }),
        })
        const verifyData = (await verifyRes.json()) as { success?: boolean }
        if (!verifyData.success) {
          setTurnstileToken(null)
          setTurnstileResetKey((k) => k + 1)
          toast.error('驗證失敗，請重新完成驗證')
          return
        }
      } catch {
        toast.error('驗證服務暫時無法使用')
        return
      }
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/set-password`
          : undefined
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      })
      if (error) throw error
      setSent(true)
      toast.success('已寄出重設密碼信，請檢查信箱')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '寄送失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 safe-area-px page-container-mobile" role="main" aria-label="忘記密碼">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 p-3">
            <Wine className="w-8 h-8 text-white" />
          </Link>
        </div>
        <h1 className="text-xl font-display font-bold text-white text-center mb-2">忘記密碼</h1>
        <p className="text-white/60 text-sm text-center mb-6">輸入註冊信箱，我們將寄送重設密碼連結（約 1 小時內有效）</p>
        {sent ? (
          <p className="text-center text-primary-300">請至信箱點擊連結，並在開啟的頁面設定新密碼。</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-sm text-white/70 mb-1">電子郵件</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass w-full min-h-[48px]"
                required
                placeholder="you@example.com"
                aria-label="電子郵件"
              />
            </div>
            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              resetKey={turnstileResetKey}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full min-h-[48px] flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {loading ? '寄送中…' : '寄送重設連結'}
            </button>
          </form>
        )}
        <p className="text-center text-white/50 text-sm mt-6">
          <Link href="/login" className="text-primary-400 hover:underline">返回登入</Link>
        </p>
      </div>
    </main>
  )
}
