'use client'

import Link from 'next/link'
import { Receipt, ArrowLeft } from 'lucide-react'

/** P1-256：退款政策頁面 — 付費前讓用戶了解權益，降低付費焦慮 */
export default function RefundPolicyPage() {
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
        <Receipt className="w-8 h-8 text-primary-400" aria-hidden />
        <h1 className="text-3xl font-display font-bold text-white">退款政策</h1>
      </div>
      <p className="text-white/60 text-sm mb-8">
        最後更新：2026-02。Cheersin 致力於讓您安心訂閱，以下說明退款與取消權益。
      </p>
      <p className="text-white/50 text-xs mb-6 print:block" role="note">
        本頁可列印或另存為 PDF 留存（瀏覽器：列印 → 另存為 PDF）。
      </p>

      <section className="space-y-6 text-white/80 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">取消訂閱</h2>
          <p>
            您可隨時於「訂閱管理」或「取消訂閱」頁面取消方案。取消後當期結束前仍可繼續使用，當期結束後不再扣款，無需理由。
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">退款資格</h2>
          <ul className="list-disc list-inside space-y-1 text-white/70">
            <li>訂閱後 <strong>7 日內</strong>且未實質使用付費功能（如無限 AI 對話、進階課程解鎖、辣味遊戲）者，可申請全額退款。</li>
            <li>首月內不滿意亦可申請全額退款，無需理由。</li>
            <li>試用期結束前取消則不扣款。</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">申請方式</h2>
          <p>
            請透過訂閱管理頁面之「聯絡我們」或寄信至{' '}
            <a href="mailto:support@cheersin.app" className="text-primary-400 hover:text-primary-300 underline">support@cheersin.app</a>
            ，註明訂閱帳號與退款原因。我們將於 <strong>5–10 個工作天</strong>內處理並回覆。
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">其他說明</h2>
          <p>
            促銷方案（如首月半價、年繳優惠）之扣款日與金額以訂閱流程與訂閱管理頁面為準。重複訂閱後短期內多次取消或爭議，我們得依個案認定不予退款或限制權益，詳見服務條款。
          </p>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/pricing" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium">
          查看方案
        </Link>
        <Link href="/terms#refund" className="btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium">
          服務條款（訂閱與退款）
        </Link>
      </div>
    </main>
  )
}
