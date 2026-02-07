'use client'

import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

/** T024 P2：免責與責任限制、爭議解決寫清；T046 P2：訂閱與取消、退款政策在條款寫清 */
export default function TermsPage() {
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
        <FileText className="w-8 h-8 text-primary-400" aria-hidden />
        <h1 className="text-3xl font-display font-bold text-white">服務條款</h1>
      </div>
      <p className="text-white/60 text-sm mb-8">
        最後更新：2026-02。使用 Cheersin 即表示您同意以下條款。
      </p>
      {/* T020 P2：條款可下載、列印友善 — 瀏覽器列印或另存為 PDF 即可 */}
      <p className="text-white/50 text-xs mb-6 print:block" role="note">
        本頁可列印或另存為 PDF 留存（瀏覽器：列印 → 另存為 PDF）。
      </p>

      <section className="space-y-8 text-white/80 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">一、服務說明與年齡限制</h2>
          <p>
            Cheersin 提供品酒測驗、AI 侍酒師、派對遊戲與品酒學習服務。本服務僅供年滿 18 歲之成人使用，未滿 18 歲不得使用。年齡驗證於首次進入相關頁面時進行。
          </p>
        </div>

        <div id="refund">
          <h2 className="text-lg font-semibold text-white mb-2">二、訂閱、取消與退款（T046）</h2>
          <ul className="list-disc list-inside space-y-2 text-white/80">
            <li><strong>取消方式</strong>：您可隨時於帳戶內「訂閱管理」或「取消訂閱」頁面取消方案。取消後當期結束前仍可繼續使用，當期結束後不再扣款。</li>
            <li><strong>退款政策</strong>：訂閱後 7 日內且未實質使用付費功能（如無限 AI 對話、進階課程解鎖）者，可申請全額退款。首月內不滿意亦可申請全額退款，無需理由。退款請透過客服或訂閱管理頁面提出，我們將於 5–10 個工作天內處理。</li>
            <li><strong>首月半價、年繳買 10 送 2</strong>：首月半價適用於首次訂閱之當月；年繳方案為一次付 10 個月費用、享 12 個月使用（相當於 2 個月免費）。實際扣款日與金額以訂閱流程與訂閱管理頁面為準；試用期結束前取消則不扣款。</li>
            <li>促銷與試用（如 7 天試用）之扣款日與金額將於訂閱流程與訂閱管理頁面載明。</li>
            <li><strong>濫用與重複爭議（T097）</strong>：重複訂閱後短期內多次取消或爭議，我們得依個案認定不予退款或限制權益；客服 SOP 對齊本條款。</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <h2 className="text-lg font-semibold text-white mb-2">三、免責聲明（T024）</h2>
          <p className="mb-2">
            本服務所提供之內容（含測驗結果、AI 推薦、品酒知識與遊戲規則）僅供娛樂與參考，<strong>不構成醫療、法律、營養或專業品酒建議</strong>。飲酒請遵守當地法規，未滿 18 歲請勿飲酒，飲酒過量有害健康。
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">四、責任限制（T024）</h2>
          <p>
            在法律允許之範圍內，Cheersin 及其合作方對於因使用或無法使用本服務所生之間接、衍生、懲罰性或特別損害不負責任。我們對本服務之可用性、正確性與完整性不提供任何明示或默示保證，責任以您就本服務所支付之金額為上限（如有）。
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">五、爭議解決與管轄法律（T024）</h2>
          <p>
            因本條款或本服務所生之爭議，雙方同意先以善意協商解決。若無法於 30 日內達成合意，除法律另有強制規定外，以中華民國法律為準據法，並以台灣台北地方法院為第一審管轄法院。
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">六、禁止內容與違規後果（T078）</h2>
          <p className="mb-2">
            您不得利用本服務從事騷擾、仇恨言論、未經同意之廣告、違法內容或侵害他人權益之行為。我們禁止惡意灌水、假檢舉、機器人濫用與未授權之商業利用。違規者我們得予以警告、暫停或永久終止帳號，並保留法律追訴權。檢舉管道見各產品內「檢舉」入口或客服信箱。
          </p>
          <a href="mailto:hello@cheersin.app?subject=檢舉或申訴" className="text-primary-400 hover:text-primary-300 text-sm underline">檢舉／申訴聯絡</a>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">七、著作權與禁止重製（T081）</h2>
          <p>
            本服務之內容（含測驗題目、遊戲規則、介面設計、文案與圖像）為 Cheersin 或授權方所有，受著作權法保護。未經我們書面同意，禁止重製、改作、散布、公開傳輸或為商業使用。若您認為本平台上有侵害您著作權之內容，請依申訴管道聯絡我們，我們將依法律程序處理（含移除與回應權利人）。
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">八、條款變更</h2>
          <p>
            我們得隨時修訂本條款，修訂後將於網站公布並註明最後更新日期。若您於修訂後繼續使用本服務，即視為同意新條款。重大變更時我們將以 email 或站內通知提醒。
          </p>
        </div>

        {/* E22/E89：個人/商業使用與企業方案報價流程 */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">九、個人與商業使用與企業方案報價</h2>
          <p className="mb-2">
            本服務方案供個人與小型活動使用；直播、個人頻道歡迎。商業授權或企業／團體需求（如大量帳號、客製方案）請聯絡我們：
          </p>
          <a href="mailto:enterprise@cheersin.app?subject=企業/團體方案" className="text-primary-400 hover:text-primary-300 underline">enterprise@cheersin.app</a>
          <p className="mt-2 text-white/70 text-xs">
            企業方案報價流程：來信後 2–3 個工作天內回覆，依需求提供報價與合約；報價以書面為準。定價頁「團隊方案」為同一入口。
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-2">聯絡我們</h2>
          <p>
            條款或訂閱相關問題請至{' '}
            <a href="mailto:hello@cheersin.app" className="text-primary-400 hover:text-primary-300 underline">
              hello@cheersin.app
            </a>
            ，或於訂閱管理頁面聯繫客服。
          </p>
        </div>
      </section>

      <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-4">
        <Link href="/privacy" className="text-primary-400 hover:text-primary-300 text-sm">
          隱私政策
        </Link>
        <Link href="/pricing" className="text-primary-400 hover:text-primary-300 text-sm">
          方案定價
        </Link>
        <Link href="/subscription" className="text-primary-400 hover:text-primary-300 text-sm">
          訂閱管理
        </Link>
      </div>
    </main>
  )
}
