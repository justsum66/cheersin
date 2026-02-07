'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { BrandLogo } from '@/components/BrandLogo';
import { PayPalButton } from '@/components/PayPalButton';
import { getErrorMessage } from '@/lib/api-response';
import ResubscribeBanner from '@/components/ResubscribeBanner';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
}

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan'); // D1：從定價頁帶入 basic | premium
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoValid, setPromoValid] = useState<boolean | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);
  const planRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchPlans();
  }, []);

  /** D1：定價頁帶 plan 時，載入後捲至對應方案卡片 */
  useEffect(() => {
    if (loading || !planParam || plans.length === 0) return;
    const el = planRefs.current[planParam];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, planParam, plans.length]);

  /** E53：訂閱 API 逾時 30s；失敗時顯示「請稍後再試」 */
  const fetchPlans = async () => {
    try {
      const response = await fetchWithTimeout('/api/subscription', { timeoutMs: 30000 });
      if (response.status === 503) {
        setPlans([]);
        toast.error('訂閱服務暫不可用，請稍後再試或聯繫客服。');
        try {
          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'subscription_error', value: 1, id: '503' }),
          }).catch(() => {});
        } catch { /* noop */ }
        setLoading(false);
        return;
      }
      /** E79 P2：429 時顯示「請稍後再試」，不重試過頻 */
      if (response.status === 429) {
        toast.error('請求過於頻繁，請稍後再試。');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setPlans(data.plans ?? []);
    } catch (error) {
      try {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'subscription_error', value: 1, id: 'fetch_failed' }),
        }).catch(() => {});
      } catch { /* noop */ }
      toast.error('無法載入方案，請稍後再試。', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-wine-950 pt-0 pb-20 px-4">
      <ResubscribeBanner />
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <Link href="/" className="inline-block mb-8">
          <BrandLogo variant="compact" href="/" size={36} />
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-white mb-4"
        >
          升級品酒體驗
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-white/50"
        >
          解鎖完整功能，依方案選擇
        </motion.p>
      </div>

      {/* E41：優惠碼輸入欄；使用規則載明於 FAQ */}
      <div className="max-w-sm mx-auto mb-6 flex gap-2">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => { setPromoCode(e.target.value.trim().toUpperCase()); setPromoValid(null); }}
          placeholder="優惠碼（選填）"
          autoComplete="off"
          className="flex-1 min-h-[44px] rounded-xl bg-white/5 border border-white/10 px-4 text-white placeholder-white/40 text-sm"
          aria-label="優惠碼"
        />
        <button
          type="button"
          onClick={async () => {
            if (!promoCode) return;
            setPromoChecking(true);
            setPromoValid(null);
            try {
              const res = await fetch('/api/subscription/promo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: promoCode }) });
              if (res.status === 429) {
                toast.error('請稍後再試');
                setPromoValid(false);
                setPromoChecking(false);
                return;
              }
              const data = await res.json();
              setPromoValid(data.valid === true);
              if (data.valid) toast.success(data.discountPercent ? `已套用 ${data.discountPercent}% 折扣` : '優惠碼有效');
              else toast.error(getErrorMessage(data) || '優惠碼無效或已過期');
            } catch {
              setPromoValid(false);
              toast.error('驗證失敗，請稍後再試');
            } finally {
              setPromoChecking(false);
            }
          }}
          disabled={!promoCode || promoChecking}
          aria-busy={promoChecking}
          aria-label={promoChecking ? '驗證優惠碼中' : '套用優惠碼'}
          className="min-h-[44px] px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium disabled:opacity-50"
        >
          {promoChecking ? '驗證中…' : '套用'}
        </button>
      </div>

      {/* E12/E15：訂閱流程可見服務條款與退款；促銷說明（首月半價、年繳買10送2） */}
      <p className="text-center text-white/50 text-sm mb-6">
        首月半價、年繳買 10 送 2 等促銷詳見{' '}
        <Link href="/terms#refund" className="text-primary-400 hover:text-primary-300 underline">服務條款</Link>
        {' '}與{' '}
        <Link href="/pricing" className="text-primary-400 hover:text-primary-300 underline">定價頁</Link>。
      </p>

      {/* Plans */}
      <div className="max-w-5xl xl:max-w-[1440px] mx-auto">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                ref={(el) => { planRefs.current[plan.id] = el; }}
                data-plan={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-2 border-primary-500' 
                    : 'glass border border-white/10'
                } ${planParam === plan.id ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-transparent' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      最受歡迎
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">NT${plan.price}</span>
                    <span className="text-gray-400">/{plan.interval}</span>
                  </div>
                  {/* E17：結帳前顯示將扣款金額與幣別 */}
                  <p className="text-white/50 text-sm mt-2">確認後將扣款 NT${plan.price}/{plan.interval}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* UX_LAYOUT_200 #132：付款按鈕信任感（鎖/安全） */}
                <p className="flex items-center justify-center gap-1.5 text-white/50 text-xs mb-3" aria-hidden>
                  <Lock className="w-3.5 h-3.5" />
                  安全付款 · 由 PayPal 處理
                </p>
                <PayPalButton
                  planId={plan.id}
                  planName={plan.name}
                  loading={processingPlan === plan.id}
                  disabled={processingPlan !== null}
                  onStart={() => setProcessingPlan(plan.id)}
                  onError={(msg) => {
                    toast.error(msg || '訂閱建立失敗，請稍後再試或聯繫客服。', { duration: 5000 });
                    setProcessingPlan(null);
                  }}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 min-h-[48px] ${
                    plan.popular
                      ? 'btn-primary shadow-lg shadow-primary-500/30'
                      : 'btn-secondary'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processingPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      處理中…
                    </span>
                  ) : (
                    '立即訂閱'
                  )}
                </PayPalButton>
              </motion.div>
            ))}
          </div>
        )}

        {/* E18：試用結束前提醒 — 請至訂閱管理查看下次扣款日 */}
        <p className="text-center text-white/50 text-sm mt-6">試用用戶：試用結束前請至訂閱管理查看下次扣款日，屆時將自動扣款。若要取消請於扣款前至訂閱管理操作。</p>
        {/* E19：付款方式說明 — PayPal，管理請至 PayPal 帳戶 */}
        <p className="text-center text-white/50 text-sm mt-2">付款方式：PayPal。管理付款方式請至您的 PayPal 帳戶。</p>

        {/* T047：取消訂閱入口明顯 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-8 text-center"
        >
          <Link
            href="/subscription/cancel"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium"
          >
            已訂閱？取消訂閱請點此
          </Link>
        </motion.div>

        {/* Free tier */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">
            還不確定？先免費體驗基礎功能
          </p>
          <Link 
            href="/quiz"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 font-medium"
          >
            免費測驗你的靈魂酒款
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="home-heading-2 font-bold text-white text-center mb-8">常見問題</h2>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              {
                q: '可以隨時取消訂閱嗎？',
                a: '當然！你可以隨時在帳戶設定中取消訂閱，取消後仍可使用到當期結束。',
              },
              {
                q: '支援哪些付款方式？',
                a: '目前支援 PayPal 付款，包含信用卡、簽帳金融卡等多種方式。',
              },
              {
                q: '有退款政策嗎？',
                a: '訂閱後 7 天內如不滿意，可申請全額退款。',
              },
              {
                q: 'AI 品酒師有使用限制嗎？',
                a: 'Basic 方案每月 20 次諮詢，Premium 方案則無限制使用。',
              },
            ].map((faq, i) => (
              <div key={i} className="glass rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Security badge */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          採用 PayPal 安全加密付款
        </div>
      </div>
    </main>
  );
}
