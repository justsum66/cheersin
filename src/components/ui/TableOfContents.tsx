'use client'

/** UX_LAYOUT_200 #69：長頁面錨點目錄（可選）— 依標題產生錨點連結 */
export interface TableOfContentsItem {
  id: string
  label: string
  level?: number
}

export interface TableOfContentsProps {
  items: TableOfContentsItem[]
  className?: string
  title?: string
}

export function TableOfContents({ items, className = '', title = '本頁目錄' }: TableOfContentsProps) {
  if (items.length === 0) return null
  return (
    <nav
      className={`rounded-xl bg-white/5 border border-white/10 p-4 ${className}`}
      aria-label={title}
    >
      <h2 className="text-sm font-semibold text-white/80 mb-3">{title}</h2>
      <ul className="space-y-1.5 list-none m-0 p-0">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm text-white/70 hover:text-white transition-colors py-0.5 ${
                item.level === 2 ? 'pl-3' : item.level === 3 ? 'pl-6' : ''
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
