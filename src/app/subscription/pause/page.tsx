'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { PauseCircle, CheckCircle, ArrowLeft, Loader2, Calendar } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'

/** PAY-027: Subscription pause feature — pause for 1-3 months */
export default function SubscriptionPausePage() {
  const [duration, setDuration] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const resumeDate = new Date()
  resumeDate.setMonth(resumeDate.getMonth() + duration)
  const resumeStr = resumeDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })

  const handlePause = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/subscription/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months: duration }),
      })
      if (res.ok) {
        setSubmitted(true)
        toast.success('Subscription paused')
      } else {
        const data = await res.json()
        toast.error(data.error?.message ?? 'Failed to pause')
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
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-blue-400" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Subscription Paused</h1>
          <p className="text-white/60 text-sm mb-2">
            Your subscription is paused for {duration} month{duration > 1 ? 's' : ''}.
          </p>
          <p className="text-white/40 text-sm mb-6">
            It will automatically resume on <span className="text-white/70 font-medium">{resumeStr}</span>.
          </p>
          <Link href="/subscription" className="btn-primary block w-full min-h-[48px] py-3 rounded-xl font-semibold text-center">
            Back to Subscription
          </Link>
        </m.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-wine-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-6">
            <BrandLogo variant="compact" href="/" size={36} />
          </Link>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <PauseCircle className="w-5 h-5 text-blue-400" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Pause Subscription</h1>
              <p className="text-white/50 text-sm">Take a break, come back anytime</p>
            </div>
          </div>

          <p className="text-white/60 text-sm mb-6">
            During the pause, you&apos;ll be downgraded to the free plan. Your data and progress will be preserved.
            Billing will resume automatically after the pause period.
          </p>

          <div className="mb-6">
            <label className="text-white/70 text-sm font-medium block mb-3">
              <Calendar className="w-4 h-4 inline mr-1" aria-hidden />
              Pause Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(m)}
                  className={`py-3 rounded-xl text-center border transition-all ${
                    duration === m
                      ? 'border-blue-500 bg-blue-500/10 text-white font-semibold'
                      : 'border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  {m} month{m > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/50 text-xs">
              Resume date: <span className="text-white/80 font-medium">{resumeStr}</span>
            </p>
          </div>

          <button
            onClick={handlePause}
            disabled={submitting}
            className="w-full min-h-[48px] py-3 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-semibold text-sm transition-all disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : (
              `Pause for ${duration} month${duration > 1 ? 's' : ''}`
            )}
          </button>

          <div className="mt-4 text-center">
            <Link href="/subscription" className="inline-flex items-center gap-1 text-white/40 hover:text-white text-sm">
              <ArrowLeft className="w-3 h-3" /> Back
            </Link>
          </div>
        </m.div>
      </div>
    </main>
  )
}
