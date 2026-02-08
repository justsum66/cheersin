'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// P006: Dynamic import for react-markdown to reduce initial bundle by ~40KB
// Load only when assistant page is accessed
const ReactMarkdown = dynamic(
  () => import('react-markdown').then((mod) => {
    // Also load remark-gfm in the same chunk
    return mod.default
  }),
  {
    loading: () => <div className="text-white/50 text-sm animate-pulse">載入中...</div>,
    ssr: true,
  }
)

/** B1-54：AI 回覆以 Markdown 渲染，支援表格/列表與程式碼區塊樣式 */
const markdownComponents = {
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string; children?: React.ReactNode }) => {
    const isBlock = className != null
    if (isBlock) {
      return (
        <code
          className="block text-left p-4 rounded-xl bg-white/10 border border-white/10 text-sm overflow-x-auto text-gray-200 font-mono"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code className="px-1.5 py-0.5 rounded bg-white/10 text-primary-200 text-sm font-mono" {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="my-3 overflow-x-auto rounded-xl bg-white/10 border border-white/10 p-0" {...props}>
      {children}
    </pre>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-2 first:mt-0 last:mb-0 leading-relaxed" {...props}>{children}</p>
  ),
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-xl font-bold mt-4 mb-2 first:mt-0 scroll-mt-4" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-lg font-semibold mt-3 mb-2 first:mt-0 scroll-mt-4" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-base font-semibold mt-2 mb-1 first:mt-0 scroll-mt-4" {...props}>{children}</h3>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-2 list-disc list-inside space-y-1" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-2 list-decimal list-inside space-y-1" {...props}>{children}</ol>
  ),
  /** P2-399：站內連結用 Next Link 同頁導航，外站新分頁；酒款/遊戲連結可從對話直接點擊 */
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const safeHref = href?.startsWith('javascript:') ? undefined : href
    const isInternal = safeHref?.startsWith('/') === true && safeHref.length > 1
    if (isInternal && safeHref) {
      return (
        <Link href={safeHref} className="text-primary-400 hover:underline break-all" {...props}>
          {children}
        </Link>
      )
    }
    return (
      <a href={safeHref} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline break-all" {...props}>
        {children}
      </a>
    )
  },
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-3 overflow-x-auto scrollbar-thin" role="region" aria-label="表格可左右滑動">
      <p className="text-white/40 text-xs mb-1 sm:sr-only">行動版可左右滑動查看</p>
      <table className="min-w-full border-collapse border border-white/10 rounded-lg" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="border border-white/10 px-3 py-2 text-left bg-white/5 font-medium" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-white/10 px-3 py-2" {...props}>
      {children}
    </td>
  ),
}

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  // P006: Import remark-gfm dynamically. Hooks 必須在頂層、不可在 early return 之後。
  const [remarkGfm, setRemarkGfm] = useState<any>(null)

  useEffect(() => {
    import('remark-gfm').then((mod) => setRemarkGfm(() => mod.default))
  }, [])

  if (!content?.trim()) return null

  return (
    <div className={`markdown-assistant prose-invert prose-sm max-w-none min-w-0 break-words overflow-x-auto ${className}`}>
      <ReactMarkdown 
        remarkPlugins={remarkGfm ? [remarkGfm] : []} 
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
