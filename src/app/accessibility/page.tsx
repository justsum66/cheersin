import Link from 'next/link'
import { Accessibility, ArrowLeft } from 'lucide-react'

/** E82 P2：無障礙聲明頁 — Footer 連結；載明 WCAG 2.1 AA 目標，合規可查 */
export default function AccessibilityPage() {
  return (
    <main className="min-h-screen px-4 py-12 md:py-16 max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首頁
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Accessibility className="w-8 h-8 text-primary-400" aria-hidden />
        <h1 className="text-2xl font-display font-bold text-white">無障礙聲明</h1>
      </div>
      <p className="text-white/60 text-sm mb-8">
        最後更新：2026-02。Cheersin 致力於讓所有用戶都能順利使用我們的服務，包含品酒測驗、派對遊戲與學習功能。
      </p>

      <section className="space-y-6 text-white/80 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">符合等級</h2>
          <p>
            我們以 <strong>WCAG 2.1 等級 AA</strong> 為目標，進行設計與開發。關鍵頁面（首頁、靈魂酒測、定價、派對遊樂場、登入）透過 axe-core 與 Lighthouse 無障礙檢驗，目標無 critical 違規、Lighthouse 無障礙分數 ≥90。
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">已實作項目</h2>
          <ul className="list-disc list-inside space-y-1 text-white/70">
            <li>跳至主內容（Skip link）</li>
            <li>表單標籤、錯誤訊息朗讀友善（aria-label、role=&quot;alert&quot;）</li>
            <li>按鈕與連結觸控區域 ≥44px、焦點環（:focus-visible）</li>
            <li>測驗進度條、彈窗具備適當 ARIA 屬性</li>
            <li>對比度與字級符合可讀性需求</li>
            <li>動畫尊重 prefers-reduced-motion（globals.css、framer-motion 元件）</li>
            <li>即時狀態變更使用 aria-live（派對房、劇本殺）</li>
            <li>錯誤邊界 fallback 具 role=alert，可讀</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">回饋與改善</h2>
          <p>
            若您在使用時遇到無障礙相關問題，歡迎透過{' '}
            <a href="mailto:hello@cheersin.app" className="text-primary-400 hover:text-primary-300 underline">
              hello@cheersin.app
            </a>{' '}
            聯絡我們，我們會盡力改善。
          </p>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-white/10">
        <Link href="/" className="text-primary-400 hover:text-primary-300 text-sm">
          返回首頁
        </Link>
      </div>
    </main>
  )
}
