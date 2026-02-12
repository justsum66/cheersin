'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HelpCircle, Gift, RotateCcw } from 'lucide-react';
import { CANCELLED_AT_KEY } from '@/lib/subscription-retention';
import { useTranslation } from '@/contexts/I18nContext';

/** P3-55：取消頁顯示挽留窗至 current_period_end；I18N-06 */
export default function SubscriptionCancelPage() {
  const { t } = useTranslation()
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(CANCELLED_AT_KEY, Date.now().toString());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetch('/api/subscription', { method: 'GET', credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const end = data?.subscription?.current_period_end
        if (end && /^\d{4}-\d{2}-\d{2}$/.test(end)) setPeriodEnd(end)
      })
      .catch(() => {})
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-wine-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-12 max-w-md w-full text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
          <HelpCircle className="w-10 h-10 text-yellow-400" aria-hidden />
        </div>

        <h1 className="home-heading-2 font-display font-bold text-white mb-2" data-testid="cancel-page-heading">{t('subscription.cancelPageTitle')}</h1>
        <p className="text-white/90 text-sm mb-2" role="status">
          {periodEnd
            ? (t('subscription.cancelMessageWithDate') ?? '').replace(/\{\{date\}\}/g, periodEnd)
            : t('subscription.cancelMessageDefault')}
        </p>
        <p className="home-text-muted mb-2 max-w-[65ch] mx-auto">
          {t('subscription.comeBackAnytime')}
        </p>
        <p className="text-white/60 text-sm mb-6 max-w-[65ch] mx-auto">
          {t('subscription.checkManageLink')}{' '}
          <Link href="/subscription" className="text-primary-400 hover:text-primary-300 underline underline-offset-1">{t('subscription.manageLink')}</Link> {t('subscription.manageLinkSuffix')}
        </p>

        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 text-left" role="region" aria-label={t('subscription.loseRegionAria') ?? undefined}>
          <p className="text-sm text-white/80 font-medium mb-2">{t('subscription.loseTitle')}</p>
          <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
            <li>{t('subscription.loseItem1')}</li>
            <li>{t('subscription.loseItem2')}</li>
            <li>{t('subscription.loseItem3')}</li>
            <li>{t('subscription.loseItem4')}</li>
          </ul>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-left">
          <p className="text-sm text-white/90 font-medium flex items-center gap-2 mb-1">
            <RotateCcw className="w-4 h-4 text-primary-400 shrink-0" aria-hidden />
            {t('subscription.changeMind')}
          </p>
          <p className="text-xs text-white/60 mb-2">
            {t('subscription.retainOrResub')}
          </p>
          <p className="text-xs text-primary-300 font-medium">{t('subscription.retentionOffer')}</p>
        </div>

        <div className="space-y-3" role="group" aria-label={t('subscription.nextStepsAria') ?? undefined}>
          <Link href="/pricing" className="btn-primary block w-full text-center min-h-[48px] py-3 games-focus-ring rounded-xl font-semibold">
            {t('subscription.ctaRetain')}
          </Link>
          <Link href="/subscription" className="btn-secondary block w-full text-center min-h-[48px] games-focus-ring rounded-xl">
            {t('subscription.ctaManage')}
          </Link>
          <Link href="/" className="block w-full text-center py-3 min-h-[48px] inline-flex items-center justify-center text-sm text-white/60 hover:text-white font-medium transition-colors games-focus-ring rounded">
            {t('subscription.ctaHome')}
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-primary-500/10 rounded-xl border border-primary-500/30"
        >
          <p className="text-sm text-gray-300 flex items-center justify-center gap-2">
            <Gift className="w-4 h-4 text-primary-400 shrink-0" aria-hidden />
            {t('subscription.specialOffer')} <span className="text-primary-500 font-bold">{t('subscription.specialOfferDiscount')}</span> {t('subscription.specialOfferSuffix')}
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
