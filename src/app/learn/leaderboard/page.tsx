/**
 * P3-429：學習排行榜 — 展示學習時長、完成課程數等（目前為佔位，可接 chapter_progress 彙總）
 */
import Link from 'next/link'
import { Trophy } from 'lucide-react'

export const metadata = {
  title: '學習排行榜 | Cheersin 品酒學院',
  description: '看看誰最認真學習品酒，一起加油！',
}

export default function LearnLeaderboardPage() {
  return (
    <main className="page-container-mobile min-h-[50vh] py-8">
      <div className="mx-auto max-w-lg px-4">
        <div className="flex items-center gap-3 text-primary-400 mb-6">
          <Trophy className="w-10 h-10" aria-hidden />
          <h1 className="text-xl font-bold text-foreground">學習排行榜</h1>
        </div>
        <p className="text-foreground/80 text-sm mb-6">
          依完成章節數、學習時長排名，即將上線。完成課程即可累積進度。
        </p>
        <div className="rounded-xl bg-muted/50 border border-border p-6 text-center text-muted-foreground text-sm">
          排行榜資料準備中，敬請期待。
        </div>
        <Link
          href="/learn"
          className="mt-6 inline-block text-primary hover:underline text-sm"
        >
          ← 返回品酒學院
        </Link>
      </div>
    </main>
  )
}
