/**
 * P3-464：品牌故事頁 — 關於我們、使命與團隊
 */
import Link from 'next/link'

export const metadata = {
  title: '關於我們 | Cheersin 派對助手',
  description: 'Cheersin 的使命：讓每次聚會都更有趣，用 AI 與遊戲連結人與人。',
}

export default function AboutPage() {
  return (
    <main className="page-container-mobile min-h-screen bg-background py-8">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="mb-6 text-2xl font-bold text-foreground">關於 Cheersin</h1>
        <p className="mb-4 text-foreground/90">
          Cheersin 致力於成為亞洲第一的 AI 酒類與派對體驗 SaaS。我們結合品酒知識、派對遊戲與 AI
          助理，讓每一次聚會都更盡興。
        </p>
        <p className="mb-4 text-foreground/90">
          無論是線上同樂、線下酒局，還是想學品酒，Cheersin 都能陪你一起舉杯。
        </p>
        <p className="mb-8 text-foreground/80 text-sm">
          產品持續進化中：派對直播房、酒局劇本殺、AI 派對 DJ 等殺手功能即將登場。
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          回首頁
        </Link>
      </div>
    </main>
  )
}
