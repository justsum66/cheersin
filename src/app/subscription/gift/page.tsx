'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Gift, CheckCircle, ArrowLeft, Loader2, Mail } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { PAYPAL_PLANS, type PayableTier } from '@/config/pricing.config'

/** PAY-023: Gift subscription flow — buy a subscription for a friend */
export default function GiftSubscriptionPage() {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [senderName, setSenderName] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTier, setSelectedTier] = useState<PayableTier>('basic')
  const [months, setMonths] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const totalPrice = PAYPAL_PLANS[selectedTier].priceMonthly * months

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipientEmail.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/subscription/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          senderName: senderName.trim(),
          message: message.trim(),
          tier: selectedTier,
          months,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.approvalUrl) {
          window.location.href = data.approvalUrl
        } else {
          setSubmitted(true)
          toast.success('Gift subscription created!')
        }
      } else {
        const data = await res.json()
        toast.error(data.error?.message ?? 'Failed to create gift')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-wine-950 flex items-center justify-center px-4">
        <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Gift Sent!</h1>
          <p className="text-white/60 text-sm mb-6">
            We&apos;ll send an email to {recipientEmail} with instructions to redeem their gift.
          </p>
          <Link href="/" className="btn-primary block w-full min-h-[48px] py-3 rounded-xl font-semibold text-center">
            Back to Home
          </Link>
        </m.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-wine-950 pt-0 pb-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <BrandLogo variant="compact" href="/" size={36} />
          </Link>
          <m.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Gift className="w-7 h-7 text-primary-400" aria-hidden />
            Gift a Subscription
          </m.h1>
          <p className="text-white/50 text-sm">Give the gift of wine knowledge and fun</p>
        </div>

        <m.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass rounded-2xl p-6 space-y-5"
        >
          {/* Plan selection */}
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Plan</label>
            <div className="grid grid-cols-2 gap-3">
              {(['basic', 'premium'] as const).map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`p-3 rounded-xl text-center border transition-all ${
                    selectedTier === tier
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                  }`}
                >
                  <p className="font-semibold text-sm">{PAYPAL_PLANS[tier].name.replace('Cheersin ', '')}</p>
                  <p className="text-xs mt-1">NT${PAYPAL_PLANS[tier].priceMonthly}/mo</p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Duration</label>
            <div className="flex gap-2">
              {[1, 3, 6, 12].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    months === m
                      ? 'border-primary-500 bg-primary-500/10 text-white'
                      : 'border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  {m} mo
                </button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="text-white/70 text-sm font-medium block mb-1">Recipient Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" aria-hidden />
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                placeholder="friend@example.com"
                className="w-full min-h-[48px] rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-white placeholder-white/30 text-sm"
              />
            </div>
          </div>

          {/* Sender name */}
          <div>
            <label className="text-white/70 text-sm font-medium block mb-1">Your Name (optional)</label>
            <input
              type="text"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              placeholder="From..."
              maxLength={50}
              className="w-full min-h-[48px] rounded-xl bg-white/5 border border-white/10 px-4 text-white placeholder-white/30 text-sm"
            />
          </div>

          {/* Personal message */}
          <div>
            <label className="text-white/70 text-sm font-medium block mb-1">Personal Message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="Enjoy exploring the world of wine!"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 text-sm resize-none"
            />
          </div>

          {/* Total */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-white/60 text-sm">Total</span>
            <span className="text-white font-bold text-lg">NT${totalPrice.toLocaleString()}</span>
          </div>

          <button
            type="submit"
            disabled={!recipientEmail.trim() || submitting}
            className="w-full min-h-[48px] py-3 rounded-xl btn-primary font-semibold disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              `Send Gift — NT$${totalPrice.toLocaleString()}`
            )}
          </button>
        </m.form>

        <div className="mt-6 text-center">
          <Link href="/subscription" className="inline-flex items-center gap-1 text-white/40 hover:text-white text-sm">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
        </div>
      </div>
    </main>
  )
}
