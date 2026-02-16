'use client'

/**
 * R2-381：品鑑筆記 — 評分+照片+筆記，使用 wine_favorites；列表+表單
 */
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Wine, Star, Plus, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

type TastingNote = {
  id: string
  wine_name: string
  wine_type: string | null
  notes: string | null
  rating: number | null
  image_url: string | null
  created_at: string
}

export default function TastingNotesPage() {
  const [items, setItems] = useState<TastingNote[]>([])
  const [loading, setLoading] = useState(true)
  const [wineName, setWineName] = useState('')
  const [wineType, setWineType] = useState('')
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState<number | ''>('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchList = useCallback(async () => {
    const res = await fetch('/api/learn/tasting-notes')
    if (!res.ok) return
    const json = await res.json()
    setItems(json.items ?? [])
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch('/api/learn/tasting-notes')
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setItems(json.items ?? [])
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fetchList])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = wineName.trim()
    if (!name) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/learn/tasting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wine_name: name,
          wine_type: wineType.trim() || undefined,
          notes: notes.trim() || undefined,
          rating: rating === '' ? undefined : Number(rating),
          image_url: imageUrl.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || '新增失敗')
        return
      }
      setWineName('')
      setWineType('')
      setNotes('')
      setRating('')
      setImageUrl('')
      await fetchList()
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) setImageUrl(json.url)
      else alert(json.error || '上傳失敗')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-2xl mx-auto">
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 games-focus-ring"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden /> 返回品酒學院
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Wine className="w-6 h-6 text-primary-400" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">品鑑筆記</h1>
          <p className="text-white/60 text-sm">記錄酒款、評分與品飲心得</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">酒款名稱 *</label>
          <input
            type="text"
            value={wineName}
            onChange={(e) => setWineName(e.target.value)}
            placeholder="例：Cloudy Bay Sauvignon Blanc"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">類型</label>
          <input
            type="text"
            value={wineType}
            onChange={(e) => setWineType(e.target.value)}
            placeholder="紅酒、白酒、威士忌…"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">評分 (1–5)</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  rating === n
                    ? 'bg-primary-500/30 text-primary-300 border border-primary-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                <Star className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">品飲筆記</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="香氣、口感、餘韻…"
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">照片</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full text-sm text-white/70 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary-500/20 file:text-primary-300"
          />
          {uploading && <span className="text-xs text-white/50 flex items-center gap-1 mt-1"><Loader2 className="w-4 h-4 animate-spin" /> 上傳中…</span>}
          {imageUrl && (
            <p className="mt-2 text-xs text-primary-300">已選圖片，儲存筆記時一併送出</p>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-300 font-medium hover:bg-primary-500/30 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {submitting ? '送出中…' : '新增筆記'}
        </button>
      </form>

      {loading ? (
        <p className="text-white/50 text-sm">載入中…</p>
      ) : items.length === 0 ? (
        /* R2-291：列表空狀態使用 EmptyState 組件，友善文案與視覺一致 */
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <EmptyState
            title="尚無品鑑筆記"
            description="從上方表單新增一筆，記錄酒款、評分與品飲心得。"
            icon={<Wine className="w-16 h-16 text-white/30" aria-hidden />}
          />
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-4"
            >
              {item.image_url && (
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white/5">
                  <Image 
                    src={item.image_url} 
                    alt="" 
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized={true} // Since this is a user-uploaded image
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-white truncate">{item.wine_name}</h3>
                {item.wine_type && (
                  <p className="text-white/50 text-xs mt-0.5">{item.wine_type}</p>
                )}
                {item.rating != null && (
                  <p className="text-primary-400 text-sm mt-1">{item.rating} / 5</p>
                )}
                {item.notes && (
                  <p className="text-white/70 text-sm mt-2 line-clamp-2">{item.notes}</p>
                )}
                <p className="text-white/40 text-xs mt-2">
                  {new Date(item.created_at).toLocaleDateString('zh-TW')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
