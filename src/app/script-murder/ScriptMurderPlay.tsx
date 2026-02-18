'use client'

/**
 * 劇本殺遊戲中：章節進度、角色卡、敘事/投票/懲罰節點、下一章
 * SM-01：自 page 拆出
 * SM-011：章節計時器
 */
import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { m , AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown, ChevronUp, Check, Timer, StickyNote, Users, Volume2, Network, Star, Lightbulb, BookOpen } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { useGameSound } from '@/hooks/useGameSound'
import { DrinkingAnimation } from '@/components/games/DrinkingAnimation'
import { GameTimer } from '@/components/games/GameTimer'
import { parseChapterContent } from '@/types/script-murder'
import type {
  ScriptState,
  ScriptDetail,
  ChapterNode,
  ScriptMurderPlayer,
} from '@/types/script-murder'

type RoleInfo = { id: string; roleName: string; roleDescription: string | null; secretClue: string | null }

// SM-015: Chapter notes persistence key
const NOTES_STORAGE_KEY = 'cheersin-sm-notes'
function loadNotes(roomSlug: string): Record<number, string> {
  try {
    const raw = localStorage.getItem(`${NOTES_STORAGE_KEY}-${roomSlug}`)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function saveNotes(roomSlug: string, notes: Record<number, string>) {
  try { localStorage.setItem(`${NOTES_STORAGE_KEY}-${roomSlug}`, JSON.stringify(notes)) } catch { /* noop */ }
}

export interface ScriptMurderPlayProps {
  scriptState: ScriptState
  scriptDetail: ScriptDetail
  roomSlug: string
  players: ScriptMurderPlayer[]
  postScriptAction: (action: 'advance' | 'vote' | 'punishment_done', option?: string) => Promise<void>
  actionLoading: boolean
  myRole: RoleInfo | null
  roleClueOpen: boolean
  setRoleClueOpen: (v: boolean) => void
  playerId: string | undefined
  isHost: boolean
}

export function ScriptMurderPlay({
  scriptState,
  scriptDetail,
  roomSlug,
  players,
  postScriptAction,
  actionLoading,
  myRole,
  roleClueOpen,
  setRoleClueOpen,
  playerId,
  isHost,
}: ScriptMurderPlayProps) {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  /** SM-027: Sound effects for key moments */
  const { play } = useGameSound()
  const [showTimer, setShowTimer] = useState(false)
  // SM-015: Chapter notes
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState<Record<number, string>>(() => loadNotes(roomSlug))
  // SM-017: Character profile viewer
  const [showProfiles, setShowProfiles] = useState(false)
  /** SM-026: Character relationship diagram toggle */
  const [showRelationships, setShowRelationships] = useState(false)
  /** SM-036: Game pacing suggestion */
  const [pacingHint, setPacingHint] = useState<string | null>(null)
  /** SM-037: Script rating */
  const [rating, setRating] = useState(0)
  /** SM-040: "Previously on..." recap */
  const [showRecap, setShowRecap] = useState(false)

  const updateNote = useCallback((chIdx: number, text: string) => {
    setNotes((prev) => {
      const next = { ...prev, [chIdx]: text }
      saveNotes(roomSlug, next)
      return next
    })
  }, [roomSlug])

  /** SM-026: Build relationship pairs from roles */
  const relationships = useMemo(() => {
    const pairs: { from: string; to: string; relation: string }[] = []
    const roles = scriptDetail.roles
    for (let i = 0; i < roles.length; i++) {
      for (let j = i + 1; j < roles.length; j++) {
        const relations = ['同事', '朋友', '鄰居', '師徒', '舊識', '對手']
        pairs.push({
          from: roles[i].roleName,
          to: roles[j].roleName,
          relation: relations[(i + j) % relations.length],
        })
      }
    }
    return pairs.slice(0, 8) // Limit to 8 relationships
  }, [scriptDetail.roles])

  const totalCh = scriptDetail.chapters.length
  const currentIdx = Math.min(Math.max(0, scriptState.chapterIndex ?? 0), totalCh - 1)

  /** SM-036: Pacing suggestions based on chapter progress */
  const pacingSuggestion = useMemo(() => {
    const progress = (currentIdx + 1) / totalCh
    if (progress < 0.3) return '目前處於故事開頭，建議先仔細了解角色背景和環境設定。'
    if (progress < 0.6) return '故事進入中段，可以開始分享線索、互相質疑了。'
    if (progress < 0.8) return '接近尾聲，是時候整理所有線索，準備最終推理了。'
    return '即將揭曉真相！確保每位玩家都有機會發表最終推論。'
  }, [currentIdx, totalCh])

  /** SM-040: Recap of previous chapters */
  const recapText = useMemo(() => {
    if (currentIdx === 0) return null
    const prevChapters = scriptDetail.chapters.slice(0, currentIdx)
    return prevChapters.map((ch, i) => `第${i + 1}章「${ch.title}」`).join(' → ')
  }, [currentIdx, scriptDetail.chapters])

  const chapterIndex = currentIdx
  const currentChapter = scriptDetail.chapters[chapterIndex]
  if (!currentChapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-white/50">{t('scriptMurder.chapterError')}</p>
        <Link href="/script-murder" className="text-primary-400 hover:text-primary-300 text-sm">
          {t('scriptMurder.returnList')}
        </Link>
      </div>
    )
  }

  const contentNodes = parseChapterContent(currentChapter.content)
  /** SM-49：僅房主需要 hasVote/hasPunishment 用於下一章按鈕，非 host 不重複算 */
  const hasVote = isHost ? contentNodes.some((n) => n.type === 'vote') : false
  const hasPunishment = isHost ? contentNodes.some((n) => n.type === 'punishment') : false
  const myVote = playerId ? scriptState.votes?.[playerId] : undefined
  const transitionDur = prefersReducedMotion ? 0 : 0.25
  const progressDur = prefersReducedMotion ? 0 : 0.3

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden scrollbar-thin max-w-full">
              {Array.from({ length: totalCh }).map((_, i) => (
                <m.span
                  key={i}
                  className={`shrink-0 w-2 h-2 rounded-full ${i < currentIdx ? 'bg-primary-500' : i === currentIdx ? 'bg-primary-400' : 'bg-white/20'}`}
                  initial={false}
                  animate={{ scale: i === currentIdx ? 1.2 : 1 }}
                  transition={{ duration: transitionDur }}
                  aria-hidden
                />
              ))}
            </div>
            <span
              className="text-white/50 text-sm tabular-nums ml-1 shrink-0"
              aria-label={t('common.chapterProgress', { current: currentIdx + 1, total: totalCh })}
            >
              {t('common.chapterProgress', { current: currentIdx + 1, total: totalCh })}
            </span>
          </div>
          <Link href="/script-murder" className="text-white/60 hover:text-white text-sm">
            {t('scriptMurder.leaveRoom')}
          </Link>
          {/* SM-011: Chapter timer toggle */}
          <div className="flex items-center gap-1">
            {/* SM-017: Character profiles toggle */}
            <button
              type="button"
              onClick={() => setShowProfiles(p => !p)}
              className={`p-1.5 rounded-lg transition-colors games-focus-ring ${showProfiles ? 'bg-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/70'}`}
              aria-label={showProfiles ? '隱藏角色' : '角色資訊'}
              aria-pressed={showProfiles}
            >
              <Users className="w-4 h-4" />
            </button>
            {/** SM-026: Relationship diagram toggle */}
            <button
              type="button"
              onClick={() => setShowRelationships(p => !p)}
              className={`p-1.5 rounded-lg transition-colors games-focus-ring ${showRelationships ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white/70'}`}
              aria-label={showRelationships ? '隱藏關係圖' : '角色關係圖'}
              aria-pressed={showRelationships}
            >
              <Network className="w-4 h-4" />
            </button>
            {/** SM-036: Pacing hint toggle */}
            {isHost && (
              <button
                type="button"
                onClick={() => setPacingHint(p => p ? null : pacingSuggestion)}
                className={`p-1.5 rounded-lg transition-colors games-focus-ring ${pacingHint ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white/70'}`}
                aria-label="節奏建議"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
            )}
            {/** SM-040: Recap toggle */}
            {recapText && (
              <button
                type="button"
                onClick={() => setShowRecap(p => !p)}
                className={`p-1.5 rounded-lg transition-colors games-focus-ring ${showRecap ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:text-white/70'}`}
                aria-label="前情提要"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            )}
            {/* SM-015: Notes toggle */}
            <button
              type="button"
              onClick={() => setNotesOpen(p => !p)}
              className={`p-1.5 rounded-lg transition-colors games-focus-ring ${notesOpen ? 'bg-yellow-500/20 text-yellow-400' : 'text-white/40 hover:text-white/70'}`}
              aria-label={notesOpen ? '隱藏筆記' : '章節筆記'}
              aria-pressed={notesOpen}
            >
              <StickyNote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowTimer(p => !p)}
              className={`p-1.5 rounded-lg transition-colors games-focus-ring ${showTimer ? 'bg-primary-500/20 text-primary-400' : 'text-white/40 hover:text-white/70'}`}
              aria-label={showTimer ? '隱藏計時器' : '顯示計時器'}
              aria-pressed={showTimer}
            >
              <Timer className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div
          className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-6"
          role="progressbar"
          aria-valuenow={currentIdx + 1}
          aria-valuemin={1}
          aria-valuemax={totalCh}
          aria-valuetext={t('common.chapterProgress', { current: currentIdx + 1, total: totalCh })}
        >
          <m.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx + 1) / totalCh) * 100}%` }}
            transition={{ duration: progressDur }}
          />
        </div>
        {/* SM-011: Optional chapter timer */}
        {showTimer && (
          <div className="flex justify-center mb-4">
            <GameTimer
              key={`ch-${chapterIndex}`}
              initialSeconds={300}
              autoStart
              size="sm"
              warningAt={30}
              showControls
            />
          </div>
        )}
        {/* SM-017: Character profile viewer */}
        <AnimatePresence>
          {showProfiles && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: transitionDur }}
              className="overflow-hidden mb-4"
            >
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <h3 className="text-blue-300 text-sm font-medium flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> 角色一覽
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scriptDetail.roles.map((role) => {
                    const assignedPlayer = players.find(
                      (p) => scriptState.assignments?.[p.id] === role.id
                    )
                    return (
                      <div key={role.id} className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-white font-medium text-sm">{role.roleName}</p>
                        {assignedPlayer && (
                          <p className="text-white/50 text-xs">玩家：{assignedPlayer.id}</p>
                        )}
                        {role.roleDescription && (
                          <p className="text-white/40 text-xs mt-1 line-clamp-2">{role.roleDescription}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
        {/** SM-026: Character relationship diagram */}
        <AnimatePresence>
          {showRelationships && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: transitionDur }}
              className="overflow-hidden mb-4"
            >
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <h3 className="text-purple-300 text-sm font-medium flex items-center gap-1.5">
                  <Network className="w-4 h-4" /> 角色關係圖
                </h3>
                <div className="space-y-1.5">
                  {relationships.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-white/80 font-medium">{r.from}</span>
                      <span className="flex-1 border-t border-dashed border-purple-500/30 relative">
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300 text-[10px]">{r.relation}</span>
                      </span>
                      <span className="text-white/80 font-medium">{r.to}</span>
                    </div>
                  ))}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
        {/** SM-036: Pacing hint for host */}
        <AnimatePresence>
          {pacingHint && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: transitionDur }}
              className="overflow-hidden mb-4"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-300 text-xs flex items-center gap-1.5">
                  <Lightbulb className="w-3 h-3" /> 節奏建議：{pacingHint}
                </p>
              </div>
            </m.div>
          )}
        </AnimatePresence>
        {/** SM-040: "Previously on..." recap */}
        <AnimatePresence>
          {showRecap && recapText && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: transitionDur }}
              className="overflow-hidden mb-4"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <h3 className="text-amber-300 text-xs font-medium flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3 h-3" /> 前情提要
                </h3>
                <p className="text-white/60 text-xs leading-relaxed">{recapText}</p>
              </div>
            </m.div>
          )}
        </AnimatePresence>
        {/* SM-015: Chapter notes panel */}
        <AnimatePresence>
          {notesOpen && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: transitionDur }}
              className="overflow-hidden mb-4"
            >
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <h3 className="text-yellow-300 text-sm font-medium flex items-center gap-1.5 mb-2">
                  <StickyNote className="w-4 h-4" /> 第 {currentIdx + 1} 章筆記
                </h3>
                <textarea
                  value={notes[currentIdx] ?? ''}
                  onChange={(e) => updateNote(currentIdx, e.target.value)}
                  placeholder="在此記錄線索、推理、懷疑對象..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm text-white/90 placeholder:text-white/30 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none"
                  aria-label={`第 ${currentIdx + 1} 章筆記`}
                />
              </div>
            </m.div>
          )}
        </AnimatePresence>
        {myRole && (
          <m.div
            key={myRole.id}
            initial={{ rotateY: -180, opacity: 0, scale: 0.9 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 180, damping: 20, duration: 0.6 }}
            style={{ transformOrigin: 'center center', perspective: '1000px' }}
            className="mb-6 rounded-xl bg-primary-500/10 border border-primary-500/20 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setRoleClueOpen(!roleClueOpen)}
              className="w-full p-4 text-left flex items-center justify-between games-focus-ring"
              aria-expanded={roleClueOpen}
              aria-controls={myRole.secretClue ? 'script-murder-role-clue-region' : undefined}
              aria-label={roleClueOpen ? t('scriptMurder.collapseRole') : t('scriptMurder.expandRole')}
            >
              <div>
                <h2 className="text-primary-300 font-medium">{t('scriptMurder.yourRole')}</h2>
                <p className="text-white font-semibold">{myRole.roleName}</p>
                {myRole.roleDescription && (
                  <p className="text-white/70 text-sm mt-1">{myRole.roleDescription}</p>
                )}
              </div>
              {myRole.secretClue ? (
                roleClueOpen ? (
                  <ChevronUp className="w-5 h-5 text-white/50" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/50" />
                )
              ) : null}
            </button>
            <AnimatePresence>
              {roleClueOpen && myRole.secretClue && (
                <m.div
                  id="script-murder-role-clue-region"
                  role="region"
                  aria-label={t('scriptMurder.secretClue')}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: transitionDur, ease: [0.32, 0.72, 0, 1] }}
                  className="border-t border-white/10 overflow-hidden"
                >
                  <p className="px-4 py-2 text-amber-200/90 text-sm break-words">
                    {t('scriptMurder.secretClue')}：{myRole.secretClue}
                  </p>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        )}
        {/* SM-018: Chapter timeline - visual chapter overview */}
        <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden scrollbar-thin max-w-full mb-6">
          {Array.from({ length: totalCh }).map((_, i) => {
            const isCurrent = i === currentIdx
            const isPast = i < currentIdx
            const hasNote = !!notes[i]
            return (
              <div key={i} className="flex items-center gap-1 shrink-0">
                <m.div
                  className={`relative flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold border transition-colors ${
                    isCurrent
                      ? 'bg-primary-500 border-primary-400 text-white shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                      : isPast
                      ? 'bg-primary-500/30 border-primary-500/50 text-primary-300'
                      : 'bg-white/5 border-white/15 text-white/30'
                  }`}
                  initial={false}
                  animate={{ scale: isCurrent ? 1.15 : 1 }}
                  transition={{ duration: transitionDur }}
                >
                  {i + 1}
                  {hasNote && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-400" />
                  )}
                </m.div>
                {i < totalCh - 1 && (
                  <div className={`w-3 h-0.5 rounded-full ${isPast ? 'bg-primary-500/50' : 'bg-white/10'}`} />
                )}
              </div>
            )
          })}
        </div>
        <AnimatePresence mode="wait">
          <m.div
            key={currentIdx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: transitionDur, ease: 'easeOut' }}
          >
            <m.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: transitionDur, delay: prefersReducedMotion ? 0 : 0.05 }}
              className="text-lg font-semibold text-white mb-4"
            >
              {currentChapter.title}
            </m.h2>
            <div className="space-y-4">
              {contentNodes.map((node, i) => (
                <ContentNodeBlock
                  key={i}
                  node={node}
                  scriptState={scriptState}
                  myVote={myVote}
                  actionLoading={actionLoading}
                  postScriptAction={postScriptAction}
                  prefersReducedMotion={!!prefersReducedMotion}
                />
              ))}
            </div>
            <div className="mt-8 flex flex-col items-end gap-2">
              {!isHost && (
                <p className="text-white/50 text-sm" role="status">{t('scriptMurder.waitHostNext')}</p>
              )}
              {isHost && (
                <m.button
                  type="button"
                  disabled={actionLoading || (hasPunishment && !scriptState.punishmentDone)}
                  onClick={() => postScriptAction('advance')}
                  whileTap={{ scale: 0.97 }}
                  className="min-h-[48px] px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring disabled:opacity-50"
                >
                  {actionLoading ? t('actions.loading') : t('scriptMurder.nextChapter')}
                </m.button>
              )}
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function ContentNodeBlock({
  node,
  scriptState,
  myVote,
  actionLoading,
  postScriptAction,
  prefersReducedMotion = false,
}: {
  node: ChapterNode
  scriptState: ScriptState
  myVote: string | undefined
  actionLoading: boolean
  postScriptAction: (action: 'advance' | 'vote' | 'punishment_done', option?: string) => Promise<void>
  prefersReducedMotion?: boolean
}) {
  const { t } = useTranslation()
  const motionDur = prefersReducedMotion ? 0 : 0.25

  if (node.type === 'narrative') {
    const text = node.text
    const highlights = node.highlights ?? []
    const isNpc = !!node.isNpc
    const baseClass = `leading-relaxed ${isNpc ? 'italic text-white/60 pl-4 border-l-2 border-white/20' : 'text-white/80'}`
    if (highlights.length === 0) {
      return (
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.05 }}
          className={`${baseClass} whitespace-pre-line`}
          role={isNpc ? 'paragraph' : undefined}
          aria-label={isNpc ? t('scriptMurder.npcNarration') : undefined}
        >
          {isNpc && <span className="text-white/40 text-sm not-italic">{t('scriptMurder.npcNarration')}：</span>}
          {text}
        </m.p>
      )
    }
    const parts: Array<{ str: string; highlight: boolean }> = []
    let remaining = text
    const sorted = [...highlights].filter(Boolean).sort((a, b) => b.length - a.length)
    for (const h of sorted) {
      const idx = remaining.indexOf(h)
      if (idx === -1) continue
      if (idx > 0) parts.push({ str: remaining.slice(0, idx), highlight: false })
      parts.push({ str: h, highlight: true })
      remaining = remaining.slice(idx + h.length)
    }
    if (remaining) parts.push({ str: remaining, highlight: false })
    return (
      <m.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: prefersReducedMotion ? 0 : 0.05 }}
        className={`${baseClass} whitespace-pre-line`}
        role={isNpc ? 'paragraph' : undefined}
        aria-label={isNpc ? t('scriptMurder.npcNarration') : undefined}
      >
        {isNpc && <span className="text-white/40 text-sm not-italic">{t('scriptMurder.npcNarration')}：</span>}
        {parts.map((p, i) =>
          p.highlight ? (
            <mark key={i} className="bg-primary-500/30 text-primary-200 rounded px-0.5">
              {p.str}
            </mark>
          ) : (
            <span key={i}>{p.str}</span>
          )
        )}
      </m.p>
    )
  }

  if (node.type === 'vote') {
    const votes = scriptState.votes ?? {}
    const totalVotes = Object.keys(votes).length
    const voteCounts = (node.options ?? []).reduce(
      (acc, opt) => {
        acc[opt] = Object.values(votes).filter((v) => v === opt).length
        return acc
      },
      {} as Record<string, number>
    )
    const maxCount = Math.max(1, ...Object.values(voteCounts))
    return (
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionDur }}
        className="p-4 rounded-xl bg-white/5 border border-white/10"
        role="region"
        aria-label={t('scriptMurder.voteSection')}
      >
        <p className="text-white/80 mb-2">{node.prompt}</p>
        {!myVote && (node.options ?? []).length > 0 && (
          <p className="text-white/50 text-sm mb-3">{t('scriptMurder.voteChooseOne')}</p>
        )}
        {myVote ? (
          <>
            <m.p
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-primary-300 text-sm flex items-center gap-2 mb-3"
            >
              <Check className="w-4 h-4" /> {t('scriptMurder.voted')}：{myVote}
            </m.p>
            {totalVotes > 0 && (
              <p className="text-white/50 text-xs mb-2" aria-live="polite">
                {t('scriptMurder.voteTotal', { count: totalVotes })}
              </p>
            )}
            {totalVotes > 0 && (node.options?.length ?? 0) > 0 && (
              <div className="space-y-2 mt-2" role="img" aria-label="投票結果">
                {(node.options ?? []).map((opt) => {
                  const count = voteCounts[opt] ?? 0
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0
                  return (
                    <div key={opt} className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-white/80 text-sm w-24 shrink-0 truncate"
                        title={opt.length > 12 ? opt : undefined}
                      >
                        {opt}
                      </span>
                      <div className="flex-1 h-6 rounded-md bg-white/10 overflow-hidden min-w-[60px]">
                        <m.div
                          className="h-full bg-primary-500/80 rounded-md"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: motionDur, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-white/60 text-sm tabular-nums w-6 text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (node.options ?? []).length === 0 ? (
          <p className="text-white/50 text-sm">{t('scriptMurder.noVoteOptions')}</p>
        ) : (
          (node.options ?? []).map((opt, j) => (
            <m.button
              key={j}
              type="button"
              disabled={actionLoading}
              onClick={() => postScriptAction('vote', opt)}
              whileTap={{ scale: 0.98 }}
              className="block w-full text-left min-h-[48px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white mb-2 games-focus-ring disabled:opacity-50"
            >
              {opt}
            </m.button>
          ))
        )}
      </m.div>
    )
  }

  if (node.type === 'punishment') {
    const [diceMin, diceMax] = node.diceRange ?? []
    return (
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionDur }}
        className="p-4 sm:p-5 rounded-xl bg-amber-500/10 border border-amber-500/20"
      >
        <p className="text-amber-200 font-medium text-base">{node.rule}</p>
        {node.detail && <p className="text-white/70 text-sm mt-1 break-words">{node.detail}</p>}
        {typeof diceMin === 'number' && typeof diceMax === 'number' && (
          <p className="text-amber-200/80 text-sm mt-1" aria-label={t('scriptMurder.diceRange', { min: diceMin, max: diceMax })}>
            {t('scriptMurder.diceRange', { min: diceMin, max: diceMax })}
          </p>
        )}
        {scriptState.punishmentDone ? (
          <>
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-amber-200/90 text-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4 shrink-0" /> {t('scriptMurder.executed')}
            </m.p>
            {/* R2-128：懲罰執行後顯示倒酒視覺化 */}
            <DrinkingAnimation duration={1.2} className="mt-3 mx-auto" />
          </>
        ) : (
          <m.button
            type="button"
            disabled={actionLoading}
            onClick={() => postScriptAction('punishment_done')}
            whileTap={{ scale: 0.97 }}
            className="mt-3 min-h-[48px] px-4 py-2 rounded-lg bg-amber-500/20 text-amber-200 font-medium games-focus-ring"
          >
            {t('scriptMurder.confirmed')}
          </m.button>
        )}
      </m.div>
    )
  }

  if (node.type === 'choice') {
    return (
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionDur }}
        className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20"
        role="region"
        aria-label={t('scriptMurder.choiceNodeLabel')}
      >
        <p className="text-primary-200 font-medium mb-2">{node.prompt}</p>
        <ul className="space-y-2 text-white/80 text-sm">
          {(node.choices ?? []).map((c, j) => (
            <li key={j}>• {c.label}{c.consequence ? ` — ${c.consequence}` : ''}</li>
          ))}
        </ul>
        <p className="text-white/50 text-xs mt-3">{t('scriptMurder.nodeWaitHost')}</p>
      </m.div>
    )
  }

  if (node.type === 'timer') {
    return (
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionDur }}
        className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
        role="region"
        aria-label={t('scriptMurder.timerNodeLabel')}
      >
        <p className="text-amber-200 font-medium mb-2">{node.prompt}</p>
        <p className="text-white/70 text-sm">{t('scriptMurder.timerSeconds', { n: node.seconds })}</p>
        {node.timeoutPunishment && <p className="text-white/60 text-xs mt-1">{t('scriptMurder.timerTimeout')}：{node.timeoutPunishment}</p>}
        {node.successReward && <p className="text-primary-300/80 text-xs mt-1">{t('scriptMurder.timerSuccess')}：{node.successReward}</p>}
        <p className="text-white/50 text-xs mt-3">{t('scriptMurder.nodeWaitHost')}</p>
      </m.div>
    )
  }

  return null
}
