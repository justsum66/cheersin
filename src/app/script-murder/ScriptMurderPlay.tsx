'use client'

/**
 * 劇本殺遊戲中：章節進度、角色卡、敘事/投票/懲罰節點、下一章
 * SM-01：自 page 拆出
 */
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { DrinkingAnimation } from '@/components/games/DrinkingAnimation'
import { parseChapterContent } from '@/types/script-murder'
import type {
  ScriptState,
  ScriptDetail,
  ChapterNode,
  ScriptMurderPlayer,
} from '@/types/script-murder'

type RoleInfo = { id: string; roleName: string; roleDescription: string | null; secretClue: string | null }

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
  const chapterIndex = Math.min(Math.max(0, scriptState.chapterIndex ?? 0), scriptDetail.chapters.length - 1)
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
  const totalCh = scriptDetail.chapters.length
  const currentIdx = chapterIndex
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
                <motion.span
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
        </div>
        <div
          className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-6"
          role="progressbar"
          aria-valuenow={currentIdx + 1}
          aria-valuemin={1}
          aria-valuemax={totalCh}
          aria-valuetext={t('common.chapterProgress', { current: currentIdx + 1, total: totalCh })}
        >
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx + 1) / totalCh) * 100}%` }}
            transition={{ duration: progressDur }}
          />
        </div>
        {myRole && (
          <motion.div
            key={myRole.id}
            initial={{ rotateY: -95, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 22, duration: 0.5 }}
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
                <motion.div
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
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
        {/* SM-10：章節切換 transition；投票揭曉／懲罰區塊已有 motion 入場 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: transitionDur, ease: 'easeOut' }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: transitionDur, delay: prefersReducedMotion ? 0 : 0.05 }}
              className="text-lg font-semibold text-white mb-4"
            >
              {currentChapter.title}
            </motion.h2>
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
                <motion.button
                  type="button"
                  disabled={actionLoading || (hasPunishment && !scriptState.punishmentDone)}
                  onClick={() => postScriptAction('advance')}
                  whileTap={{ scale: 0.97 }}
                  className="min-h-[48px] px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring disabled:opacity-50"
                >
                  {actionLoading ? t('actions.loading') : t('scriptMurder.nextChapter')}
                </motion.button>
              )}
            </div>
          </motion.div>
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.05 }}
          className={`${baseClass} whitespace-pre-line`}
          role={isNpc ? 'paragraph' : undefined}
          aria-label={isNpc ? t('scriptMurder.npcNarration') : undefined}
        >
          {isNpc && <span className="text-white/40 text-sm not-italic">{t('scriptMurder.npcNarration')}：</span>}
          {text}
        </motion.p>
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
      <motion.p
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
      </motion.p>
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
      <motion.div
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
            <motion.p
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-primary-300 text-sm flex items-center gap-2 mb-3"
            >
              <Check className="w-4 h-4" /> {t('scriptMurder.voted')}：{myVote}
            </motion.p>
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
                        <motion.div
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
            <motion.button
              key={j}
              type="button"
              disabled={actionLoading}
              onClick={() => postScriptAction('vote', opt)}
              whileTap={{ scale: 0.98 }}
              className="block w-full text-left min-h-[48px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white mb-2 games-focus-ring disabled:opacity-50"
            >
              {opt}
            </motion.button>
          ))
        )}
      </motion.div>
    )
  }

  if (node.type === 'punishment') {
    const [diceMin, diceMax] = node.diceRange ?? []
    return (
      <motion.div
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
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-amber-200/90 text-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4 shrink-0" /> {t('scriptMurder.executed')}
            </motion.p>
            {/* R2-128：懲罰執行後顯示倒酒視覺化 */}
            <DrinkingAnimation duration={1.2} className="mt-3 mx-auto" />
          </>
        ) : (
          <motion.button
            type="button"
            disabled={actionLoading}
            onClick={() => postScriptAction('punishment_done')}
            whileTap={{ scale: 0.97 }}
            className="mt-3 min-h-[48px] px-4 py-2 rounded-lg bg-amber-500/20 text-amber-200 font-medium games-focus-ring"
          >
            {t('scriptMurder.confirmed')}
          </motion.button>
        )}
      </motion.div>
    )
  }

  if (node.type === 'choice') {
    return (
      <motion.div
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
      </motion.div>
    )
  }

  if (node.type === 'timer') {
    return (
      <motion.div
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
      </motion.div>
    )
  }

  return null
}
