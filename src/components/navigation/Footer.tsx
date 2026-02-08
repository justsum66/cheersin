'use client'

/** P1-053：Footer — 網站地圖、社交連結、語系切換、版權；i18n 六語系 */
import Link from 'next/link'
import { useTranslation } from '@/contexts/I18nContext'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher'

export function Footer() {
  const year = new Date().getFullYear()
  const { t } = useTranslation()

  const productLinks = [
    { href: '/quiz', label: t('nav.quiz') },
    { href: '/games', label: t('nav.games') },
    { href: '/assistant', label: t('nav.assistant') },
    { href: '/learn', label: t('nav.learn') },
  ]
  const companyLinks = [
    { href: '/pricing', label: t('nav.pricing') },
    { href: '/privacy', label: t('footer.privacy') },
    { href: '/terms', label: t('footer.terms') },
  ]

  return (
    <footer className="border-t border-white/10 bg-white/[0.02] py-10 md:py-14 safe-area-pb" role="contentinfo">
      <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">{t('footer.sectionProduct')}</h3>
            <ul className="space-y-2">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/60 hover:text-white text-sm transition-colors min-h-[44px] flex items-center">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">{t('footer.sectionCompany')}</h3>
            <ul className="space-y-2">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/60 hover:text-white text-sm transition-colors min-h-[44px] flex items-center">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-2">{t('footer.sectionLanguage')}</h3>
            <LocaleSwitcher />
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-sm text-center sm:text-left">{t('footer.copyright').replace('©', `© ${year} `)}</p>
          <p className="text-white/40 text-xs">飲酒過量有害健康</p>
        </div>
      </div>
    </footer>
  )
}
