'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Wine, Mail, Lock, Send, Eye, EyeOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getSafeNextPath } from '@/lib/redirect-safe'
import { scrollToFirstError } from '@/lib/scroll-to-first-error'
import toast from 'react-hot-toast'
import { useTranslation } from '@/contexts/I18nContext'
import { ERROR_FORM_HEADING } from '@/config/errors.config'
import { COPY_TOAST_LOGIN_REDIRECT } from '@/config/copy.config'
import { TurnstileWidget } from '@/components/auth/TurnstileWidget'

const ERROR_CODE_KEYS: Record<string, string> = {
  missing_code: 'login.missingCode',
  config: 'login.configError',
}

export default function LoginPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [magicEmail, setMagicEmail] = useState('')
  const [emailFocus, setEmailFocus] = useState(false)
  const [passwordFocus, setPasswordFocus] = useState(false)
  const [emailValue, setEmailValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error')
  const errorMessage = errorCode
    ? (ERROR_CODE_KEYS[errorCode] ? t(ERROR_CODE_KEYS[errorCode]) : (() => {
        try { return decodeURIComponent(errorCode) } catch { return errorCode }
      })())
    : null
  /** 201–205：Supabase 未設定時為 null，登入改為模擬 */
  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  }, [])

  /** Supabase 登入後導向：auth/callback 以 code 換 session，再導向 /profile */
  const authCallbackUrl = useMemo(
    () => (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined),
    []
  )

  /** E31：UTM 儲存 — 登入/註冊流程讀取 query，寫入 localStorage 供 analytics 與來源區分 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const source = params.get('utm_source')
    const medium = params.get('utm_medium')
    const campaign = params.get('utm_campaign')
    if (source || medium || campaign) {
      try {
        localStorage.setItem(
          'cheersin_utm',
          JSON.stringify({
            utm_source: source ?? undefined,
            utm_medium: medium ?? undefined,
            utm_campaign: campaign ?? undefined,
            ts: Date.now(),
          })
        )
      } catch {
        /* ignore */
      }
    }
  }, [])

  /** E08 / P2-358：成功後 redirect 至來源頁；?next= 僅允許站內白名單路徑，防 Open Redirect */
  const nextPath = useMemo(() => {
    const n = searchParams.get('next')
    return getSafeNextPath(n)
  }, [searchParams])

  /** E08：登入後將回到的頁面標籤（友善顯示用）；i18n 使用 nav / subscription.manage */
  const nextPathLabel: Record<string, string> = {
    '/profile': t('nav.profile'),
    '/quiz': t('nav.quiz'),
    '/assistant': t('nav.assistant'),
    '/games': t('nav.games'),
    '/learn': t('nav.learn'),
    '/pricing': t('nav.pricing'),
    '/subscription': t('subscription.manage'),
  }
  const nextLabel = nextPathLabel[nextPath.split('?')[0]] ?? t('nav.profile')

  /** UX_LAYOUT_200 #89：電子郵件格式驗證（簡單 regex） */
  const emailFormatValid = useMemo(() => {
    if (!emailValue.trim()) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())
  }, [emailValue])
  const showEmailFormatError = emailTouched && emailValue.trim() !== '' && !emailFormatValid

  /** P2-348：送出前檢查登入嘗試限制；失敗時記錄並可選顯示解鎖時間 */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!emailFormatValid) {
      setEmailTouched(true)
      scrollToFirstError(formRef.current ?? e.currentTarget)
      return
    }
    setLoginError(null)
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value ?? ''
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setLoginError(t('login.captchaRequired'))
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
          setLoginError(t('login.captchaFailed'))
          return
        }
      } catch {
        setLoginError(t('login.captchaUnavailable'))
        return
      }
    }
    if (supabase) {
      try {
        const limitRes = await fetch(`/api/auth/login-limit?email=${encodeURIComponent(email)}`)
        const limit = (await limitRes.json()) as { allowed?: boolean; resetAt?: number | null }
        if (limit.allowed === false && limit.resetAt) {
          const minutes = Math.ceil((limit.resetAt - Date.now()) / 60000)
          setLoginError((t('login.rateLimitMinutes') ?? '').replace('{{minutes}}', String(minutes)))
          return
        }
      } catch {
        /* 忽略限流 API 失敗，仍允許嘗試登入 */
      }
      setLoading(true)
      supabase.auth.signInWithPassword({ email, password: (form.elements.namedItem('password') as HTMLInputElement)?.value ?? '' }).then(async ({ error }) => {
        if (error) {
          /** P2-348：帳密錯誤時記錄失敗次數 */
          if (error.message === 'Invalid login credentials') {
            try {
              await fetch('/api/auth/login-failure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
            } catch {
              /* ignore */
            }
          }
          setLoading(false)
          /** E08：錯誤訊息友善化 — 帳密錯誤不分開（避免 email 枚舉），引導使用魔法連結 */
          const msg = error.message === 'Invalid login credentials'
            ? (t('login.invalidCredentials') ?? '')
            : error.message
          setLoginError(msg)
          setTimeout(() => scrollToFirstError(formRef.current), 50)
          return
        }
        setLoading(false)
        /** 任務 60：登入成功後 Toast 再導向，避免白屏感 */
        toast.success(COPY_TOAST_LOGIN_REDIRECT, { duration: 2000 })
        setTimeout(() => router.push(nextPath), 400)
      }).catch((err) => {
        setLoading(false)
        setLoginError(err instanceof Error ? err.message : (t('login.errorGeneric') ?? ''))
      })
    } else {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        router.push(nextPath)
      }, 1500)
    }
  }

  /** E08：魔法連結登入後導向 nextPath（與表單登入一致） */
  const handleMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!magicEmail.trim()) return
    setLoading(true)
    if (supabase) {
      const nextQuery = nextPath !== '/profile' ? `?next=${encodeURIComponent(nextPath.replace(/^\//, ''))}` : ''
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail.trim(),
        options: { emailRedirectTo: authCallbackUrl ? `${authCallbackUrl}${nextQuery}` : undefined },
      })
      setLoading(false)
      if (!error) setMagicSent(true)
    } else {
      setTimeout(() => {
        setLoading(false)
        setMagicSent(true)
      }, 1000)
    }
  }, [magicEmail, supabase, authCallbackUrl, nextPath])

  /** 201–205：OAuth 導向 /auth/callback，帶 next 參數以便登入後導向來源頁 */
  const handleOAuth = useCallback(async (provider: 'google' | 'apple') => {
    if (!supabase) {
      setLoading(true)
      setTimeout(() => { setLoading(false); router.push(nextPath) }, 1500)
      return
    }
    setLoading(true)
    const redirectTo = authCallbackUrl ? `${authCallbackUrl}?next=${encodeURIComponent(nextPath.replace(/^\//, ''))}` : undefined
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
    setLoading(false)
  }, [supabase, nextPath, authCallbackUrl, router])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden safe-area-px page-container-mobile" role="main" aria-label={t('login.mainAria')}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-bg" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm focus-within:ring-2 focus-within:ring-primary-400/30 focus-within:ring-offset-2 focus-within:ring-offset-[#0a0a1a] transition-shadow duration-200">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto shadow-glow">
                <Wine className="w-8 h-8 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-display font-bold text-white mb-2">{t('login.welcomeBack')}</h1>
            <p className="text-white/50">{t('login.continueJourney')}</p>
            {nextPath !== '/profile' && (
              <p className="text-primary-400/90 text-sm mt-1" role="status">{t('login.redirectTo')}：{nextLabel}</p>
            )}
            {/* UX_LAYOUT_200 #160 / 任務 39：頂部僅顯示通用錯誤，欄位錯誤僅 inline 不重複 */}
            {(errorMessage || loginError || showEmailFormatError) && (
              <div id="login-error-message" className="mt-3 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-3" role="alert">
                <p>{ERROR_FORM_HEADING}</p>
                {(loginError ?? errorMessage) && <p className="mt-1">{loginError ?? errorMessage}</p>}
              </div>
            )}
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" name="login-email">
            {/* UX_LAYOUT_200 #87 #89：placeholder 格式提示、email 格式驗證 */}
            <div className="form-field-gap form-group-ux">
              <div className={`relative rounded-xl border transition-colors focus-within:ring-2 focus-within:ring-primary-400/30 focus-within:ring-offset-2 focus-within:ring-offset-[#0a0a1a] ${(errorMessage || loginError || showEmailFormatError) ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 focus-within:border-primary-500/50 focus-within:bg-white/10'}`}>
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" aria-hidden />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={emailValue}
                  onChange={(e) => { setEmailValue(e.target.value); setLoginError(null) }}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => { setEmailFocus(false); setEmailTouched(true) }}
                  placeholder=" "
                  title={t('login.emailFormatHint')}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none outline-none text-white placeholder-transparent rounded-xl min-h-[48px]"
                  required
                  aria-required="true"
                  aria-label={t('login.emailAria')}
                  aria-invalid={!!(errorMessage || loginError || showEmailFormatError)}
                  aria-describedby={showEmailFormatError ? 'login-email-format-error' : (errorMessage || loginError) ? 'login-error-message' : undefined}
                />
                <label htmlFor="login-email" className={`absolute left-12 transition-all duration-200 pointer-events-none ${emailFocus || emailValue ? 'top-2 text-xs text-primary-400' : 'top-1/2 -translate-y-1/2 text-sm text-white/50'}`}>
                  {t('login.email')} <span className="text-red-400" aria-hidden>*</span>
                </label>
              </div>
              {showEmailFormatError && (
                <p id="login-email-format-error" className="field-error" role="alert">{t('login.emailFormatError')}</p>
              )}
            </div>
            {/* UX_LAYOUT_200 #88：密碼顯示/隱藏切換 */}
            <div className="form-group-ux">
              <div className={`relative rounded-xl border transition-colors focus-within:ring-2 focus-within:ring-primary-400/30 focus-within:ring-offset-2 focus-within:ring-offset-[#0a0a1a] ${(errorMessage || loginError) ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 focus-within:border-primary-500/50 focus-within:bg-white/10'}`}>
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" aria-hidden />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={passwordValue}
                  onChange={(e) => { setPasswordValue(e.target.value); setLoginError(null) }}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  placeholder=" "
                  className="w-full pl-12 pr-12 py-4 bg-transparent border-none outline-none text-white placeholder-transparent rounded-xl min-h-[48px]"
                  required
                  aria-required="true"
                  aria-label={t('login.passwordAria')}
                  aria-invalid={!!(errorMessage || loginError)}
                />
                <label htmlFor="login-password" className={`absolute left-12 transition-all duration-200 pointer-events-none ${passwordFocus || passwordValue ? 'top-2 text-xs text-primary-400' : 'top-1/2 -translate-y-1/2 text-sm text-white/50'}`}>
                  {t('login.password')} <span className="text-red-400" aria-hidden>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] flex items-center justify-center text-white/50 hover:text-white rounded-lg games-focus-ring"
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-white/60 hover:text-white">
                <input type="checkbox" className="rounded border-white/20 bg-white/10" />
                {t('login.rememberMe')}
              </label>
              <Link href="/auth/forgot-password" className="text-primary-500 hover:text-primary-400">{t('login.forgotPassword')}</Link>
            </div>
            <TurnstileWidget
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              resetKey={turnstileResetKey}
            />
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              aria-label={t('login.submitAria')}
              className={`btn-primary w-full min-h-[48px] min-w-[12rem] py-4 flex items-center justify-center gap-2 btn-icon-text-gap transition-opacity duration-200 games-focus-ring ${loading ? 'is-loading' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2 min-w-[7rem] justify-center">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full shrink-0" aria-hidden />
                  {t('login.loading')}
                </span>
              ) : (
                <>
                  {t('login.emailLogin')}
                  <ArrowRight className="w-5 h-5" aria-hidden />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-white/60 text-sm mt-2">
            <Link href="/auth/forgot-password" className="text-primary-400 hover:underline">{t('login.forgotPasswordReset')}</Link>
          </p>

          <div className="mt-6 pt-6 border-t border-white/10" style={{ marginTop: 'var(--space-section, 1.5rem)' }}>
            <h3 className="text-sm font-semibold text-white/90 mb-1" id="login-magic-heading">{t('login.magicHeading')}</h3>
            <p className="text-sm text-white/70 mb-2">{t('login.magicDescription')}</p>
            {magicSent ? (
              <p className="text-primary-400 text-sm">{t('login.magicSent')}</p>
            ) : (
              <form onSubmit={handleMagicLink} className="flex gap-2" aria-labelledby="login-magic-heading" aria-label={t('login.magicHeading')}>
                <input
                  id="magic-email"
                  type="email"
                  autoComplete="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  className="input-glass flex-1 min-h-[48px]"
                  aria-label={t('login.email')}
                />
                <button type="submit" disabled={loading} className="btn-secondary min-h-[48px] px-4 flex items-center gap-2 games-focus-ring rounded">
                  <Send className="w-4 h-4" />
                  {t('login.sendLink')}
                </button>
              </form>
            )}
          </div>

          <div className="divider text-center text-white/30 text-sm mt-6">
            {t('login.orSignInWith')}
          </div>

          {/* 201–205：Google / Apple / Line */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="min-h-[48px] py-3 rounded-xl bg-white hover:bg-white/90 text-gray-800 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border border-white/20 shadow-sm games-focus-ring"
              aria-label={`${t('login.orSignInWith')} Google`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z" /></svg>
              <span className="hidden sm:inline">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              disabled={loading}
              className="min-h-[48px] py-3 rounded-xl bg-white hover:bg-white/90 text-gray-800 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border border-white/20 shadow-sm games-focus-ring"
              aria-label={`${t('login.orSignInWith')} Apple`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-1.18 1.62-2.09 3.23-3.68 4.44zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
              <span className="hidden sm:inline">Apple</span>
            </button>
            <button
              type="button"
              disabled
              title={t('login.lineComingSoon')}
              className="min-h-[48px] py-3 rounded-xl bg-white hover:bg-white/90 text-[#06C755] font-medium flex items-center justify-center gap-2 border border-white/20 shadow-sm cursor-not-allowed opacity-70 games-focus-ring"
              aria-label={t('login.lineAria')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
              <span className="hidden sm:inline">LINE</span>
              <span className="text-[10px] text-white/50 sm:hidden">{t('login.comingSoon')}</span>
            </button>
          </div>

          <p className="text-center mt-6 text-white/40 text-sm">
            {t('login.agreePrivacy')}{' '}
            <Link href="/privacy" className="text-primary-500 hover:text-primary-400 font-medium underline underline-offset-1">{t('footer.privacy')}</Link>。
          </p>
          <p className="text-center mt-2 text-white/40 text-sm">
            {t('login.noAccount')} <Link href="/register" className="text-primary-500 hover:text-primary-400 font-medium">{t('login.registerFree')}</Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
