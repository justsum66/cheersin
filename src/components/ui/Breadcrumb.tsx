/** UX_LAYOUT_200 #52：麵包屑結構化與連結 — 語意 nav、aria-label、當前頁 aria-current */
import Link from 'next/link'

export interface BreadcrumbItem {
  href?: string
  label: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: string
  className?: string
}

/** N-Breadcrumb-01：RWD、連結 48px 觸控、焦點環 */
export function Breadcrumb({ items, separator = '›', className = '' }: BreadcrumbProps) {
  return (
    <nav className={`text-sm text-white/50 max-w-full min-w-0 ${className}`} aria-label="麵包屑" data-ux-breadcrumb>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 list-none m-0 p-0">
        {items.map((item, index) => {
          return (
            <li key={index} className="inline-flex items-center gap-x-1">
              {index > 0 && <span className="mx-1 select-none" aria-hidden>{separator}</span>}
              {item.href != null ? (
                <Link
                  href={item.href}
                  className="hover:text-white/70 min-h-[48px] min-w-[48px] inline-flex items-center games-focus-ring rounded px-1 -mx-1"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-white py-2 min-h-[48px] inline-flex items-center border-b-2 border-primary-400" aria-current="page">{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
