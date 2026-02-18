'use client'

import { useState, useEffect, useCallback } from 'react'
import { m } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowUpCircle, ArrowDownCircle, Shield, Clock, CreditCard, Loader2 } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { PRICING_PLANS_DISPLAY, PAYPAL_PLANS, type PayableTier } from '@/config/pricing.config'
import type { SubscriptionTier } from '@/lib/subscription'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'

interface SubscriptionInfo {
  tier: SubscriptionTier
  current_period_end: string | null
  paypal_subscription_id?: string | null
  status?: string
}

/** PAY-009: Subscription upgrade/downgrade flow UI */
export default function SubscriptionManagePage() {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetchWithTimeout('/api/subscription', { timeoutMs: 15000 })
      const data = await res.json()
      if (data.subscription) {
        setSubscription(data.subscription)
      }
    } catch {
      toast.error('Unable to load subscription info')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const currentTier = subscription?.tier ?? 'free'

  const handleChangePlan = async (targetTier: PayableTier) => {
    if (processing) return
    setProcessing(true)
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-subscription',
          planType: targetTier,
        }),
      })
      const data = await res.json()
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl
      } else {
        toast.error(data.error?.message ?? 'Failed to start plan change')
      }
    } catch {
      toast.error('Network error, please try again')
    } finally {
      setProcessing(false)
    }
  }

  /** PAY-012: Calculate proration for mid-cycle upgrades */
  const calculateProration = (fromTier: SubscriptionTier, toTier: PayableTier): { amount: number; daysRemaining: number } | null => {
    if (fromTier === 'free' || !subscription?.current_period_end) return null
    const fromPrice = fromTier === 'basic' ? PAYPAL_PLANS.basic.priceMonthly : PAYPAL_PLANS.premium.priceMonthly
    const toPrice = PAYPAL_PLANS[toTier].priceMonthly
    const endDate = new Date(subscription.current_period_end)
    const now = new Date()
    const diffMs = endDate.getTime() - now.getTime()
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    const dailyDiff = (toPrice - fromPrice) / 30
    const amount = Math.round(dailyDiff * daysRemaining)
    return { amount, daysRemaining }
  }

  const tiers: { tier: PayableTier; display: typeof PRICING_PLANS_DISPLAY[number] }[] = (
    ['basic', 'premium'] as const
  ).map(t => ({
    tier: t,
    display: PRICING_PLANS_DISPLAY.find(p => p.tier === t)!,
  }))

  const isUpgrade = (target: PayableTier) => {
    if (currentTier === 'free') return true
    if (currentTier === 'basic' && target === 'premium') return true
    return false
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-wine-950 pt-0 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <BrandLogo variant="compact" href="/" size={36} />
          </Link>
          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
          >
            Manage Subscription
          </m.h1>
          <p className="text-white/50">Change, upgrade, or downgrade your current plan</p>
        </div>

        {/* Current subscription card */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            <m.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10"
              role="region"
              aria-label="Current plan"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-white/50 text-sm mb-1">Current Plan</p>
                  <p className="text-white text-xl font-bold capitalize">
                    {currentTier === 'free' ? 'Free' : currentTier === 'basic' ? 'Basic (Pro)' : 'Premium (VIP)'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" aria-hidden />
                  <span className="text-green-400 text-sm font-medium capitalize">
                    {subscription?.status ?? 'active'}
                  </span>
                </div>
              </div>
              {subscription?.current_period_end && (
                <div className="flex items-center gap-2 mt-3 text-white/50 text-sm">
                  <Clock className="w-4 h-4" aria-hidden />
                  <span>Next billing: {subscription.current_period_end}</span>
                </div>
              )}
            </m.div>

            {/* Plan options */}
            <div className="grid md:grid-cols-2 gap-6">
              {tiers.map(({ tier, display }, idx) => {
                const isCurrent = tier === currentTier
                const upgrade = isUpgrade(tier)
                const proration = !isCurrent ? calculateProration(currentTier, tier) : null

                return (
                  <m.div
                    key={tier}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`rounded-2xl p-6 border transition-all ${
                      isCurrent
                        ? 'border-primary-500/50 bg-primary-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {upgrade && !isCurrent ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-400" aria-hidden />
                      ) : !isCurrent ? (
                        <ArrowDownCircle className="w-5 h-5 text-yellow-400" aria-hidden />
                      ) : (
                        <CreditCard className="w-5 h-5 text-primary-400" aria-hidden />
                      )}
                      <h3 className="text-white font-bold text-lg">{display.name}</h3>
                      {isCurrent && (
                        <span className="text-xs bg-primary-500/30 text-primary-300 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="text-2xl font-bold text-white mb-1">
                      NT${display.price}<span className="text-sm text-white/50 font-normal">/mo</span>
                    </p>

                    <ul className="space-y-2 my-4">
                      {display.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <span className="text-primary-400 mt-0.5">&#10003;</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* PAY-012: Proration display */}
                    {proration && proration.amount !== 0 && (
                      <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                        <p className="text-white/60">
                          {upgrade ? 'Prorated charge' : 'Prorated credit'}:{' '}
                          <span className="text-white font-medium">
                            NT${Math.abs(proration.amount)}
                          </span>
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          {proration.daysRemaining} days remaining in current cycle
                        </p>
                      </div>
                    )}

                    {isCurrent ? (
                      <p className="text-center text-white/40 text-sm py-2">Your current plan</p>
                    ) : (
                      <button
                        onClick={() => handleChangePlan(tier)}
                        disabled={processing}
                        className={`w-full min-h-[48px] py-3 rounded-xl font-semibold text-sm transition-all ${
                          upgrade
                            ? 'btn-primary'
                            : 'bg-white/10 text-white hover:bg-white/15'
                        } disabled:opacity-50`}
                      >
                        {processing ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                          </span>
                        ) : upgrade ? (
                          'Upgrade'
                        ) : (
                          'Downgrade'
                        )}
                      </button>
                    )}
                  </m.div>
                )
              })}
            </div>

            {/* Quick links */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/subscription/history" className="text-primary-400 hover:text-primary-300 underline underline-offset-2">
                Payment History
              </Link>
              <Link href="/subscription/cancel" className="text-white/50 hover:text-white underline underline-offset-2">
                Cancel Subscription
              </Link>
              <Link href="/subscription" className="text-white/50 hover:text-white underline underline-offset-2">
                Back to Subscription
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
