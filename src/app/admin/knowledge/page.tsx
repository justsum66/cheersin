'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Pencil, Trash2, BookOpen } from 'lucide-react'

interface KnowledgeDoc {
  id: string
  title: string
  course_id: string
  chapter: string
  content: string
  vector_id: string | null
  created_at: string
  updated_at: string
}

const API_BASE = '/api/admin/knowledge'

export default function AdminKnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [adminSecret, setAdminSecret] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<KnowledgeDoc | null>(null)
  const [form, setForm] = useState({ title: '', course_id: '', chapter: '', content: '' })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const headers = () => ({
    'Content-Type': 'application/json',
    ...(adminSecret ? { 'x-admin-secret': adminSecret } : {}),
  })

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_BASE, { headers: headers() })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setDocs(data.docs ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setDocs([])
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- headers from next/headers, omit to avoid refetch on every request
  }, [adminSecret])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const handleCreate = async () => {
    if (!form.title.trim() || !form.course_id.trim() || !form.chapter.trim() || !form.content.trim()) {
      setError('請填寫所有欄位')
      return
    }
    setSubmitLoading(true)
    setError(null)
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setForm({ title: '', course_id: '', chapter: '', content: '' })
      setShowForm(false)
      await fetchDocs()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editing) return
    if (!form.title.trim() || !form.course_id.trim() || !form.chapter.trim() || !form.content.trim()) {
      setError('請填寫所有欄位')
      return
    }
    setSubmitLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/${editing.id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setEditing(null)
      setForm({ title: '', course_id: '', chapter: '', content: '' })
      await fetchDocs()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此文檔？')) return
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: headers() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      await fetchDocs()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const openEdit = (doc: KnowledgeDoc) => {
    setEditing(doc)
    setForm({ title: doc.title, course_id: doc.course_id, chapter: doc.chapter, content: doc.content })
  }

  return (
    <main className="min-h-screen bg-dark-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
            返回
          </Link>
          <h1 className="flex items-center gap-2 font-display font-bold text-xl">
            <BookOpen className="w-6 h-6 text-primary-500" />
            知識庫管理
          </h1>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-white/50 mb-1">Admin Secret（可選，未設時 dev 放行）</label>
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="與 .env ADMIN_SECRET 一致"
            className="w-full max-w-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30"
          />
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', course_id: '', chapter: '', content: '' }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-500"
          >
            <Plus className="w-4 h-4" />
            新增文檔
          </button>
        </div>

        {(showForm || editing) && (
          <div className="mb-6 p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <h2 className="font-semibold">{editing ? '編輯文檔' : '新增文檔'}</h2>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="標題"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
            />
            <input
              value={form.course_id}
              onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
              placeholder="course_id（如 wine-basics）"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
            />
            <input
              value={form.chapter}
              onChange={(e) => setForm((f) => ({ ...f, chapter: e.target.value }))}
              placeholder="章節名稱"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
            />
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="內容（Markdown 或純文字，將被向量化）"
              rows={8}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 resize-y"
            />
            <div className="flex gap-2">
              <button
                onClick={editing ? handleUpdate : handleCreate}
                disabled={submitLoading}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50"
              >
                {submitLoading ? '處理中…' : editing ? '儲存' : '新增'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditing(null); setForm({ title: '', course_id: '', chapter: '', content: '' }); }}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-white/50">載入中…</p>
        ) : docs.length === 0 ? (
          <p className="text-white/50">尚無文檔。請先執行 npm run seed:pinecone 或在此新增。</p>
        ) : (
          <ul className="space-y-3">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-sm text-white/50">{doc.course_id} / {doc.chapter}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(doc)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
                    title="編輯"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-white/70 hover:text-red-400"
                    title="刪除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
