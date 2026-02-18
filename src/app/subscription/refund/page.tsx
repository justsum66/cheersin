'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { RotateCcw, AlertTriangle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'

/** PAY-015: Refund request flow with form submission */
export default function RefundRequestPage() {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/subscription/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      })
      if (res.ok) {
        setSubmitted(true)
        toast.success('Refund request submitted')
      } else {
        const data = await res.json()
        toast.error(data.error?.message ?? 'Failed to submit request')
      }
    } catch {
      toast.error('Network error, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-wine-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <BrandLogo variant="compact" href="/" size={36} />
          </Link>
        </div>

        {submitted ? (
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Request Submitted</h1>
            <p className="text-white/60 text-sm mb-6">
              We&apos;ll review your refund request within 3 business days and notify you by email.
            </p>
            <Link href="/subscription" className="btn-primary block w-full min-h-[48px] py-3 rounded-xl font-semibold text-center">
              Back to Subscription
            </Link>
          </m.div>
        ) : (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-yellow-400" aria-hidden />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Request a Refund</h1>
                <p className="text-white/50 text-sm">7-day money-back guarantee</p>
              </div>
            </div>

            <div className="mb-6 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden />
              <p className="text-white/70 text-xs">
                Refund requests are processed within 7 days of subscription start. 
                After approval, your account will be downgraded to the free plan.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="block mb-2">
                <span className="text-white/70 text-sm font-medium">Reason for refund</span>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  rows={4}
                  maxLength={500}
                  placeholder="Please tell us why you'd like a refund..."
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>
              <p className="text-white/30 text-xs mb-4 text-right">{reason.length}/500</p>

              <button
                type="submit"
                disabled={!reason.trim() || submitting}
                className="w-full min-h-[48px] py-3 rounded-xl bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 font-semibold text-sm transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  'Submit Refund Request'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/subscription" className="inline-flex items-center gap-1 text-white/40 hover:text-white text-sm">
                <ArrowLeft className="w-3 h-3" /> Back
              </Link>
            </div>
          </m.div>
        )}
      </div>
    </main>
  )
}
