'use client'

import { useState, useEffect } from 'react'
import { useAccordion } from '@/hooks/useAccordion'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/contexts/I18nContext'
import {
  Crown,
  Check,
  X,
  Star,
  Zap,
  Shield,
  MessageCircle,
  BookOpen,
  Users,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import FeatureIcon from '@/components/ui/FeatureIcon'
import { SOCIAL_PROOF_USER_COUNT } from '@/lib/constants'
import {
  PRICING_PLANS_DISPLAY,
  COMPARISON_ROWS_PRICING as COMPARISON_ROWS,
  YEARLY_MONTHS_PAID,
  YEARLY_MONTHS_GET,
  FIRST_MONTH_HALF_OFF,
  PLAN_ID_TO_TIER,
  getPromoEndMs,
} from '@/config/pricing.config'
import { TESTIMONIALS } from '@/config/testimonials.config'

/** E01/E03：方案與功能對比從 pricing.config 讀取；icon 與 color 由頁面對應 */
const PLAN_ICONS = { starter: Star, pro: Zap, elite: Crown } as const
const PLAN_COLORS = { starter: 'white', pro: 'primary', elite: 'accent' } as const
const plans = PRICING_PLANS_DISPLAY.map((p) => ({
  ...p,
  color: PLAN_COLORS[p.id],
  icon: PLAN_ICONS[p.id],
}))

/** T025/T046 P2：促銷與試用、取消與退款；i18n #23 定價 FAQ 題目與答案從 pricing.faq0q/faq0a… 讀取 */
const FAQ_INDICES = [0, 1, 2, 3, 4, 5, 6] as const

/** E48：用戶見證從 config 讀取，可更新頭像與文案（已於上方 import） */

/** E81 P2：倒數從 config/env 讀取，無活動時不顯示倒數；i18n 接線 pricing.* */
export default function PricingPage() {
  const { t } = useTranslation()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [faqOpen, setFaqOpen] = useAccordion(null)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [promoEndMs, setPromoEndMs] = useState<number>(0)
  const [promoRemaining, setPromoRemaining] = useState<number | null>(null)

  /** R2-074：用戶見證輪播 — 每 6 秒自動切換，平滑過渡 */
  useEffect(() => {
    const total = TESTIMONIALS.length
    if (total <= 1) return
    const id = setInterval(() => setTestimonialIndex((i) => (i + 1) % total), 6000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setPromoEndMs(getPromoEndMs())
  }, [])
  useEffect(() => {
    if (promoEndMs <= 0) return
    const tick = () => setPromoRemaining(Math.max(0, promoEndMs - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [promoEndMs])

  /** 年繳：買 10 送 2，總價 = 月價 × 10 */
  const yearlyTotal = (price: number) => price * YEARLY_MONTHS_PAID
  const yearlyPerMonth = (price: number) => (price * YEARLY_MONTHS_PAID) / YEARLY_MONTHS_GET

  const formatPromoRemaining = (ms: number) => {
    const d = Math.floor(ms / 86400000)
    const h = Math.floor((ms % 86400000) / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    if (d > 0) return `${d} 天 ${h} 時 ${m} 分 ${s} 秒`
    return `${h} 時 ${m} 分 ${s} 秒`
  }

  /** EXPERT_60 P2：定價頁 FAQ 結構化資料（FAQPage schema）；i18n 題目/答案來自 t() */
  const faqItems = FAQ_INDICES.map((i) => ({ q: t(`pricing.faq${i}q`), a: t(`pricing.faq${i}a`) }))
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <main className="min-h-screen pt-0 pb-16 px-4 overflow-hidden relative safe-area-px safe-area-pb page-container-mobile max-w-7xl mx-auto" role="main" aria-label="方案定價">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {/* E81：限時優惠倒數與實際活動結束時間一致；R2-093 翻頁效果 */}
      {promoEndMs > 0 && promoRemaining != null && promoRemaining > 0 && (
        <div className="sticky top-0 z-50 w-full py-2.5 px-4 bg-red-700 text-white text-center text-sm font-medium shadow-lg" style={{ perspective: '200px' }}>
          {t('pricing.promoCountdown')}：
          <motion.span
            key={Math.floor(promoRemaining / 1000)}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="inline-block mx-1 font-mono font-bold tabular-nums"
            style={{ transformOrigin: '50% 70%' }}
          >
            {formatPromoRemaining(promoRemaining)}
          </motion.span>
          · {t('pricing.promoFirstHalf')}
          <span className="block text-white/80 text-xs mt-0.5">實際優惠期限以本站公告為準</span>
        </div>
      )}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl xl:max-w-[1440px] mx-auto relative z-10">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-400 text-sm font-bold uppercase tracking-widest mb-3"
          >
            <Crown className="w-4 h-4" />
            {t('pricing.badge')}
          </motion.div>
          <h1 className="home-heading-1 font-display font-bold mb-4 text-white">
            {t('pricing.heading')}<span className="gradient-text">{t('pricing.headingHighlight')}</span>
          </h1>
          <p className="text-white/40 text-xl max-w-2xl mx-auto mb-2">
            {t('pricing.subheading')}
          </p>
          <p className="text-white/50 text-xs mb-6" role="note">{t('pricing.disclaimer')}</p>

          <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 relative">
            <div
              className={`absolute inset-y-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-[0.25s] ease-[cubic-bezier(0.32,0.72,0,1)] ${
                billingCycle === 'monthly' ? 'left-1 w-[calc(50%-4px)]' : 'left-[50%] w-[calc(50%-4px)]'
              }`}
            />
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 px-8 py-3 text-sm font-bold transition-colors min-h-[48px] min-w-[48px] inline-flex items-center justify-center games-focus-ring rounded-xl ${
                billingCycle === 'monthly' ? 'text-white font-bold' : 'text-white/40'
              }`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`relative z-10 px-8 py-3 text-sm font-bold transition-colors min-h-[48px] min-w-[48px] inline-flex items-center justify-center games-focus-ring rounded-xl ${
                billingCycle === 'yearly' ? 'text-white font-bold' : 'text-white/40'
              }`}
            >
              {t('pricing.yearly')} <span className="text-primary-400 text-[10px] ml-1">{t('pricing.yearlyBadge')}</span>
            </button>
          </div>
        </div>

        {/* E07/E12 / R2-129/R2-207：Trust badge、退款徽章動畫、社會認證「已有 X 人升級」 */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-4 mb-4 text-white/60 text-sm">
          <span className="inline-flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-400" aria-hidden />
            {t('pricing.trustSecure')}
          </span>
          <span>{t('pricing.trustCancel')}</span>
          <span className="inline-flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity duration-300">
            <Shield className="w-4 h-4 text-primary-400 drop-shadow-[0_0_6px_rgba( var(--color-primary-400), 0.5 )]" aria-hidden />
            {t('pricing.trustRefund')}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-primary-300/90">
            <Users className="w-4 h-4 text-primary-400" aria-hidden />
            {SOCIAL_PROOF_USER_COUNT.toLocaleString('en-US')}+ 用戶信賴 Cheersin
          </span>
          <span className="inline-flex items-center gap-1.5 text-white/80" role="status">
            <Zap className="w-4 h-4 text-primary-400" aria-hidden />
            已有 {SOCIAL_PROOF_USER_COUNT.toLocaleString('zh-TW')}+ 人升級 Pro
          </span>
          <Link href="/terms" className="text-primary-400 hover:text-primary-300 underline underline-offset-1">{t('pricing.terms')}</Link>
          <Link href="/terms#refund" className="text-primary-400 hover:text-primary-300 underline underline-offset-1">{t('pricing.refundPolicy')}</Link>
        </div>

        {/* R2-045：定價方案卡片入場 stagger（delay 依 index） */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative glass-card p-8 transition-all duration-300 games-focus-ring ${
                plan.popular
                  ? 'bg-white/[0.05] border-2 border-primary-400 ring-2 ring-primary-400/50 shadow-glass-hover scale-105 z-10'
                  : 'hover:shadow-lg hover:border-primary-500/30 hover:bg-white/5 hover:border-white/20'
              }`}
            >
              {/* R2-058：最受歡迎標籤金色邊框脈動 */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-primary-500/90 text-white text-xs font-semibold tracking-widest shadow-lg shadow-primary-500/30 border border-primary-300/80 animate-[pulse_2.5s_ease-in-out_infinite]">
                  {t('pricing.mostPopular')}
                </div>
              )}
              <div className="mb-6">
                <FeatureIcon icon={plan.icon} size="md" color={plan.color as 'white' | 'primary' | 'accent'} />
                <h3 className="text-2xl font-bold text-white mt-4 mb-1">{plan.name}</h3>
                <p className="text-white/50 text-sm mb-2">{plan.subName}</p>
                {plan.sceneLabel && (
                  <p className="text-primary-400/90 text-xs font-medium uppercase tracking-wider" aria-label="適用場景">{plan.sceneLabel}</p>
                )}
                {/* D53 原價刪除線 + 紅色「省 XX%」 */}
                {plan.price > 0 && plan.originalPrice != null && plan.originalPrice > plan.price && billingCycle === 'monthly' && (
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white/50 text-sm line-through">NT${plan.originalPrice}</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/90 text-white text-xs font-bold">
                      省 {Math.round((1 - plan.price / plan.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
                {plan.price > 0 && FIRST_MONTH_HALF_OFF && billingCycle === 'monthly' && (
                  <p className="text-primary-400/90 text-xs mb-1">首月半價促銷</p>
                )}
                {/* R2-072：月/年切換時價格數字平滑過渡 */}
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-xl text-white/60 font-medium">NT$</span>
                  <motion.span
                    key={`${plan.id}-${billingCycle}-${billingCycle === 'yearly' && plan.price > 0 ? Math.round(yearlyPerMonth(plan.price)) : plan.price}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="text-4xl md:text-[48px] leading-none font-display font-bold text-white tabular-nums inline-block"
                  >
                    {billingCycle === 'yearly' && plan.price > 0
                      ? Math.round(yearlyPerMonth(plan.price))
                      : plan.price}
                  </motion.span>
                  <span className="text-white/40 text-sm">/月</span>
                </div>
                {billingCycle === 'yearly' && plan.price > 0 && (
                  <p className="text-white/40 text-xs mt-1">
                    年繳 NT${yearlyTotal(plan.price)}（買 10 送 2，相當於 2 個月免費）
                  </p>
                )}
                {/* EXPERT_60 P0：社會認證 — 價格下方信任數字 */}
                {plan.popular && (
                  <p className="text-white/50 text-xs mt-2 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {SOCIAL_PROOF_USER_COUNT.toLocaleString('en-US')}+ 用戶已訂閱
                  </p>
                )}
              </div>
              {/* D54 功能列表：✓ 綠色圓底、✗ 灰色淡化 */}
              <div className="space-y-4 mb-8">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-3 text-white/80">
                    <div className="mt-1 p-1 rounded-full bg-success shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-start gap-3 text-white/30">
                    <div className="mt-1 p-1 rounded-full bg-white/10 shrink-0">
                      <X className="w-3 h-3 text-white/50" />
                    </div>
                    <span className="text-sm line-through decoration-white/20">{f}</span>
                  </div>
                ))}
              </div>
              {/* E07 / T092：Pro 方案主按鈕漸層+微動效，其餘 ghost；Trust badge 已於方案區上方 */}
              <Link
                href={
                  plan.price === 0 ? '/' : `/subscription?plan=${PLAN_ID_TO_TIER[plan.id]}`
                }
                onClick={() => {
                  if (plan.price > 0) {
                    try {
                      fetch('/api/analytics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: 'pricing_click', value: 1, id: plan.id }),
                      }).catch(() => {});
                    } catch { /* noop */ }
                  }
                }}
                className={`block w-full min-h-[48px] py-4 rounded-xl font-bold text-center transition-all duration-200 games-focus-ring ${
                  plan.popular
                    ? 'btn-primary text-lg shadow-lg shadow-primary-500/25 hover:scale-[1.02] hover:shadow-primary-500/40 active:scale-[0.99]'
                    : 'btn-secondary hover:bg-white/10'
                }`}
              >
                {plan.price === 0 ? t('pricing.startFree') : plan.id === 'pro' ? t('pricing.upgradePro') : t('pricing.trial7')}
              </Link>
              <p className="text-center text-[10px] text-white/30 mt-4 uppercase tracking-wider">
                {plan.price === 0 ? t('pricing.noCard') : t('pricing.cancelSecureRefund')}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 181–185：功能對比表（圖標 + 灰色不包含 + title 說明） */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="home-heading-2 font-display font-bold text-white mb-6 text-center">{t('pricing.compareTitle')}</h2>
          <div className="overflow-x-auto min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] -mx-4 px-4 sm:mx-0 sm:px-0" role="region" aria-label={t('pricing.compareTitle')}>
            <table className="w-full min-w-[600px] text-left text-sm" role="table" aria-label={t('pricing.compareTitle')}>
              <thead>
                <tr className="border-b border-white/10">
                  <th id="pricing-col-feature" scope="col" className="p-4 font-semibold text-white/80">{t('pricing.feature')}</th>
                  <th id="pricing-col-starter" scope="col" className="p-4 font-semibold text-white/80">{t('pricing.free')}</th>
                  <th id="pricing-col-pro" scope="col" className="p-4 font-semibold text-primary-400">{t('pricing.proLabel')}</th>
                  <th id="pricing-col-elite" scope="col" className="p-4 font-semibold text-accent-400">{t('pricing.vip')}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                    title={row.tooltip}
                  >
                    <td headers="pricing-col-feature" className="p-4 text-white/90">{row.feature}</td>
                    <td headers="pricing-col-starter" className={`p-4 ${row.starter === '—' ? 'text-white/40' : 'text-white/70'}`}>{row.starter}</td>
                    <td headers="pricing-col-pro" className={`p-4 ${row.pro === '—' ? 'text-white/40' : 'text-white/80'}`}>{row.pro}</td>
                    <td headers="pricing-col-elite" className={`p-4 ${row.elite === '—' ? 'text-white/40' : 'text-white/80'}`}>{row.elite}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* 186–187：CTA 免費試用 7 天、不滿意全額退款 — 已整合至卡片按鈕與副文案 */}

        {/* 188 / D59：用戶見證輪播（頭像 + 姓名 + 評價） */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="home-heading-2 font-display font-bold text-white mb-6 text-center">{t('pricing.testimonials')}</h2>
          <div className="max-w-xl mx-auto overflow-hidden" style={{ perspective: '800px' }}>
          <motion.div
            key={testimonialIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
            whileHover={{ rotateX: 2, rotateY: -2, transition: { duration: 0.2 } }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                <Image
                  src={TESTIMONIALS[testimonialIndex].avatar}
                  alt={TESTIMONIALS[testimonialIndex].name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-sm">{TESTIMONIALS[testimonialIndex].name}</p>
                <p className="text-white/50 text-xs">{TESTIMONIALS[testimonialIndex].role}</p>
              </div>
            </div>
            <p className="text-white/90 text-center mb-4">「{TESTIMONIALS[testimonialIndex].text}」</p>
            <div className="flex justify-center gap-2 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTestimonialIndex(i)}
                  className={`min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full transition-colors games-focus-ring p-2 ${
                    i === testimonialIndex ? 'bg-primary-500' : 'bg-white/30'
                  }`}
                  aria-label={`見證 ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
          </div>
        </motion.section>

        {/* E27：常見問題 id 可錨點；付費相關 FAQ 已置頂 */}
        <motion.section
          id="faq"
          aria-labelledby="faq-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-16 scroll-mt-20"
        >
          <h2 id="faq-heading" className="home-heading-2 font-display font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5" />
            {t('pricing.faq')}
          </h2>
          <div className="max-w-2xl mx-auto space-y-2">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
              >
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-controls={`faq-a-${i}`}
                  className="w-full flex items-center justify-between p-4 text-left text-white/90 font-medium games-touch-target games-focus-ring rounded-xl"
                  onClick={() => setFaqOpen(i)}
                  aria-expanded={faqOpen === i}
                >
                  {item.q}
                  {faqOpen === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ gridTemplateRows: faqOpen === i ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ opacity: faqOpen === i ? 1 : 0.6 }}
                      transition={{ duration: 0.25 }}
                      className="px-4 pb-4 text-white/70 text-sm"
                    >
                      {item.a}
                    </motion.div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 191–195：PayPal / 訂閱管理入口；EXPERT_60 P1：CTA 連到 #faq */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-white/50 text-sm mb-2">{t('pricing.safePayment')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/subscription"
              className="inline-flex items-center gap-2 min-h-[48px] text-primary-400 hover:text-primary-300 text-sm font-medium games-focus-ring rounded"
            >
              {t('pricing.subscribeManage')}
            </Link>
            <Link
              href="#faq"
              className="inline-flex items-center gap-2 min-h-[48px] text-white/60 hover:text-white text-sm font-medium scroll-smooth games-focus-ring rounded"
            >
              <HelpCircle className="w-4 h-4" />
              {t('pricing.faq')}
            </Link>
            <span className="text-white/40">·</span>
            <a href="mailto:hello@cheersin.app" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium">
              {t('pricing.contact')}
            </a>
          </div>
        </motion.section>

        {/* 196–200：團隊方案 / 企業詢價 / 預約 Demo；EXPERT_60 P0：表單前消除疑慮文案 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-16 p-8 rounded-2xl bg-white/5 border border-white/10 max-w-2xl mx-auto"
        >
          {/* T066 P2：企業/團體需求請聯絡 — 定價頁入口 */}
          <h2 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-400" />
            {t('pricing.teamTitle')}
          </h2>
          <p className="text-white/60 text-sm mb-4">
            企業／團體客製化方案：專屬題庫、品牌露出、數據報表。填寫需求或來信，我們將與您聯繫。
          </p>
          <p className="text-white/40 text-xs mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            安全付款 · 隨時取消，無需綁約
          </p>
          {/* E93 P2：商業合作／酒商通路預留 — 可後續接實際合作 */}
          <p className="text-white/50 text-xs mb-3">
            酒商、通路、商業合作洽詢：<a href="mailto:enterprise@cheersin.app?subject=商業合作" className="text-primary-400 hover:text-primary-300 underline">enterprise@cheersin.app</a>
          </p>
          {/* 199：案例展示 */}
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="text-white/40 text-xs uppercase tracking-wider">合作案例</span>
            <div className="flex flex-wrap gap-2">
              {['某科技公司 50 人團隊', '某餐飲集團品酒培訓', '某外商年終品酒會'].map((label, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label id="enterprise-name-label" htmlFor="enterprise-name" className="block text-white/70 text-sm mb-1">公司／團隊名稱</label>
              <input
                id="enterprise-name"
                type="text"
                placeholder="請填寫"
                className="input-glass min-h-[48px] text-sm"
                aria-labelledby="enterprise-name-label"
              />
            </div>
            <div>
              <label id="enterprise-email-label" htmlFor="enterprise-email" className="block text-white/70 text-sm mb-1">聯絡 Email</label>
              <input
                id="enterprise-email"
                type="email"
                placeholder="email@example.com"
                className="input-glass min-h-[48px] text-sm"
                aria-labelledby="enterprise-email-label"
              />
            </div>
            <div>
              <label id="enterprise-desc-label" htmlFor="enterprise-desc" className="block text-white/70 text-sm mb-1">需求說明（人數、預算、功能）</label>
              <textarea
                id="enterprise-desc"
                placeholder="請簡述需求"
                rows={3}
                className="input-glass text-sm resize-none"
                aria-labelledby="enterprise-desc-label"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-primary min-h-[48px] px-6 inline-flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {t('pricing.enterpriseSubmit')}
              </button>
              <Link
                href="mailto:enterprise@cheersin.app?subject=預約 Demo"
                className="btn-secondary min-h-[48px] px-6 inline-flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {t('pricing.bookDemo')}
              </Link>
            </div>
          </form>
        </motion.section>

        {/* 190：即時客服浮動按鈕 */}
        <a
          href="mailto:support@cheersin.app?subject=定價方案諮詢"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/40 hover:bg-primary-400 transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]"
          aria-label={t('pricing.support')}
        >
          <MessageCircle className="w-6 h-6" />
        </a>

        {/* Trust Badges */}
        <div className="mt-24 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 text-center">
          {['安全支付', '隨時取消', '24/7 支援', '專家認證'].map((text, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-white/30">
              <Shield className="w-6 h-6" />
              <span className="text-xs uppercase tracking-widest">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
