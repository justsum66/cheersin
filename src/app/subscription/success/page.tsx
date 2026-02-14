'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { m } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, XCircle, Sparkles, Bot, Loader2 } from 'lucide-react';
import { WineGlassLoading } from '@/components/ui/WineGlassLoading';
import { setStoredTier } from '@/lib/subscription';
import { clearCancelledAt } from '@/lib/subscription-retention';
import { fireFullscreenConfetti } from '@/lib/celebration';
import type { SubscriptionTier } from '@/lib/subscription';
import { COPY_CTA_START_QUIZ } from '@/config/copy.config';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const subscriptionId = searchParams.get('subscription_id');
  const planType = searchParams.get('planType') as SubscriptionTier | null;

  useEffect(() => {
    if (subscriptionId) {
      captureSubscription();
    } else {
      if (planType === 'basic' || planType === 'premium') setStoredTier(planType);
      setTimeout(() => setStatus('success'), 1500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- captureSubscription defined below, run once when subscriptionId/planType set
  }, [subscriptionId, planType]);

  /** P3 挽留：訂閱成功後清除取消標記，不再顯示重新訂閱 CTA */
  useEffect(() => {
    if (status === 'success') clearCancelledAt();
  }, [status]);

  const captureSubscription = async () => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture-subscription',
          subscriptionId,
        }),
      });

      const data = await response.json();

      if (data.status === 'ACTIVE' || response.ok) {
        const tier = planType === 'basic' || planType === 'premium' ? planType : 'basic';
        setStoredTier(tier, data.startTime ?? undefined);
        /** P3-54：優先使用 API 回傳的 current_period_end，否則用 startTime + 1 月 */
        if (data.current_period_end && /^\d{4}-\d{2}-\d{2}$/.test(data.current_period_end)) {
          setNextBillingDate(data.current_period_end);
        } else if (data.startTime) {
          try {
            const next = new Date(data.startTime);
            next.setMonth(next.getMonth() + 1);
            setNextBillingDate(next.toISOString().slice(0, 10));
          } catch {
            setNextBillingDate(null);
          }
        }
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      if (planType === 'basic' || planType === 'premium') setStoredTier(planType);
      setStatus('success');
      try {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'subscription_capture_error', value: 1, id: 'client' }),
        }).catch(() => {});
      } catch { /* noop */ }
    }
  };

  /** R2-064：訂閱成功時全螢幕慶祝 confetti */
  useEffect(() => {
    if (status !== 'success') return;
    fireFullscreenConfetti().catch(() => {});
  }, [status]);

  /** E24：訂閱成功時送 analytics */
  useEffect(() => {
    if (status !== 'success') return;
    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'subscription_success', value: 1, id: planType ?? 'unknown' }),
      }).catch(() => {});
    } catch { /* noop */ }
  }, [status, planType]);

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-3xl p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {status === 'loading' && (
          <>
            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <WineGlassLoading show inline />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">處理中...</h1>
            <p className="text-white/60">正在確認您的訂閱</p>
          </>
        )}

        {status === 'success' && (
          <>
            <m.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </m.div>
            
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="home-heading-2 text-white mb-2 font-display font-bold">訂閱成功</h1>
              <p className="home-text-muted home-body mb-2 text-balance">
                您已訂閱 {planType === 'premium' ? 'VIP' : 'Pro'}，現在開始享受所有專屬功能。
              </p>
              {nextBillingDate && (
                <p className="text-white/60 text-sm mb-8">
                  下次扣款日：<m.span initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.25 }} className="font-medium text-white/80">{nextBillingDate}</m.span>
                </p>
              )}
              {!nextBillingDate && (
                <p className="text-white/60 text-sm mb-8">下次扣款日請至訂閱管理查看</p>
              )}
            </m.div>

            {/* P0：單一主 CTA「開始測驗」，次要改為 btn-secondary 或文字連結 */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Link
                href="/quiz"
                className="btn-primary flex items-center justify-center gap-2 w-full min-h-[48px] py-4 text-lg rounded-2xl font-semibold games-focus-ring"
              >
                <Sparkles className="w-5 h-5" aria-hidden />
                {COPY_CTA_START_QUIZ}
              </Link>
              <Link
                href="/profile"
                className="btn-secondary flex items-center justify-center gap-2 w-full min-h-[48px] py-4 rounded-2xl font-medium games-focus-ring"
              >
                前往個人頁
              </Link>
              <Link
                href="/assistant"
                className="btn-ghost flex items-center justify-center gap-2 w-full min-h-[48px] py-4 rounded-2xl font-medium games-focus-ring text-white/70 hover:text-white"
              >
                <Bot className="w-5 h-5" aria-hidden />
                諮詢 AI 品酒師
              </Link>
              {/* T096 P1：誤觸訂閱補救 — 取消入口極明顯 */}
              <Link
                href="/subscription"
                className="block w-full min-h-[48px] py-3 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm font-medium text-center transition-colors games-focus-ring"
              >
                弄錯了？立即取消
              </Link>
              <Link
                href="/"
                className="block min-h-[48px] inline-flex items-center justify-center text-white/50 hover:text-white text-sm mt-4 transition-colors home-footer-link games-focus-ring rounded-lg"
              >
                返回首頁
              </Link>
              {/* E94 P2：回饋／NPS 預留 — 可連 Typeform/Google Form 或 mailto */}
              <a
                href="mailto:hello@cheersin.app?subject=訂閱回饋"
                className="block text-white/50 hover:text-white text-sm mt-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a] rounded-lg"
              >
                給我們回饋
              </a>
              {/* E33：訂閱 Basic 成功後輕量 upsell — 年繳省更多、升級 VIP，不遮擋主要資訊 */}
              {planType === 'basic' && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-white/70 text-sm mb-2">更多優惠</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/pricing?billing=yearly" className="text-primary-400 hover:text-primary-300 text-sm font-medium underline underline-offset-1">
                      年繳省更多
                    </Link>
                    <Link href="/pricing#plans" className="text-accent-400 hover:text-accent-300 text-sm font-medium underline underline-offset-1">
                      升級 VIP
                    </Link>
                  </div>
                </div>
              )}
              {/* T025/T046/T089：訂閱成功頁再次顯示取消與退款，減少爭議 */}
              <p className="text-white/40 text-xs mt-6" role="note">
                下次扣款日與金額可於{' '}
                <Link href="/subscription" className="text-primary-400 hover:text-primary-300 underline underline-offset-1">
                  訂閱管理
                </Link>
                {' '}查看。隨時可取消，當期結束後不再扣款；7 日內未使用可申請全額退款，詳見{' '}
                <Link href="/terms" className="text-primary-400 hover:text-primary-300 underline underline-offset-1">
                  服務條款
                </Link>。
              </p>
            </m.div>

            {/* Confetti effect */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(12)].map((_, i) => (
                <m.div
                  key={i}
                  initial={{ 
                    y: -20, 
                    x: Math.random() * 300 - 150,
                    opacity: 1,
                    rotate: 0
                  }}
                  animate={{ 
                    y: 400, 
                    opacity: 0,
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    delay: 0.3 + i * 0.1,
                    ease: "easeOut"
                  }}
                  className={`absolute top-0 left-1/2 w-3 h-3 rounded-sm ${
                    ['bg-orange-500', 'bg-pink-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500'][i % 5]
                  }`}
                />
              ))}
            </m.div>
          </>
        )}

        {status === 'error' && (
          <>
            <m.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-10 h-10 text-red-500" />
            </m.div>
            
            <h1 className="text-2xl font-bold text-white mb-2">訂閱處理失敗</h1>
            <p className="text-white/60 mb-8">
              很抱歉，訂閱過程中發生錯誤。<br />
              請稍後再試或聯繫客服。
            </p>

            <div className="space-y-3">
              <Link
                href="/subscription"
                className="block w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl font-semibold transition-all"
              >
                重新嘗試
              </Link>
              <Link
                href="/"
                className="block text-white/50 hover:text-white text-sm transition-colors"
              >
                返回首頁
              </Link>
            </div>
          </>
        )}
      </div>
    </m.div>
  );
}

function LoadingFallback() {
  return (
    <div className="glass rounded-3xl p-12 max-w-md w-full text-center">
      <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-orange-500" />
      <p className="text-white/60">載入中...</p>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-0 pb-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
