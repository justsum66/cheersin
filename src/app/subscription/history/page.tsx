'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { m } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Receipt, Download, CheckCircle, XCircle, Clock, Loader2, ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { useTranslation } from '@/contexts/I18nContext'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface PaymentRecord {
  id: string
  amount: number
  currency: string
  status: 'completed' | 'failed' | 'refunded' | 'pending'
  paid_at: string
  paypal_transaction_id: string
}

/** PAY-010: Payment history page for users */
export default function PaymentHistoryPage() {
  const { t } = useTranslation()
  const reducedMotion = usePrefersReducedMotion()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentRecord[]>([])

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/payments')
      if (!res.ok) {
        if (res.status === 401) {
          toast.error(t('subscription.signInRequired'))
          return
        }
        throw new Error('Failed to load')
      }
      const data = await res.json()
      setPayments(data.payments ?? [])
    } catch {
      toast.error(t('subscription.loadHistoryError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const totalSpent = useMemo(
    () => payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    [payments]
  )

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    completed: { icon: CheckCircle, color: 'text-green-400', label: t('subscription.statusCompleted') },
    failed: { icon: XCircle, color: 'text-red-400', label: t('subscription.statusFailed') },
    refunded: { icon: Receipt, color: 'text-yellow-400', label: t('subscription.statusRefunded') },
    pending: { icon: Clock, color: 'text-white/50', label: t('subscription.statusPending') },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-wine-950 pt-0 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <BrandLogo variant="compact" href="/" size={36} />
          </Link>
          <m.h1
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : undefined}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
          >
            {t('subscription.paymentHistory')}
          </m.h1>
          <p className="text-white/50">{t('subscription.viewTransactions')}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className={`w-8 h-8 text-primary-500 ${reducedMotion ? '' : 'animate-spin'}`} />
          </div>
        ) : payments.length === 0 ? (
          <m.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : undefined}
            className="text-center py-16"
          >
            <Receipt className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p className="text-white/50 text-lg mb-2">{t('subscription.noPayments')}</p>
            <p className="text-white/30 text-sm mb-6">{t('subscription.paymentsAppearAfterSubscribe')}</p>
            <Link href="/subscription" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl">
              {t('subscription.viewPlans')}
            </Link>
          </m.div>
        ) : (
          <>
            {/* Summary card */}
            <m.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : undefined}
              className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between flex-wrap gap-4"
            >
              <div>
                <p className="text-white/50 text-sm">{t('subscription.totalPayments')}</p>
                <p className="text-white text-2xl font-bold">{payments.length}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm">{t('subscription.totalSpent')}</p>
                <p className="text-white text-2xl font-bold">NT${totalSpent.toLocaleString()}</p>
              </div>
            </m.div>

            {/* Payment list */}
            <div className="space-y-3">
              {payments.map((payment, idx) => {
                const config = statusConfig[payment.status] ?? statusConfig.pending
                const StatusIcon = config.icon
                return (
                  <m.div
                    key={payment.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reducedMotion ? { duration: 0 } : { delay: idx * 0.03 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusIcon className={`w-5 h-5 flex-shrink-0 ${config.color}`} aria-hidden />
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium">
                          NT${payment.amount.toLocaleString()} {payment.currency}
                        </p>
                        <p className="text-white/40 text-xs truncate">
                          {new Date(payment.paid_at).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {payment.paypal_transaction_id && (
                            <> &middot; {payment.paypal_transaction_id.slice(0, 12)}...</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {payment.status === 'completed' && (
                        <a
                          href={`/api/subscription/invoice?id=${payment.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                          aria-label="Download invoice"
                        >
                          <Download className="w-3.5 h-3.5" /> Invoice
                        </a>
                      )}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/5 ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  </m.div>
                )
              })}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Link href="/subscription" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> {t('subscription.backToSubscription')}
          </Link>
        </div>
      </div>
    </main>
  )
}
