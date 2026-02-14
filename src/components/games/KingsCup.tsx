import { useState, useRef, useEffect } from 'react'
import { m , AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp, Edit3, Save, RotateCcw } from 'lucide-react'
import { useGameSound } from '@/hooks/useGameSound'
import { logger } from '@/lib/logger'
import { useGameReduceMotion } from './GameWrapper'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamePersistence } from '@/hooks/useGamePersistence'
import { useGamesPlayers } from './GamesContext'

type CardDef = { card: string; name: string; rule: string; emoji: string; short: string }
const DEFAULT_CARDS: CardDef[] = [
  { card: 'A', name: '瀑布', rule: '所有人開始喝，抽牌者停，下一位才能停，依此類推。', emoji: '🌊', short: '瀑布' },
  { card: '2', name: '指定喝', rule: '指定任何一位玩家喝一口。', emoji: '👆', short: '指定喝' },
  { card: '3', name: '自己喝', rule: '抽牌者自己喝一口。', emoji: '🍺', short: '自己喝' },
  { card: '4', name: '地板Lady', rule: '所有女生喝一口。', emoji: '👩', short: '女生喝' },
  { card: '5', name: '舞王', rule: '抽牌者表演一個動作，最後模仿者喝。', emoji: '💃', short: '舞王' },
  { card: '6', name: '地板Dude', rule: '所有男生喝一口。', emoji: '👨', short: '男生喝' },
  { card: '7', name: '天堂', rule: '所有人舉手，最後舉的人喝。', emoji: '✋', short: '天堂' },
  { card: '8', name: '夥伴', rule: '指定一位玩家，接下來你喝他也要陪你喝。', emoji: '🤝', short: '夥伴' },
  { card: '9', name: '韻腳王', rule: '說一個詞，其他人輪流說押韻的詞，說不出來的喝。', emoji: '🎵', short: '韻腳王' },
  { card: '10', name: '話題王', rule: '說一個類別，輪流說相關的詞，說不出來的喝。', emoji: '📝', short: '話題王' },
  { card: 'J', name: '規則王', rule: '自訂一條新規則，直到遊戲結束都有效。', emoji: '📜', short: '規則王' },
  { card: 'Q', name: '問題王', rule: '只能用問句說話，不能回答問題，否則喝。', emoji: '❓', short: '問題王' },
  { card: 'K', name: '國王', rule: '往公共杯倒酒。抽到第四張 K 的人喝掉整杯。', emoji: '👑', short: '國王' }
]

type DrawRecord = { card: string; name: string; short: string; emoji: string; isFourthKing: boolean }

// G3-003: Rule Persistence
const useKingsRules = () => useGamePersistence<CardDef[]>('kings_rules', DEFAULT_CARDS)

export default function KingsCup() {
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const contextPlayers = useGamesPlayers()
  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

  // G3-004 & G3-003: Persistence
  const [rules, setRules] = useKingsRules()
  const [usedCards, setUsedCards, isLoaded, clearSave] = useGamePersistence<number[]>('kings_used', [])
  const [drawHistory, setDrawHistory] = useGamePersistence<DrawRecord[]>('kings_history', [])
  const [currentPlayerIdx, setCurrentPlayerIdx] = useGamePersistence<number>('kings_turn', 0)

  // Local state for UI only
  const [currentCard, setCurrentCard] = useState<CardDef | null>(null)
  const [kingCount, setKingCount] = useState(0)
  const [showFourthKing, setShowFourthKing] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showEditRules, setShowEditRules] = useState(false)
  const [ruleExpanded, setRuleExpanded] = useState(true)
  const [showHistory, setShowHistory] = useState(true)
  const [isDrawPending, setIsDrawPending] = useState(false)

  // 3D Motion Values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-320, 320], [15, -15])
  const rotateY = useTransform(mouseX, [-240, 240], [-15, 15])

  const drawCooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const announceRef = useRef<HTMLDivElement>(null)
  const fourthKingModalRef = useRef<HTMLDivElement>(null)
  const resetConfirmModalRef = useRef<HTMLDivElement>(null)

  const remaining = 52 - usedCards.length

  // Sync derived state from persistence
  useEffect(() => {
    if (!isLoaded) return

    // Recalculate derived state
    const kCount = usedCards.reduce((acc, idx) => {
      if (idx >= rules.length) return acc
      const card = rules[idx]
      return (card?.card === 'K') ? acc + 1 : acc
    }, 0)

    setKingCount(kCount)

    if (usedCards.length > 0) {
      const lastIdx = usedCards[usedCards.length - 1]
      if (rules[lastIdx]) setCurrentCard(rules[lastIdx])
    }
  }, [isLoaded, usedCards, rules])

  // G3-001: Card Perspective Effect Mouse Handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (reducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  // Keyboard Navigation & Focus Trap
  useEffect(() => {
    if (!showFourthKing && !showResetConfirm && !showEditRules) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFourthKing) setShowFourthKing(false)
        else if (showResetConfirm) setShowResetConfirm(false)
        else setShowEditRules(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showFourthKing, showResetConfirm, showEditRules])

  /** 54 第四張 K 出現時震動 */
  useEffect(() => {
    if (showFourthKing && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }, [showFourthKing])

  /** 27 防連點：抽牌後短暫禁用 */
  useEffect(() => {
    return () => {
      if (drawCooldownRef.current) clearTimeout(drawCooldownRef.current)
    }
  }, [])

  /** 55 牌組用完自動洗牌 */
  const reshuffleDeck = () => {
    setUsedCards([])
    setCurrentCard(null)
    setDrawHistory([])
    toast('牌組已洗牌，繼續抽牌')
  }

  const drawCard = () => {
    if (!isLoaded) return
    if (remaining <= 0) {
      reshuffleDeck()
      return
    }

    let randomIndex: number
    do {
      randomIndex = Math.floor(Math.random() * rules.length)
    } while (usedCards.filter((i) => i === randomIndex).length >= 4)

    const card = rules[randomIndex]
    const newKingCount = card.card === 'K' ? kingCount + 1 : kingCount
    const isFourthKing = card.card === 'K' && newKingCount === 4

    // Play sound based on card
    if (isFourthKing) {
      play('wrong')
    } else if (card.card === 'K') {
      play('win')
    } else {
      play('click')
    }

    setUsedCards([...usedCards, randomIndex])
    setCurrentCard(card)

    const newHistoryItem = { card: card.card, name: card.name, short: card.short, emoji: card.emoji, isFourthKing }
    setDrawHistory((prev) => [...prev, newHistoryItem])

    // G3-005: Turn Tracking
    setCurrentPlayerIdx((prev) => (prev + 1) % players.length)

    if (card.card === 'K') {
      setKingCount(newKingCount)
      if (isFourthKing) {
        setShowFourthKing(true)
      }
    }
    setRuleExpanded(true)
  }

  const reset = () => {
    setCurrentCard(null)
    setCurrentPlayerIdx(0)
    clearSave()
    setKingCount(0)
    setShowFourthKing(false)
    setShowResetConfirm(false)
    setDrawHistory([])
    setUsedCards([])
  }

  // Edit Rules Logic
  const handleRuleChange = (idx: number, newRule: string) => {
    const newRules = [...rules]
    newRules[idx] = { ...newRules[idx], rule: newRule }
    setRules(newRules)
  }

  const resetRules = () => {
    setRules(DEFAULT_CARDS)
    toast.success('規則已重置為預設')
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="國王遊戲">
      <GameRules rules={`抽牌決定命運，每張牌有對應規則。\n抽到第四張 K 的人喝掉公杯。`} rulesKey="kings-cup.rules" />

      {/* G3-005: Turn Indicator */}
      <div className="mb-4 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-2 animate-fade-in-up">
        <span className="text-white/60 text-sm">現在輪到：</span>
        <span className="text-primary-300 font-bold text-lg">{players[currentPlayerIdx]}</span>
      </div>

      {/* Card Deck Visualization */}
      <div
        className="relative mb-8 md:mb-12 w-full max-w-[16rem] sm:w-64 h-72 sm:h-80 mx-auto perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Deck Stack */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(Math.max(0, 52 - usedCards.length))].slice(0, 5).map((_, i) => (
            <div
              key={i}
              className="absolute w-48 h-72 bg-gradient-to-br from-red-800 to-red-900 rounded-2xl border border-white/10 shadow-lg"
              style={{
                transform: `translateY(${-i * 2}px) rotate(${(i - 2) * 2}deg)`,
                zIndex: 5 - i
              }}
            >
              <div className="absolute inset-2 border border-white/20 rounded-xl flex items-center justify-center">
                <span className="text-4xl font-display font-bold text-white/30">♠</span>
              </div>
            </div>
          ))}
        </div>

        {/* Drawn Card */}
        <div ref={announceRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {currentCard ? `抽到 ${currentCard.card} ${currentCard.name}，${currentCard.short}` : ''}
        </div>

        <AnimatePresence>
          {currentCard && (
            <m.div
              key={currentCard.card + usedCards.length}
              initial={reducedMotion ? false : { y: 0, rotateY: 0 }}
              animate={{ y: -20, x: 120, rotate: 12, rotateY: 0 }}
              exit={reducedMotion ? undefined : { y: 80, opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', damping: 25 }}
              className="absolute inset-0 flex items-center justify-center z-20"
              style={{ perspective: '1000px' }}
              data-testid="kings-cup-result"
            >
              {/* G3-001: Card Perspective Effect */}
              <m.div
                className="relative w-40 md:w-48 aspect-[5/7] rounded-2xl shadow-2xl transition-transform ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  rotateX: reducedMotion ? 0 : rotateX,
                  rotateY: reducedMotion ? 0 : rotateY
                }}
                initial={reducedMotion ? false : { rotateY: 180 }}
                animate={{ rotateY: 0 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 w-full h-full bg-white rounded-2xl flex flex-col items-center justify-start p-3 md:p-4 text-center border-4 border-primary-500 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.9)]" style={{ backfaceVisibility: 'hidden' }}>
                  <span className="text-4xl md:text-5xl font-display font-black text-primary-500 mb-0.5 tabular-nums" aria-hidden="true">{currentCard.card}</span>
                  <span className="text-2xl mb-1" aria-hidden="true">{currentCard.emoji}</span>
                  <span className="text-lg md:text-xl font-bold text-gray-800 mb-2 games-result-text">{currentCard.name}</span>
                  <button
                    type="button"
                    onClick={() => setRuleExpanded((e) => !e)}
                    className="min-h-[48px] min-w-[48px] flex items-center justify-center gap-1 text-primary-600 text-xs font-medium hover:underline px-2 games-focus-ring"
                    aria-expanded={ruleExpanded}
                    aria-controls="kings-rule-detail"
                    aria-label={ruleExpanded ? '收起規則' : '展開規則'}
                  >
                    {ruleExpanded ? '收起規則' : '展開規則'}
                    {ruleExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {ruleExpanded && (
                    <p id="kings-rule-detail" className="text-xs md:text-sm text-gray-600 leading-relaxed mt-2 max-w-full px-1 overflow-y-auto max-h-24 games-body">{currentCard.rule}</p>
                  )}
                  <CopyResultButton
                    text={`國王遊戲 抽到 ${currentCard.card} ${currentCard.name}：${currentCard.short}`}
                    label="複製結果"
                    className="mt-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditRules(true)}
                    className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-primary-500 hover:bg-black/5"
                    aria-label="編輯規則"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
                {/* Card Glare Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none mix-blend-overlay" />
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-6 text-center">
        <div>
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums whitespace-nowrap">{remaining}</span>
          <p className="text-white/40 text-sm">剩餘卡牌</p>
        </div>
        <div className="h-8 sm:h-12 w-px bg-white/10 self-stretch hidden sm:block" aria-hidden="true" />
        <div>
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 tabular-nums whitespace-nowrap">{kingCount}/4</span>
          <p className="text-white/40 text-sm">國王</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-14 rounded-b-lg border-2 border-amber-600/50 bg-amber-950/30 relative overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            <m.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 to-amber-500/80"
              initial={false}
              animate={{
                height: `${(kingCount / 4) * 100}%`,
              }}
              transition={{
                duration: 0.8,
                ease: [0.68, -0.55, 0.265, 1.55]
              }}
            >
              <m.div
                className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-amber-400/50 to-transparent"
                animate={kingCount > 0 ? {
                  scaleX: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </m.div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
          </div>
          <m.p
            className="text-white/40 text-xs mt-1"
            animate={kingCount === 4 ? {
              color: ['rgba(255,255,255,0.4)', 'rgba(251,191,36,0.8)', 'rgba(255,255,255,0.4)']
            } : {}}
            transition={{ duration: 1, repeat: kingCount === 4 ? Infinity : 0 }}
          >
            公杯
          </m.p>
        </div>
      </div>

      {remaining === 0 && (
        <p className="text-amber-400/90 text-sm mb-2 max-w-xs mx-auto text-center px-2">牌堆已抽完，點「抽牌」會自動洗牌後繼續</p>
      )}
      <div className="flex flex-wrap gap-3 md:gap-4 justify-center w-full max-w-md">
        <button
          type="button"
          onClick={() => {
            if (isDrawPending) return
            setIsDrawPending(true)
            if (drawCooldownRef.current) clearTimeout(drawCooldownRef.current)
            try { drawCard() } catch (e) { logger.error('[KingsCup] drawCard error', { err: e instanceof Error ? e.message : String(e) }) }
            drawCooldownRef.current = setTimeout(() => {
              drawCooldownRef.current = null
              setIsDrawPending(false)
            }, 400)
          }}
          disabled={isDrawPending}
          className="btn-primary w-40 md:w-48 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed games-focus-ring hover:scale-[1.02] active:scale-[0.98] transition-transform"
          data-testid="kings-cup-draw"
          aria-label={remaining <= 0 ? '洗牌並抽牌' : '抽牌'}
        >
          {isDrawPending ? '…' : remaining <= 0 ? '洗牌並抽牌' : '抽牌'}
        </button>
        <button type="button" onClick={() => setShowResetConfirm(true)} className="btn-secondary min-h-[48px] min-w-[48px] games-focus-ring hover:scale-[1.02] active:scale-[0.98] transition-transform">
          重置
        </button>
      </div>

      {drawHistory.length > 0 && (
        <div className="w-full max-w-md mt-6">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="min-h-[48px] min-w-[48px] flex items-center gap-2 text-white/60 hover:text-white/80 text-sm font-medium mb-2 px-2 games-focus-ring"
            aria-expanded={showHistory}
            aria-controls="kings-draw-history"
          >
            本局已抽牌 ({drawHistory.length})
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showHistory && (
            <div
              id="kings-draw-history"
              className="max-h-40 md:max-h-48 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-3 space-y-2"
              role="list"
              aria-label="本局已抽出的牌"
            >
              {drawHistory.slice().reverse().map((r, i) => (
                <div
                  key={i}
                  role="listitem"
                  className="flex items-center gap-2 text-sm text-white/90 py-2 px-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <span className="font-mono font-bold text-primary-300 w-6">{r.card}</span>
                  <span aria-hidden="true">{r.emoji}</span>
                  <span>{r.name} · {r.short}</span>
                  {r.isFourthKing && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-yellow-500/30 text-yellow-300 text-xs font-medium">
                      第四張K
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 54 最後一張 K 全屏警告：閃爍 + 震動 */}
      <AnimatePresence>
        {showFourthKing && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 safe-area-px safe-area-pb"
            onClick={() => setShowFourthKing(false)}
          >
            <m.div
              className="absolute inset-0 bg-red-950/40"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 0.5, repeat: 2 }}
            />
            <m.div
              ref={fourthKingModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="kings-fourth-king-title"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl text-center w-full max-w-md mx-4 safe-area-px border-2 border-yellow-500/50 shadow-2xl"
              tabIndex={-1}
            >
              <h2 id="kings-fourth-king-title" className="text-xl md:text-3xl font-bold text-yellow-400 mb-4">🍷 第四張國王！</h2>
              <p className="text-white/80 mb-6 text-base md:text-lg">喝掉那杯公杯吧！</p>
              <button type="button" onClick={() => setShowFourthKing(false)} className="btn-primary w-full min-h-[48px] games-focus-ring">知道了</button>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* 重置確認 */}
      <AnimatePresence>
        {showResetConfirm && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 safe-area-px safe-area-pb"
            onClick={() => setShowResetConfirm(false)}
          >
            <m.div
              ref={resetConfirmModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="kings-reset-title"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 rounded-2xl text-center w-full max-w-sm mx-4 safe-area-px"
              tabIndex={-1}
            >
              <p id="kings-reset-title" className="text-white mb-4 text-base md:text-lg">確定要重置牌堆嗎？</p>
              <div className="flex flex-wrap gap-3 md:gap-4 justify-center games-btn-group">
                <button type="button" onClick={reset} className="btn-primary min-h-[48px] min-w-[48px] games-focus-ring" data-testid="kings-cup-reset-confirm">確定重置</button>
                <button type="button" onClick={() => setShowResetConfirm(false)} className="btn-secondary min-h-[48px] min-w-[48px] games-focus-ring">取消</button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* G3-003: Edit Rules Modal */}
      <AnimatePresence>
        {showEditRules && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 safe-area-px safe-area-pb"
            onClick={() => setShowEditRules(false)}
          >
            <m.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl glass-card"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-primary-400" />
                  自訂規則
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={resetRules}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                  >
                    恢復預設
                  </button>
                  <button
                    onClick={() => setShowEditRules(false)}
                    className="text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-4 space-y-4">
                {rules.map((rule, idx) => (
                  <div key={rule.card} className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-display font-bold text-primary-400 w-8">{rule.card}</span>
                      <span className="text-xl">{rule.emoji}</span>
                      <span className="font-bold text-white text-sm">{rule.name}</span>
                    </div>
                    <textarea
                      value={rule.rule}
                      onChange={(e) => handleRuleChange(idx, e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white/90 focus:border-primary-500 focus:outline-none resize-none h-16"
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => setShowEditRules(false)}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  完成設定
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
