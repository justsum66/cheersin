'use client'

import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'

/** T171 P1：隱私政策載明不向未成年行銷，反酒精倡議者與合規 */
export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-12 md:py-16 max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首頁
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-primary-400" aria-hidden />
        <h1 className="text-3xl font-display font-bold text-white">隱私政策</h1>
      </div>
      <p className="text-white/60 text-sm mb-8">
        最後更新：2026-02。Cheersin 重視您的隱私，本政策說明我們如何收集、使用與保護您的資料。
      </p>
      {/* T020 P2：隱私政策可下載、列印友善 */}
      <p className="text-white/50 text-xs mb-6 print:block" role="note">
        本頁可列印或另存為 PDF 留存（瀏覽器：列印 → 另存為 PDF）。
      </p>

      <section className="space-y-6 text-white/80 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">資料收集與使用</h2>
          <p>
            我們收集的資料用於提供品酒測驗、AI 侍酒師、派對遊戲與學習服務。包含帳號資訊、測驗結果、使用紀錄等，僅用於服務優化與個人化推薦。
          </p>
        </div>

        <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
          <h2 className="text-lg font-semibold text-white mb-2">不向未滿 18 歲行銷（T171）</h2>
          <p className="mb-2">
            Cheersin 為成人品酒與派對遊戲服務。我們承諾：
          </p>
          <ul className="list-disc list-inside space-y-1 text-white/70">
            <li>不向未滿 18 歲之使用者進行行銷或推廣酒類相關內容</li>
            <li>不收集未成年個人資料用於行銷目的</li>
            <li>年齡門檻與驗證說明見服務條款；未滿 18 歲不得使用本服務</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Cookie 與類似技術</h2>
          <p>
            我們使用 Cookie 與本地儲存以維持登入狀態、記住偏好設定與遊戲進度。必要 Cookie 為服務運作所必須；分析類 Cookie 僅用於匿名統計以改善產品。您可於瀏覽器設定中管理或刪除 Cookie，惟關閉必要 Cookie 可能影響登入與部分功能。
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">資料處理方式與第三方服務</h2>
          <p>
            我們使用下列第三方服務處理或儲存資料，其各有自身隱私政策：Supabase（資料庫與認證）、PayPal（付款，我們不儲存完整信用卡號）、Vercel（主機）、Sentry（錯誤追蹤）、OpenRouter/AI 供應商（AI 侍酒師對話）。測驗結果、學習進度、遊戲紀錄等用於提供服務與個人化推薦，不會出售給第三方。
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">資料保留期限</h2>
          <p>
            帳號與使用資料在您使用期間持續保留。若您刪除帳號，我們將於 30 日內刪除或匿名化個人資料；依法須保留之紀錄（如交易）依法律規定期限保留。
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">刪除請求與資料匯出</h2>
          <p>
            您可於帳戶設定內申請刪除帳號或匯出個人資料。刪除後將無法復原。若需協助請至{' '}
            <a href="mailto:privacy@cheersin.app" className="text-primary-400 hover:text-primary-300 underline">privacy@cheersin.app</a>
            。我們將於合理期限內（通常 30 日內）處理您的請求。
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">資料保護與安全</h2>
          <p>
            我們採用業界標準保護您的資料（加密傳輸、存取控管）。您可於帳戶內申請刪除個人資料或匯出資料，詳見帳戶設定或聯絡客服。
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">聯絡我們</h2>
          <p>
            若對隱私政策有疑問，請至{' '}
            <a href="mailto:privacy@cheersin.app" className="text-primary-400 hover:text-primary-300 underline">
              privacy@cheersin.app
            </a>
            。
          </p>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-white/10">
        <Link href="/terms" className="text-primary-400 hover:text-primary-300 text-sm">
          服務條款
        </Link>
      </div>
    </main>
  )
}
