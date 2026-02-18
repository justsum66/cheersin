'use client'

import { useState, useCallback } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Smartphone, Send, Instagram, Facebook, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { SpringDrag } from '@/components/ui/SpringDrag'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'
import { useTranslation } from '@/contexts/I18nContext'
import { HOME_COPY } from '@/config/home-copy'
import { FOOTER_DRINK_NOTE, FOOTER_DRINK_NOTE_BOTTOM } from '@/config/home.config'

interface HomeFooterProps {
    faq: React.ReactNode
}

/** HP-018: Email validation regex */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function HomeFooter({ faq }: HomeFooterProps) {
    const { t } = useTranslation()
    const reducedMotion = useReducedMotion()
    const [subscribeSubmitting, setSubscribeSubmitting] = useState(false)
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState<string | null>(null)

    /** HP-018: Validate email with inline error message */
    const validateEmail = useCallback((value: string): boolean => {
        if (!value.trim()) {
            setEmailError('請輸入 Email')
            return false
        }
        if (!EMAIL_REGEX.test(value)) {
            setEmailError('請輸入有效的 Email 格式')
            return false
        }
        setEmailError(null)
        return true
    }, [])

    return (
        <footer id="footer-cta-section" className="border-t border-white/10 bg-white/[0.02] py-10 md:py-14 px-4 relative overflow-hidden safe-area-pb print:py-6" role="contentinfo" aria-label="頁尾與網站地圖">
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a2e]/80 via-transparent to-transparent pointer-events-none" aria-hidden />
            <div className="max-w-7xl xl:max-w-[1440px] mx-auto relative z-10 px-4 sm:px-6 lg:px-8">
                {/* R2-125：下載/CTA 區塊輕微浮動，吸引注意 */}
                <m.div
                    className="max-w-4xl mx-auto text-center mb-10"
                    animate={reducedMotion ? undefined : { y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <h2 id="home-cta-heading" className="home-heading-2 text-white mb-2">{HOME_COPY.ctaFooterTitle}</h2>
                    <p className="home-text-muted home-body mb-6 text-balance">{HOME_COPY.ctaFooterDesc}</p>
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <Link
                            href="/quiz"
                            className="inline-block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]"
                            onClick={() => {
                                try {
                                    fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'footer_cta_quiz', value: 1 }) }).catch(() => { })
                                } catch { /* noop */ }
                            }}
                        >
                            <MagneticButton as="span" strength={0.15} className="btn-primary inline-flex px-8 py-4 min-h-[56px] games-touch-target rounded-2xl font-bold text-base hover:scale-105 transition-transform duration-300 cursor-pointer items-center justify-center gap-2 games-focus-ring relative z-20">
                                <Sparkles className="w-5 h-5" /> {HOME_COPY.ctaFooterButton}
                            </MagneticButton>
                        </Link>
                        <m.div
                            className="opacity-70"
                            animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                            aria-hidden
                        >
                            <Smartphone className="w-10 h-10 text-white/70" />
                        </m.div>
                    </div>
                    <p className="text-white/70 text-sm mb-6 relative z-10" role="note" aria-label="飲酒與年齡提醒">{FOOTER_DRINK_NOTE}</p>
                </m.div>

                {/* Task 9: Big & Bold Watermark */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none z-0 overflow-hidden w-full flex justify-center">
                    <span className="text-[15vw] font-display font-black text-white whitespace-nowrap tracking-tighter loading-none">
                        CHEERSIN
                    </span>
                </div>
                <form
                    id="footer-subscribe-form"
                    className="flex flex-col gap-3 max-w-md mx-auto mt-2 mb-6 home-footer-form opacity-90 text-sm"
                    aria-label="Email 訂閱表單"
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (subscribeSubmitting) return
                        // HP-018: Validate before submit
                        if (!validateEmail(email)) return
                        setSubscribeSubmitting(true)
                        toast.success('已收到！我們會寄送新品與優惠給您。', { duration: 4000 })
                        setTimeout(() => {
                            setSubscribeSubmitting(false)
                            setEmail('')
                        }, 2000)
                    }}
                >
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (emailError) validateEmail(e.target.value)
                                }}
                                onBlur={() => email && validateEmail(email)}
                                placeholder="留下 Email，接收新品與優惠"
                                className={`input-glass flex-1 games-touch-target rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-primary-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a] ${emailError ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
                                aria-label="Email 訂閱"
                                aria-invalid={!!emailError}
                                aria-describedby={emailError ? 'email-error' : undefined}
                                disabled={subscribeSubmitting}
                                required
                            />
                            <button type="submit" disabled={subscribeSubmitting} className="btn-ghost flex items-center justify-center gap-2 games-touch-target px-6 rounded-xl border border-white/20 text-white/80 hover:text-white hover:border-white/30 transition-colors duration-200 games-focus-ring disabled:opacity-60 disabled:cursor-not-allowed" aria-busy={subscribeSubmitting}>
                                <Send className="w-4 h-4" /> {subscribeSubmitting ? '送出中…' : '訂閱'}
                            </button>
                        </div>
                        {/* HP-018: Inline error message */}
                        {emailError && (
                            <p id="email-error" className="flex items-center gap-1 text-red-400 text-xs mt-1" role="alert">
                                <AlertCircle className="w-3 h-3" />
                                {emailError}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 text-left">
                        <label className="flex items-center gap-2 text-white/70 text-xs cursor-pointer">
                            <input type="checkbox" name="consent_news" className="rounded border-white/30 text-primary-500 focus:ring-primary-400" aria-label="同意接收新品與優惠" required />
                            同意接收新品與優惠
                        </label>
                        <label className="flex items-center gap-2 text-white/70 text-xs cursor-pointer">
                            <input type="checkbox" name="consent_privacy" className="rounded border-white/30 text-primary-500 focus:ring-primary-400" aria-label="已讀隱私政策" required />
                            已讀<Link href="/privacy" className="text-primary-400 hover:text-primary-300 underline underline-offset-1">隱私政策</Link>
                        </label>
                    </div>
                </form>
                <div className="flex items-center justify-center gap-4 mb-6 text-white/60" role="navigation" aria-label="社群連結">
                    {/* HP-027：社群圖標 hover 時顯示品牌專屬色 */}
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 text-white/70 transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-purple-500/30 hover:to-pink-500/30 ring-2 ring-transparent hover:ring-4 hover:ring-pink-500/30 hover:text-pink-400" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 text-white/70 transition-all duration-300 hover:scale-110 hover:bg-blue-600/30 ring-2 ring-transparent hover:ring-4 hover:ring-blue-500/30 hover:text-blue-400" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
                    <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/10 text-white/70 transition-all duration-300 hover:scale-110 hover:bg-green-500/30 ring-2 ring-transparent hover:ring-4 hover:ring-green-500/30 hover:text-green-400" aria-label="Line"><span className="text-sm font-bold">LINE</span></a>
                </div>
                <p className="text-white/70 text-sm mb-8" role="note" aria-label="飲酒提醒">{FOOTER_DRINK_NOTE_BOTTOM}</p>

                {/* 網站地圖（原 Footer 內容）：產品／體驗／公司／語系 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">{t('footer.sectionProduct')}</h3>
                        <ul className="space-y-2" aria-label={t('footer.sectionProduct')}>
                            {[{ href: '/quiz', label: t('nav.quiz') }, { href: '/games', label: t('nav.games') }, { href: '/assistant', label: t('nav.assistant') }, { href: '/learn', label: t('nav.learn') }].map(({ href, label }) => (
                                <li key={href}><Link href={href} className="text-white/60 hover:text-white text-sm transition-colors min-h-[44px] min-w-[44px] flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded" aria-label={label}>{label}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">體驗</h3>
                        <ul className="space-y-2" aria-label="體驗">
                            {[{ href: '/script-murder', label: '酒局劇本殺' }, { href: '/party-dj', label: '派對 DJ' }, { href: '/party-room', label: '派對房' }].map(({ href, label }) => (
                                <li key={href}><Link href={href} className="text-white/60 hover:text-white text-sm transition-colors min-h-[44px] min-w-[44px] flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded" aria-label={label}>{label}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">{t('footer.sectionCompany')}</h3>
                        <ul className="space-y-2" aria-label={t('footer.sectionCompany')}>
                            {[{ href: '/pricing', label: t('nav.pricing') }, { href: '/privacy', label: t('footer.privacy') }, { href: '/terms', label: t('footer.terms') }].map(({ href, label }) => (
                                <li key={href}><Link href={href} className="text-white/60 hover:text-white text-sm transition-colors min-h-[44px] min-w-[44px] flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded" aria-label={label}>{label}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
                        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">{t('footer.sectionLanguage')}</h3>
                        <LocaleSwitcher />
                    </div>
                </div>

                {/* 法律與支援：無障礙、狀態、訂閱、取消、聯絡、企業 */}
                <h2 id="footer-links-heading" className="sr-only">法律與支援</h2>
                <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-8 mb-6 text-sm home-footer-link" aria-labelledby="footer-links-heading">
                    <Link href="/accessibility" className="games-touch-target inline-flex items-center justify-center px-2 py-2 games-focus-ring rounded">無障礙聲明</Link>
                    <span className="text-white/30" aria-hidden>|</span>
                    <Link href="/status" className="games-touch-target inline-flex items-center justify-center px-2 py-2 games-focus-ring rounded">系統狀態</Link>
                    <span className="text-white/30" aria-hidden>|</span>
                    <Link href="/subscription" className="games-touch-target inline-flex items-center justify-center px-2 py-2 games-focus-ring rounded">訂閱管理</Link>
                    <span className="text-white/30" aria-hidden>|</span>
                    <Link href="/subscription/cancel" className="games-touch-target inline-flex items-center justify-center px-2 py-2 text-white/70 hover:text-white games-focus-ring rounded">取消訂閱</Link>
                    <span className="text-white/30" aria-hidden>|</span>
                    <a href="mailto:hello@cheersin.app" className="games-touch-target inline-flex items-center justify-center px-2 py-2 games-focus-ring rounded">聯絡我們</a>
                    <span className="text-white/30" aria-hidden>|</span>
                    <a href="mailto:enterprise@cheersin.app?subject=企業/團體需求&body=..." className="games-touch-target inline-flex items-center justify-center px-2 py-2 text-white/70 hover:text-white games-focus-ring rounded">企業需求</a>
                    <span className="text-white/30" aria-hidden>|</span>
                    <a href="mailto:partners@cheersin.app?subject=酒吧/場地合作&body=您好，我是[店家名稱]，想了解合作方案。" className="games-touch-target inline-flex items-center justify-center px-2 py-2 text-white/70 hover:text-white games-focus-ring rounded font-bold text-yellow-400">酒吧/場地合作</a>
                </nav>

                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    <p className="text-white/50 text-sm text-center md:text-left flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                        <span>{t('footer.copyright').replace('©', `© ${new Date().getFullYear()} `)}</span>
                        <span className="hidden md:inline text-white/20">|</span>
                        <span className="flex items-center gap-1.5 text-white/60">
                            Made with <span className="text-red-500 animate-pulse">❤️</span> for Parties
                        </span>
                    </p>
                    <p className="text-white/40 text-xs" aria-label="飲酒警語">飲酒過量有害健康</p>
                </div>

                <div className="hidden md:block mt-4">
                    <SpringDrag dragDirection="x" dragConstraints={{ left: -60, right: 60, top: 0, bottom: 0 }} className="inline-block cursor-grab active:cursor-grabbing rounded-full px-4 py-2 text-white/40 text-xs border border-white/10 hover:border-white/20 hover:text-white/60">拖曳試試 →</SpringDrag>
                </div>

                <div className="mt-8">{faq}</div>
            </div>
        </footer>
    )
}
