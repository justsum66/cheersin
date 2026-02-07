'use client'

/** P1-053：Footer — 網站地圖、社交連結、聯繫方式、版權 */
import Link from 'next/link'

const FOOTER_LINKS = {
  product: [
    { href: '/quiz', label: '靈魂酒測' },
    { href: '/games', label: '派對遊樂場' },
    { href: '/assistant', label: 'AI 侍酒師' },
    { href: '/learn', label: '品酒學院' },
  ],
  company: [
    { href: '/pricing', label: '方案定價' },
    { href: '/privacy', label: '隱私權政策' },
    { href: '/terms', label: '服務條款' },
  ],
} as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-white/[0.02] py-10 md:py-14" role="contentinfo">
      <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">產品</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.product.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">公司</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/60 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm">© {year} Cheersin. 未滿 18 歲請勿飲酒。</p>
          <p className="text-white/40 text-xs">飲酒過量有害健康</p>
        </div>
      </div>
    </footer>
  )
}
