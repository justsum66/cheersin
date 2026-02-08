'use client'

import { useState } from 'react'

/** P1-165：過長描述預設 2–3 行截斷，提供「展開更多」按鈕，保持介面整潔 */
interface TruncatedTextProps {
  text: string
  /** 截斷行數，預設 3 */
  maxLines?: number
  className?: string
  /** 展開後按鈕文案 */
  expandLabel?: string
  /** 收合按鈕文案 */
  collapseLabel?: string
}

export function TruncatedText({
  text,
  maxLines = 3,
  className = '',
  expandLabel = '展開更多',
  collapseLabel = '收合',
}: TruncatedTextProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={className}>
      <div
        className={expanded ? '' : 'line-clamp-box'}
        style={!expanded ? { WebkitLineClamp: maxLines, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined}
      >
        {text}
      </div>
      {text.length > 80 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-sm text-primary-400 hover:text-primary-300 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 rounded"
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      )}
    </div>
  )
}
