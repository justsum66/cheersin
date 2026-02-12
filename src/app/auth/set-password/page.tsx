'use client'

/**
 * P2-347：重設密碼 — 用戶從郵件連結進入後設定新密碼
 * redirectTo 指向此頁；Supabase 以 hash 或 query 帶入 token，換 session 後顯示表單；I18N-04 文案 i18n
 */
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Wine, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from '@/contexts/I18nContext'

export default function SetPasswordPage() {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(!!session)
      if (!session) {
        router.replace('/login?error=missing_code')
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error(t('auth.passwordMinLength'))
      return
    }
    if (password !== confirm) {
      toast.error(t('auth.passwordMismatch'))
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success(t('auth.passwordUpdated'))
      router.replace('/profile')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('auth.updateFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-white/70">{t('auth.verifying')}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 safe-area-px page-container-mobile" role="main" aria-label={t('auth.setPassword')}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 p-3">
            <Wine className="w-8 h-8 text-white" />
          </Link>
        </div>
        <h1 className="text-xl font-display font-bold text-white text-center mb-2">{t('auth.setPassword')}</h1>
        <p className="text-white/60 text-sm text-center mb-6">{t('auth.newPasswordLabel')}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm text-white/70 mb-1">{t('auth.newPassword')}</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glass w-full min-h-[48px]"
              minLength={8}
              required
              aria-label={t('auth.newPassword')}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm text-white/70 mb-1">{t('auth.confirmPassword')}</label>
            <input
              id="confirm-password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-glass w-full min-h-[48px]"
              minLength={8}
              required
              aria-label={t('auth.confirmPassword')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full min-h-[48px] flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {loading ? t('auth.updating') : t('auth.submitSet')}
          </button>
        </form>
        <p className="text-center text-white/50 text-sm mt-4">
          <Link href="/profile" className="text-primary-400 hover:underline">{t('auth.backToProfile')}</Link>
        </p>
      </div>
    </main>
  )
}
