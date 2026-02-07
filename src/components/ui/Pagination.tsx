'use client'

/**
 * UX_LAYOUT_200 #76：分頁元件 — aria 與連結
 * 提供 nav aria-label、當前頁 aria-current="page"、上一頁/下一頁連結
 */
export interface PaginationProps {
  /** 當前頁（1-based） */
  currentPage: number
  /** 總頁數 */
  totalPages: number
  /** 產生頁面 URL，例如 (page) => `/list?p=${page}` */
  getPageHref: (page: number) => string
  /** 無障礙：導航區標籤 */
  ariaLabel?: string
  /** 上一頁無障礙標籤 */
  prevAriaLabel?: string
  /** 下一頁無障礙標籤 */
  nextAriaLabel?: string
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  getPageHref,
  ariaLabel = '分頁導航',
  prevAriaLabel = '上一頁',
  nextAriaLabel = '下一頁',
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null

  const prevPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  return (
    <nav
      className={`flex items-center justify-center gap-2 flex-wrap ${className}`}
      aria-label={ariaLabel}
    >
      {prevPage !== null ? (
        <a
          href={getPageHref(prevPage)}
          className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors games-focus-ring"
          aria-label={prevAriaLabel}
        >
          ←
        </a>
      ) : (
        <span
          className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-white/30 cursor-not-allowed"
          aria-hidden
        >
          ←
        </span>
      )}

      <div className="flex items-center gap-1" role="list">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isCurrent = page === currentPage
          return (
            <span key={page} role="listitem">
              {isCurrent ? (
                <span
                  className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-lg bg-primary-500/30 border border-primary-500/50 text-white font-medium"
                  aria-current="page"
                >
                  {page}
                </span>
              ) : (
                <a
                  href={getPageHref(page)}
                  className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors games-focus-ring"
                >
                  {page}
                </a>
              )}
            </span>
          )
        })}
      </div>

      {nextPage !== null ? (
        <a
          href={getPageHref(nextPage)}
          className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-colors games-focus-ring"
          aria-label={nextAriaLabel}
        >
          →
        </a>
      ) : (
        <span
          className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-white/30 cursor-not-allowed"
          aria-hidden
        >
          →
        </span>
      )}
    </nav>
  )
}
