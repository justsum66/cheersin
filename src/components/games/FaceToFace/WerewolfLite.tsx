'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { useGamesPlayers } from '../GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from '../GameRules'
import CopyResultButton from '../CopyResultButton'
import { FlipCard } from '@/components/ui/FlipCard'
import { Moon, Users, Eye, FlaskConical, Crosshair, Timer } from 'lucide-react'

/** WW-21：角色型別集中；R2-141 增加女巫、獵人 */
export type WerewolfRole = 'wolf' | 'villager' | 'seer' | 'witch' | 'hunter'

/** 預設玩家名稱；WW-25 可選 i18n */
function getDefaultPlayers(t: (key: string) => string): string[] {
  return Array.from({ length: 6 }, (_, i) => t('werewolf.defaultPlayer').replace('{{n}}', String(i + 1)))
}

/** 狼人殺簡化版：4-8 人，狼人 / 村民 / 預言家。夜晚狼刀、預言家查人；白天投票出局。WW-01～30 */
export default function WerewolfLite() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const defaultPlayers = useMemo(() => getDefaultPlayers(t), [t])
  const players = contextPlayers.length >= 4 && contextPlayers.length <= 8 ? contextPlayers : defaultPlayers.slice(0, 6)
  const [phase, setPhase] = useState<'idle' | 'night' | 'witch' | 'day' | 'vote' | 'result'>('idle')
  const [roles, setRoles] = useState<Record<number, WerewolfRole>>({})
  const [alive, setAlive] = useState<Set<number>>(new Set())
  const [nightTarget, setNightTarget] = useState<number | null>(null)
  const [voteTarget, setVoteTarget] = useState<number | null>(null)
  const [round, setRound] = useState(0)
  /** R2-141：獵人被投出/殺死時可帶走一人，記錄帶走目標 */
  const [hunterRevengeTarget, setHunterRevengeTarget] = useState<number | null>(null)
  /** R2-102：角色揭曉 FlipCard — 進入 result 後延遲翻面 */
  const [revealFlipped, setRevealFlipped] = useState(false)
  /** GAME-104: Night phase timer */
  const [nightTimeLeft, setNightTimeLeft] = useState(0)
  const nightTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  /** GAME-103: Role card reveal animation phase */
  const [roleRevealIdx, setRoleRevealIdx] = useState<number | null>(null)
  useEffect(() => {
    if (phase === 'result' && voteTarget != null) {
      setRevealFlipped(false)
      const t = setTimeout(() => setRevealFlipped(true), 400)
      return () => clearTimeout(t)
    }
  }, [phase, voteTarget])

  /** GAME-104: Start night timer when entering night phase */
  useEffect(() => {
    if (phase === 'night') {
      setNightTimeLeft(30)
      if (nightTimerRef.current) clearInterval(nightTimerRef.current)
      nightTimerRef.current = setInterval(() => {
        setNightTimeLeft(prev => {
          if (prev <= 1) {
            if (nightTimerRef.current) { clearInterval(nightTimerRef.current); nightTimerRef.current = null }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (nightTimerRef.current) { clearInterval(nightTimerRef.current); nightTimerRef.current = null }
    }
    return () => {
      if (nightTimerRef.current) clearInterval(nightTimerRef.current)
    }
  }, [phase])

  const n = players.length
  const wolfCount = n <= 5 ? 1 : 2
  const hasSeer = n >= 6
  /** R2-141：6 人以上有女巫，7 人以上有獵人 */
  const hasWitch = n >= 6
  const hasHunter = n >= 7

  const aliveList = useMemo(() => Array.from(alive), [alive])

  const assignRoles = useCallback(() => {
    play('click')
    const indices = Array.from({ length: n }, (_, i) => i)
    for (let k = indices.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [indices[k], indices[j]] = [indices[j], indices[k]]
    }
    const r: Record<number, WerewolfRole> = {}
    let idx = 0
    for (let i = 0; i < wolfCount; i++) r[indices[idx++]] = 'wolf'
    if (hasSeer) r[indices[idx++]] = 'seer'
    if (hasWitch) r[indices[idx++]] = 'witch'
    if (hasHunter) r[indices[idx++]] = 'hunter'
    for (; idx < n; idx++) r[indices[idx]] = 'villager'
    setRoles(r)
    setAlive(new Set(indices))
    setNightTarget(null)
    setVoteTarget(null)
    setHunterRevengeTarget(null)
    /** GAME-103: Start role reveal sequence */
    setRoleRevealIdx(0)
    setRound(1)
    setPhase('night')
  }, [n, wolfCount, hasSeer, hasWitch, hasHunter, play])

  /** 狼人刀人：先記住目標；若有女巫則進入女巫階段，否則直接結算死亡 */
  const killAtNight = useCallback((target: number) => {
    play('wrong')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setNightTarget(target)
    const witchAlive = hasWitch && aliveList.some((i) => roles[i] === 'witch')
    if (witchAlive) setPhase('witch')
    else {
      setPhase('day')
      setAlive((prev) => { const next = new Set(prev); next.delete(target); return next })
    }
  }, [play, hasWitch, aliveList, roles])
  /** R2-141：女巫救人 — 今夜無人死亡，進入白天 */
  const witchSave = useCallback(() => {
    play('click')

    setNightTarget(null)
    setPhase('day')
  }, [play])
  /** R2-141：女巫不救 — 今夜被害人出局，進入白天（保留 nightTarget 供 day 顯示） */
  const witchNoSave = useCallback(() => {
    play('click')

    setPhase('day')
    setAlive((prev) => {
      const next = new Set(prev)
      if (nightTarget != null) next.delete(nightTarget)
      return next
    })
  }, [play, nightTarget])
  const startVote = useCallback(() => { play('click'); setPhase('vote') }, [play])
  const castVoteOut = useCallback((target: number) => {
    play('wrong')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
    setVoteTarget(target)
    setAlive((prev) => {
      const next = new Set(prev)
      next.delete(target)
      return next
    })
    setPhase('result')
  }, [play])
  /** R2-141：獵人帶走一人後從存活移除 */
  const hunterTake = useCallback((target: number) => {
    play('wrong')
    setHunterRevengeTarget(target)
    setAlive((prev) => { const next = new Set(prev); next.delete(target); return next })
  }, [play])
  const nextRound = useCallback(() => {
    const wolvesLeft = alive.size > 0 && Array.from(alive).some((i) => roles[i] === 'wolf')
    const villagersWin = !wolvesLeft
    if (villagersWin || alive.size <= 2) {
      setPhase('idle')
      return
    }
    setRound((r) => r + 1)
    setNightTarget(null)
    setVoteTarget(null)
    setHunterRevengeTarget(null)
    setPhase('night')
  }, [alive, roles])
  const reset = useCallback(() => setPhase('idle'), [])

  const wolvesAlive = aliveList.filter((i) => roles[i] === 'wolf').length
  const gameOver = aliveList.length <= 2 || wolvesAlive === 0
  const villagersWin = wolvesAlive === 0

  const rulesText = t('werewolf.rules').replace('{{wolfCount}}', String(wolfCount))

  /** GAME-117: Narrator auto-script text per phase */
  const narratorText = useMemo(() => {
    if (phase === 'night') return `第 ${round} 夜，天黑請閉眼。狼人請睜眼，選擇要殺害的對象。`
    if (phase === 'witch') return '女巫請睜眼，今晚有人被害，你要使用解藥嗎？'
    if (phase === 'day') return '天亮了，請大家睜眼。昨晚的情況已經揭曉，請開始討論。'
    if (phase === 'vote') return '討論結束，請投票選出你認為是狼人的玩家。'
    return ''
  }, [phase, round])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label={t('werewolf.title')}>
      <GameRules rules={rulesText} title={t('werewolf.rulesTitle')} />
      <p className="text-white/50 text-sm mb-2 text-center">{t('werewolf.title')}</p>
      {/** GAME-117: Narrator auto-script display */}
      {narratorText && phase !== 'idle' && (
        <m.div
          key={phase}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 max-w-md text-center"
        >
          <p className="text-indigo-300 text-xs italic">🎭 {narratorText}</p>
        </m.div>
      )}

      {phase === 'idle' && (
        <m.button
          type="button"
          className="min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold games-focus-ring games-touch-target"
          onClick={assignRoles}
          whileTap={{ scale: 0.98 }}
        >
          {t('werewolf.assignAndStart')}
        </m.button>
      )}

      {phase === 'night' && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          {/** GAME-104: Night phase timer display */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Timer className={`w-4 h-4 ${nightTimeLeft <= 10 ? 'text-red-400' : 'text-white/50'}`} />
            <span className={`text-sm font-mono tabular-nums ${nightTimeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white/50'}`}>
              {nightTimeLeft}s
            </span>
          </div>
          <p className="text-white/70 mb-2">{t('werewolf.nightPrompt').replace('{{round}}', String(round))}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {aliveList.filter((i) => roles[i] !== 'wolf').map((i) => (
              <button
                key={i}
                type="button"
                className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-white text-sm games-focus-ring games-touch-target"
                onClick={() => killAtNight(i)}
              >
                {players[i]}
              </button>
            ))}
          </div>
        </m.div>
      )}

      {/* R2-141：女巫階段 — 救則無人死亡，不救則今夜被害人出局 */}
      {phase === 'witch' && nightTarget != null && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-2">女巫：今夜被刀的是 {players[nightTarget]}，要救嗎？</p>
          <div className="flex gap-2 justify-center">
            <button type="button" className="min-h-[44px] px-4 rounded-xl bg-emerald-500/30 text-white text-sm games-focus-ring" onClick={witchSave}>救</button>
            <button type="button" className="min-h-[44px] px-4 rounded-xl bg-white/10 text-white text-sm games-focus-ring" onClick={witchNoSave}>不救</button>
          </div>
        </m.div>
      )}

      {phase === 'day' && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          {nightTarget != null && (
            <p className="text-red-400 font-bold mb-2">{t('werewolf.nightVictim').replace('{{name}}', players[nightTarget])}</p>
          )}
          <p className="text-white/70 mb-4">{t('werewolf.dayDiscuss')}</p>
          <button
            type="button"
            className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring games-touch-target"
            onClick={startVote}
          >
            {t('werewolf.startVote')}
          </button>
        </m.div>
      )}

      {phase === 'vote' && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <p className="text-white/70 mb-4">{t('werewolf.votePrompt')}</p>
          {/** GAME-118: Enhanced daylight voting UI with avatar-style buttons */}
          <div className="grid grid-cols-2 gap-3 justify-center">
            {aliveList.map((i) => (
              <m.button
                key={i}
                type="button"
                className="min-h-[56px] px-4 py-3 rounded-2xl bg-white/10 hover:bg-red-500/20 text-white text-sm games-focus-ring games-touch-target border border-white/10 hover:border-red-500/40 flex flex-col items-center gap-1 transition-colors"
                onClick={() => castVoteOut(i)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-2xl">👤</span>
                <span className="font-medium">{players[i]}</span>
              </m.button>
            ))}
          </div>
        </m.div>
      )}

      {/* R2-141：獵人被投出後可選擇帶走一人 */}
      {phase === 'result' && voteTarget != null && roles[voteTarget] === 'hunter' && hunterRevengeTarget === null && (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md mb-4">
          <p className="text-white/70 mb-2">獵人 {players[voteTarget]} 請選擇帶走一人</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {aliveList.map((i) => (
              <button key={i} type="button" className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500/20 text-white text-sm games-focus-ring" onClick={() => hunterTake(i)}>
                {players[i]}
              </button>
            ))}
          </div>
        </m.div>
      )}

      {phase === 'result' && voteTarget != null && (roles[voteTarget] !== 'hunter' || hunterRevengeTarget !== null) && (
        <AnimatePresence>
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md w-full"
          >
            {/* R2-102：角色揭曉 FlipCard 翻轉 */}
            <div className="mb-4 min-h-[140px]">
              <FlipCard
                flipped={revealFlipped}
                front={
                  <div className="flex flex-col items-center justify-center h-full min-h-[120px] rounded-xl bg-white/5 border border-white/10 p-4">
                    <span className="text-white/60 text-sm mb-1">{t('werewolf.voteResult').split('{{name}}')[0]?.trim() || ''}</span>
                    <span className="text-xl font-bold text-white">{players[voteTarget]}</span>
                    <span className="text-white/40 text-sm mt-2">點擊揭曉角色</span>
                  </div>
                }
                back={
                  <div className={`flex flex-col items-center justify-center h-full min-h-[120px] rounded-xl p-4 ${roles[voteTarget] === 'wolf' ? 'bg-red-500/20 border-red-500/40' :
                    roles[voteTarget] === 'seer' ? 'bg-purple-500/20 border-purple-500/40' :
                      roles[voteTarget] === 'witch' ? 'bg-cyan-500/20 border-cyan-500/40' :
                        roles[voteTarget] === 'hunter' ? 'bg-amber-500/20 border-amber-500/40' :
                          'bg-emerald-500/20 border-emerald-500/40'
                    } border`}>
                    {roles[voteTarget] === 'wolf' && <Moon className="w-10 h-10 text-red-400 mb-2" />}
                    {roles[voteTarget] === 'seer' && <Eye className="w-10 h-10 text-purple-400 mb-2" />}
                    {roles[voteTarget] === 'witch' && <FlaskConical className="w-10 h-10 text-cyan-400 mb-2" />}
                    {roles[voteTarget] === 'hunter' && <Crosshair className="w-10 h-10 text-amber-400 mb-2" />}
                    {roles[voteTarget] === 'villager' && <Users className="w-10 h-10 text-emerald-400 mb-2" />}
                    <span className="text-lg font-bold text-white">
                      {roles[voteTarget] === 'wolf' ? t('werewolf.roleWolf') :
                        roles[voteTarget] === 'seer' ? t('werewolf.roleSeer') :
                          roles[voteTarget] === 'witch' ? '女巫' :
                            roles[voteTarget] === 'hunter' ? '獵人' : t('werewolf.roleVillager')}
                    </span>
                  </div>
                }
                onFlip={() => setRevealFlipped((f) => !f)}
                backAriaLabel={roles[voteTarget] === 'wolf' ? t('werewolf.roleWolf') : roles[voteTarget] === 'seer' ? t('werewolf.roleSeer') : roles[voteTarget] === 'witch' ? '女巫' : roles[voteTarget] === 'hunter' ? '獵人' : t('werewolf.roleVillager')}
                frontAriaLabel={players[voteTarget]}
              />
            </div>
            <CopyResultButton
              text={t('werewolf.copyTemplate')
                .replace('{{name}}', players[voteTarget])
                .replace('{{role}}', roles[voteTarget] === 'wolf' ? t('werewolf.roleWolf') : roles[voteTarget] === 'seer' ? t('werewolf.roleSeer') : roles[voteTarget] === 'witch' ? '女巫' : roles[voteTarget] === 'hunter' ? '獵人' : t('werewolf.roleVillager'))
                .replace('{{suffix}}', gameOver ? (villagersWin ? t('werewolf.copySuffixVillagersWin') : t('werewolf.copySuffixWolvesWin')) : t('werewolf.copySuffixNext'))}
              label={t('games.copyResult')}
              className="mb-4 games-focus-ring"
            />
            {gameOver ? (
              <>
                <p className="text-lg font-bold mb-4">{villagersWin ? t('werewolf.villagersWin') : t('werewolf.wolvesWin')}</p>
                <m.button
                  type="button"
                  className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring games-touch-target"
                  onClick={reset}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('werewolf.playAgain')}
                </m.button>
              </>
            ) : (
              <m.button
                type="button"
                className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring games-touch-target"
                onClick={nextRound}
                whileTap={{ scale: 0.98 }}
              >
                {t('werewolf.nextNight')}
              </m.button>
            )}
          </m.div>
        </AnimatePresence>
      )}
    </div>
  )
}
