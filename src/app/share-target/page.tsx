'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

/**
 * PWA-018: Share Target handler page.
 * When the PWA is installed and the user shares content to Cheersin,
 * the OS routes here with ?title=&text=&url= query params.
 */
function ShareTargetContent() {
  const params = useSearchParams()
  const title = params.get('title') || ''
  const text = params.get('text') || ''
  const url = params.get('url') || ''

  const hasContent = title || text || url

  if (!hasContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-white p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">沒有收到分享內容</h1>
          <p className="text-white/60 text-sm">請從其他應用使用「分享」功能將內容傳送到 Cheersin。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white p-6">
      <div className="max-w-lg mx-auto pt-12">
        <h1 className="text-2xl font-bold mb-6">收到分享內容</h1>
        <div className="space-y-4 bg-white/5 rounded-2xl p-6 border border-white/10">
          {title && (
            <div>
              <span className="text-xs text-white/40 uppercase tracking-wider">標題</span>
              <p className="text-white mt-1">{title}</p>
            </div>
          )}
          {text && (
            <div>
              <span className="text-xs text-white/40 uppercase tracking-wider">內容</span>
              <p className="text-white mt-1 whitespace-pre-wrap">{text}</p>
            </div>
          )}
          {url && (
            <div>
              <span className="text-xs text-white/40 uppercase tracking-wider">連結</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:underline mt-1 block break-all"
              >
                {url}
              </a>
            </div>
          )}
        </div>
        <p className="text-white/40 text-xs mt-4">
          你可以將此內容用於 AI 侍酒師對話或分享給派對好友。
        </p>
      </div>
    </div>
  )
}

export default function ShareTargetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-900" />}>
      <ShareTargetContent />
    </Suspense>
  )
}
