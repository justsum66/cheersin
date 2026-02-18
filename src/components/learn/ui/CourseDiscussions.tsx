'use client'

/**
 * R2-383 / LEARN-044：課程頁下方討論區 — 列表 + 發表表單 + 章節篩選
 */
import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, Loader2, Filter } from 'lucide-react'

type DiscussionItem = {
  id: string
  course_id: string
  user_id: string
  content: string
  created_at: string
  chapter_id?: string
}

interface CourseDiscussionsProps {
  courseId: string
  /** LEARN-044: 可選章節列表供篩選 */
  chapters?: { id: string; title: string }[]
}

export function CourseDiscussions({ courseId, chapters }: CourseDiscussionsProps) {
  const [items, setItems] = useState<DiscussionItem[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filterChapter, setFilterChapter] = useState<string>('all')
  const [selectedChapter, setSelectedChapter] = useState<string>('')

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
        body: JSON.stringify({ courseId, content: text, chapterId: selectedChapter || undefined }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || '發送失敗')
        return
      }
      setContent('')
      setSelectedChapter('')
      await fetchList()
    } finally {
      setSubmitting(false)
    }
  }

  /* LEARN-044: 依章節篩選 */
  const displayed = filterChapter === 'all'
    ? items
    : items.filter(it => it.chapter_id === filterChapter)

  return (
    <section className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">討論區</h2>
          <span className="text-xs text-white/40">({displayed.length})</span>
        </div>
        {/* LEARN-044: 章節篩選器 */}
        {chapters && chapters.length > 0 && (
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-white/40" />
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 min-h-[36px]"
            >
              <option value="all">全部章節</option>
              {chapters.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        {/* LEARN-044: 選擇討論章節 */}
        {chapters && chapters.length > 0 && (
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 mb-2 min-h-[36px]"
          >
            <option value="">一般討論（不指定章節）</option>
            {chapters.map(ch => (
              <option key={ch.id} value={ch.id}>{ch.title}</option>
            ))}
          </select>
        )}
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
      ) : displayed.length === 0 ? (
        <p className="text-white/50 text-sm">尚無討論，來搶頭香吧。</p>
      ) : (
        <ul className="space-y-4">
          {displayed.map((item) => (
            <li key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
              {item.chapter_id && chapters && (
                <p className="text-primary-400/60 text-xs mb-1">
                  {chapters.find(ch => ch.id === item.chapter_id)?.title ?? item.chapter_id}
                </p>
              )}
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
