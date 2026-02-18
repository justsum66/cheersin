'use client'

import { use, useMemo, Suspense } from 'react'

interface WineKnowledgeData {
  meta: string
  faq: { q: string; a: string }[]
  glassGuide: { category: string; glass: string }[]
  decanting: { title: string; content: string }[]
  tastingTips: string[]
}

/** React 19 use()：從 Promise 解包資料，簡化 async 組件邏輯。需外層 Suspense。 */
export function WineKnowledgeDataLoader({
  promise,
  children,
}: {
  promise: Promise<WineKnowledgeData | null>
  children: (data: WineKnowledgeData | null) => React.ReactNode
}) {
  const data = use(promise)
  return <>{children(data)}</>
}

/** 建立 wine-knowledge API 的 Promise（useMemo 確保只建立一次） */
export function useWineKnowledgePromise() {
  return useMemo(
    () =>
      fetch('/api/wine-knowledge')
        .then((res) => res.json() as Promise<WineKnowledgeData>)
        .catch(() => null),
    []
  )
}
