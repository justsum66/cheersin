'use client'

/**
 * R2-383：課程頁下方討論區 — 列表 + 發表表單
 */
import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, Loader2 } from 'lucide-react'

type DiscussionItem = {
  id: string
  course_id: string
  user_id: string
  content: string
  created_at: string
}

interface CourseDiscussionsProps {
  courseId: string
}

export function CourseDiscussions({ courseId }: CourseDiscussionsProps) {
  const [items, setItems] = useState<DiscussionItem[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchList = useCallback(async () => {
    const res = await fetch(`/api/learn/discussions?courseId=${encodeURIComponent(courseId)}`)
    if (!res.ok) return
    const json = await res.json()
    setItems(json.items ?? [])
  }, [courseId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/learn/discussions?courseId=${encodeURIComponent(courseId)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setItems(json.items ?? [])
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = content.trim()
    if (!text) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/learn/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, content: text }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || '發送失敗')
        return
      }
      setContent('')
      await fetchList()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-primary-400" />
        <h2 className="text-lg font-semibold text-white">討論區</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的想法或提問…"
          rows={3}
          maxLength={5000}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm resize-y mb-2"
        />
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-300 font-medium hover:bg-primary-500/30 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {submitting ? '送出中…' : '發表'}
        </button>
      </form>

      {loading ? (
        <p className="text-white/50 text-sm">載入討論…</p>
      ) : items.length === 0 ? (
        <p className="text-white/50 text-sm">尚無討論，來搶頭香吧。</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-white/80 text-sm whitespace-pre-wrap">{item.content}</p>
              <p className="text-white/40 text-xs mt-2">
                {new Date(item.created_at).toLocaleString('zh-TW')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
