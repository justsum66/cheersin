import Link from 'next/link'

/** EXPERT_60 P2：404 友善化 — 返回首頁 + 熱門連結（Quiz、Games、Pricing） */
export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)' }}
    >
      <h1 className="home-heading-2 font-display font-bold mb-2">
        <span className="gradient-text">404</span>
      </h1>
      <p className="home-text-muted mb-6">找不到此頁面</p>
      <Link href="/" className="btn-primary mb-6">
        返回首頁
      </Link>
      <p className="text-white/50 text-sm mb-3">熱門連結</p>
      <nav className="flex flex-wrap justify-center gap-3" aria-label="熱門連結">
        <Link href="/quiz" className="btn-ghost min-h-[48px] inline-flex items-center justify-center text-sm">
          靈魂酒測
        </Link>
        <Link href="/games" className="btn-ghost min-h-[48px] inline-flex items-center justify-center text-sm">
          派對遊樂場
        </Link>
        <Link href="/pricing" className="btn-ghost min-h-[48px] inline-flex items-center justify-center text-sm">
          方案定價
        </Link>
      </nav>
    </div>
  )
}
