'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from '@/contexts/I18nContext'
import { getErrorMessage } from '@/lib/api-response'
import Link from 'next/link'
import { ChevronLeft, Plus, Pencil, Trash2, BookOpen, Search } from 'lucide-react'
import { AdminSkeleton } from '@/components/admin/AdminSkeleton'
import { AdminForbidden } from '@/components/admin/AdminForbidden'

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
  const { t } = useTranslation()
  const [docs, setDocs] = useState<KnowledgeDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [adminSecret, setAdminSecret] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<KnowledgeDoc | null>(null)
  const [form, setForm] = useState({ title: '', course_id: '', chapter: '', content: '' })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [forbidden, setForbidden] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null)

  const headers = () => ({
    'Content-Type': 'application/json',
    ...(adminSecret ? { 'x-admin-secret': adminSecret } : {}),
  })

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_BASE, { headers: headers() })
      if (res.status === 401 || res.status === 403) {
        setForbidden(true)
        setDocs([])
        setLoading(false)
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(getErrorMessage(data, `HTTP ${res.status}`))
      }
      setForbidden(false)
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

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docs
    const q = searchQuery.trim().toLowerCase()
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.course_id.toLowerCase().includes(q) ||
        (d.chapter && String(d.chapter).toLowerCase().includes(q))
    )
  }, [docs, searchQuery])

  const handleCreate = async () => {
    if (!form.title.trim() || !form.course_id.trim() || !form.chapter.trim() || !form.content.trim()) {
      setError(t('admin.fillRequired'))
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
      if (!res.ok) throw new Error(getErrorMessage(data, `HTTP ${res.status}`))
      setForm({ title: '', course_id: '', chapter: '', content: '' })
      setShowForm(false)
      setSyncSuccess(t('admin.syncSuccessAdd'))
      setTimeout(() => setSyncSuccess(null), 4000)
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
      setError(t('admin.fillRequired'))
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
      if (!res.ok) throw new Error(getErrorMessage(data, `HTTP ${res.status}`))
      setEditing(null)
      setForm({ title: '', course_id: '', chapter: '', content: '' })
      setSyncSuccess(t('admin.syncSuccessUpdate'))
      setTimeout(() => setSyncSuccess(null), 4000)
      await fetchDocs()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDeleteDoc'))) return
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: headers() })
      const data = await res.json()
      if (!res.ok) throw new Error(getErrorMessage(data, `HTTP ${res.status}`))
      setSyncSuccess(t('admin.syncSuccessDelete'))
      setTimeout(() => setSyncSuccess(null), 4000)
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
            {t('admin.back')}
          </Link>
          <h1 className="flex items-center gap-2 font-display font-bold text-xl">
            <BookOpen className="w-6 h-6 text-primary-500" />
            {t('admin.titleKnowledge')}
          </h1>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-white/50 mb-1">{t('admin.adminSecretLabel')}</label>
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder={t('admin.adminSecretPlaceholder')}
            className="w-full max-w-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30"
          />
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        {syncSuccess && (
          <div role="status" aria-live="polite" className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            {syncSuccess}
          </div>
        )}

        {loading ? (
          <AdminSkeleton />
        ) : forbidden ? (
          <AdminForbidden />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('admin.searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30"
                  aria-label={t('admin.searchAria')}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', course_id: '', chapter: '', content: '' }); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-500"
                >
                  <Plus className="w-4 h-4" />
                  {t('admin.addDoc')}
                </button>
              </div>
            </div>

            {(showForm || editing) && (
              <div className="mb-6 p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <h2 className="font-semibold">{editing ? t('admin.editDoc') : t('admin.addDoc')}</h2>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={t('admin.placeholderTitle')}
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
                  placeholder={t('admin.placeholderChapter')}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                />
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder={t('admin.placeholderContent')}
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 resize-y"
                />
                <div className="flex gap-2">
                  <button
                    onClick={editing ? handleUpdate : handleCreate}
                    disabled={submitLoading}
                    className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50"
                  >
                    {submitLoading ? t('admin.saving') : editing ? t('admin.save') : t('admin.add')}
                  </button>
                  <button
                    onClick={() => { setShowForm(false); setEditing(null); setForm({ title: '', course_id: '', chapter: '', content: '' }); }}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    {t('admin.cancel')}
                  </button>
                </div>
              </div>
            )}

            {docs.length === 0 ? (
              <p className="text-white/50">{t('admin.noDocs')}</p>
            ) : filteredDocs.length === 0 ? (
              <p className="text-white/50">{t('admin.noSearchResult', { query: searchQuery })}</p>
            ) : (
              <ul className="space-y-3">
                {filteredDocs.map((doc) => (
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
                        title={t('admin.edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-white/70 hover:text-red-400"
                        title={t('admin.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  )
}
