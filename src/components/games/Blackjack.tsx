'use client'

import { useState, useCallback, useMemo } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Coins, RotateCcw } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import { createDeck, shuffleDeck, rankLabel, suitSymbol, blackjackValue, type Card } from '@/lib/deck'

const INITIAL_CHIPS = 100
const BASE_BET = 10

/** 251–260：21 點：莊家 17 停牌、籌碼系統、雙倍下注、爆牌/輸喝 */
export default function Blackjack() {
  const { play } = useGameSound()
  const [deck, setDeck] = useState<Card[]>(() => shuffleDeck(createDeck()))
  const [playerCards, setPlayerCards] = useState<Card[]>([])
  const [dealerCards, setDealerCards] = useState<Card[]>([])
  const [phase, setPhase] = useState<'idle' | 'playing' | 'dealer' | 'result'>('idle')
  const [chips, setChips] = useState(INITIAL_CHIPS)
  const [currentBet, setCurrentBet] = useState(BASE_BET)
  const [hasDoubled, setHasDoubled] = useState(false)
  const [splitHands, setSplitHands] = useState<Card[][] | null>(null)
  const [activeSplitIndex, setActiveSplitIndex] = useState(0)
  const [consecutiveLosses, setConsecutiveLosses] = useState(0)
  const [drinksOwed, setDrinksOwed] = useState(0)
  const [lastResult, setLastResult] = useState<'win' | 'lose' | 'push' | 'bust' | null>(null)

  const currentHand = splitHands ? splitHands[activeSplitIndex] : playerCards
  const playerValue = useMemo(() => blackjackValue(currentHand), [currentHand])
  const dealerValue = useMemo(() => blackjackValue(dealerCards), [dealerCards])
  const playerBust = playerValue > 21
  const dealerBust = dealerValue > 21

  const draw = useCallback((cards: Card[], count: number): [Card[], Card[]] => {
    const d = [...cards]
    const drawn: Card[] = []
    for (let i = 0; i < count && d.length > 0; i++) {
      drawn.push(d.pop()!)
    }
    return [d, drawn]
  }, [])

  const startRound = useCallback(() => {
    play('click')
    setCurrentBet(BASE_BET)
    setSplitHands(null)
    setActiveSplitIndex(0)
    let d = shuffleDeck(createDeck())
    let p: Card[] = []
    let dealer: Card[] = []
    ;[d, p] = draw(d, 2)
    ;[d, dealer] = draw(d, 2)
    setDeck(d)
    setPlayerCards(p)
    setDealerCards(dealer)
    setPhase('playing')
    setLastResult(null)
    setHasDoubled(false)
  }, [draw, play])

  const canSplit = playerCards.length === 2 && playerCards[0].rank === playerCards[1].rank && chips >= currentBet && !hasDoubled && !splitHands

  const resolveRound = useCallback((d: Card[], hand: Card[], dealerHand: Card[], bet: number) => {
    let dd = [...d]
    let dh = [...dealerHand]
    while (blackjackValue(dh) < 17 && dd.length > 0) {
      const [newDeck, drawn] = draw(dd, 1)
      dd = newDeck
      dh = [...dh, ...drawn]
    }
    setDeck(dd)
    setDealerCards(dh)
    setPhase('dealer')
    const pv = blackjackValue(hand)
    const dv = blackjackValue(dh)
    const dealerB = dv > 21
    if (dealerB || pv > dv) {
      play('win')
      setLastResult('win')
      setConsecutiveLosses(0)
      setChips((c) => c + bet)
    } else if (pv < dv) {
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      setLastResult('lose')
      const lossCount = consecutiveLosses + 1
      setConsecutiveLosses(lossCount)
      setDrinksOwed((o) => o + (lossCount >= 3 ? 1 : 0.5))
      setChips((c) => Math.max(0, c - bet))
    } else {
      setLastResult('push')
    }
    setPhase('result')
  }, [consecutiveLosses, draw, play])

  const hit = useCallback(() => {
    const [newDeck, drawn] = draw(deck, 1)
    setDeck(newDeck)
    if (splitHands) {
      const updated = [...splitHands]
      updated[activeSplitIndex] = [...updated[activeSplitIndex], drawn[0]]
      setSplitHands(updated)
      const newHand = updated[activeSplitIndex]
      if (blackjackValue(newHand) > 21) {
        play('wrong')
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
        if (activeSplitIndex === 0) {
          setActiveSplitIndex(1)
        } else {
          setPhase('result')
          setLastResult('bust')
          setChips((c) => Math.max(0, c - currentBet * 2))
          setDrinksOwed((o) => o + 2)
          setConsecutiveLosses((c) => c + 1)
        }
      }
    } else {
      const newHand = [...playerCards, ...drawn]
      setPlayerCards(newHand)
      if (blackjackValue(newHand) > 21) {
        play('wrong')
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
        setPhase('result')
        setLastResult('bust')
        setChips((c) => Math.max(0, c - currentBet))
        setDrinksOwed((o) => o + 1)
        setConsecutiveLosses((c) => c + 1)
      }
    }
  }, [deck, playerCards, splitHands, activeSplitIndex, draw, currentBet, play])

  const handleSplit = useCallback(() => {
    if (!canSplit) return
    play('click')
    const [newDeck, drawn0] = draw(deck, 1)
    const [newDeck2, drawn1] = draw(newDeck, 1)
    const hand0 = [playerCards[0], drawn0[0]]
    const hand1 = [playerCards[1], drawn1[0]]
    setDeck(newDeck2)
    setSplitHands([hand0, hand1])
    setPlayerCards(hand0)
    setActiveSplitIndex(0)
  }, [canSplit, deck, playerCards, draw, play])

  const doubleDown = useCallback(() => {
    if (playerCards.length !== 2 || chips < currentBet) return
    play('click')
    const bet = currentBet * 2
    setCurrentBet(bet)
    setHasDoubled(true)
    const [newDeck, drawn] = draw(deck, 1)
    setDeck(newDeck)
    const newHand = [...playerCards, ...drawn]
    setPlayerCards(newHand)
    if (blackjackValue(newHand) > 21) {
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      setPhase('result')
      setLastResult('bust')
      setChips((c) => Math.max(0, c - bet))
      setDrinksOwed((o) => o + 1)
      setConsecutiveLosses((c) => c + 1)
    } else {
      resolveRound(newDeck, newHand, dealerCards, bet)
    }
  }, [deck, playerCards, dealerCards, chips, currentBet, draw, resolveRound, play])

  const resolveSplitRound = useCallback(() => {
    if (!splitHands || splitHands.length !== 2) return
    let dd = [...deck]
    let dh = [...dealerCards]
    while (blackjackValue(dh) < 17 && dd.length > 0) {
      const [newDeck, drawn] = draw(dd, 1)
      dd = newDeck
      dh = [...dh, ...drawn]
    }
    setDeck(dd)
    setDealerCards(dh)
    setPhase('dealer')
    const dv = blackjackValue(dh)
    const dealerB = dv > 21
    let chipDelta = 0
    let losses = 0
    for (const hand of splitHands) {
      const pv = blackjackValue(hand)
      if (pv > 21) {
        chipDelta -= currentBet
        losses++
      } else if (dealerB || pv > dv) {
        chipDelta += currentBet
      } else if (pv < dv) {
        chipDelta -= currentBet
        losses++
      }
    }
    setLastResult(losses === 2 ? 'lose' : losses === 0 ? 'win' : 'push')
    if (chipDelta > 0) {
      play('win')
      setConsecutiveLosses(0)
    }
    if (chipDelta < 0) {
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(100)
      const lossCount = consecutiveLosses + 1
      setConsecutiveLosses(lossCount)
      setDrinksOwed((o) => o + (lossCount >= 3 ? 1 : 0.5) * (losses || 1))
    }
    setChips((c) => Math.max(0, c + chipDelta))
    setPhase('result')
  }, [deck, dealerCards, splitHands, currentBet, consecutiveLosses, draw, play])

  const stand = useCallback(() => {
    play('click')
    if (splitHands) {
      if (activeSplitIndex === 0) {
        setActiveSplitIndex(1)
      } else {
        resolveSplitRound()
      }
    } else {
      resolveRound(deck, playerCards, dealerCards, currentBet)
    }
  }, [deck, playerCards, dealerCards, currentBet, resolveRound, splitHands, activeSplitIndex, resolveSplitRound, play])

  const reset = useCallback(() => {
    setPlayerCards([])
    setDealerCards([])
    setSplitHands(null)
    setActiveSplitIndex(0)
    setPhase('idle')
    setLastResult(null)
    setCurrentBet(BASE_BET)
  }, [])

  const renderCard = (c: Card, i: number, hidden?: boolean) => (
    <m.span
      key={`${c.suit}-${c.rank}-${i}`}
      initial={{ x: -30, y: -15, opacity: 0, scale: 0.5 }}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.1, type: 'spring', stiffness: 180, damping: 18 }}
      className="inline-flex items-center justify-center w-10 h-14 rounded-md bg-white/10 border border-white/20 text-white text-sm font-mono shadow-lg"
    >
      {hidden ? '?' : `${rankLabel(c.rank)}${suitSymbol(c.suit)}`}
    </m.span>
  )

  if (phase === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center py-4 px-4">
        <GameRules rules="21 點：莊家 17 點停牌。籌碼輸完換算喝口數。爆牌喝一杯，輸喝半杯，連輸三局喝滿杯。" />
        <p className="text-primary-400 text-sm mb-2">籌碼：{chips} · 底注 {BASE_BET}</p>
        <button
          type="button"
          onClick={startRound}
          disabled={chips < BASE_BET}
          className="mt-6 min-h-[48px] px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold flex items-center gap-2"
        >
          <Coins className="w-5 h-5" />
          發牌（下注 {currentBet}）
        </button>
      </div>
    )
  }

  if (phase === 'playing' || phase === 'dealer') {
    const showDealerHole = phase === 'playing' && dealerCards.length >= 2
    return (
      <div className="h-full flex flex-col items-center py-4 px-4 bg-gradient-to-b from-emerald-950/30 to-dark-950">
        <p className="text-primary-400 text-sm mb-2">籌碼 {chips} · 本局下注 {currentBet}</p>
        <GameRules rules="21 點：要牌或停牌，不超過 21 點且比莊家大即贏。" />
        <p className="text-white/50 text-sm mb-2">莊家</p>
        <div className="flex gap-2 mb-2 min-h-[56px]">
          {dealerCards.map((c, i) => (showDealerHole && i === 1 ? renderCard(c, i, true) : renderCard(c, i)))}
        </div>
        {phase === 'dealer' && <p className="text-primary-400 text-sm mb-2">{dealerValue} 點</p>}
        <p className="text-white/50 text-sm mt-4 mb-2">{splitHands ? `你的牌（第 ${activeSplitIndex + 1} 手）` : '你的牌'}</p>
        <div className="flex gap-2 mb-2 min-h-[56px]">
          {currentHand.map((c, i) => renderCard(c, i))}
        </div>
        <p className="text-primary-400 text-sm mb-4">{playerValue} 點</p>
        {phase === 'playing' && !playerBust && (
          <div className="flex flex-wrap gap-3 justify-center">
            <button type="button" onClick={hit} className="min-h-[48px] px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20">
              要牌
            </button>
            <button type="button" onClick={stand} className="min-h-[48px] px-6 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600">
              停牌
            </button>
            {currentHand.length === 2 && !hasDoubled && !splitHands && chips >= currentBet && (
              <button type="button" onClick={doubleDown} className="min-h-[48px] px-6 py-2 rounded-xl bg-secondary-500/50 text-white hover:bg-secondary-500/70">
                雙倍
              </button>
            )}
            {canSplit && (
              <button type="button" onClick={handleSplit} className="min-h-[48px] px-6 py-2 rounded-xl bg-accent-500/50 text-white hover:bg-accent-500/70">
                分牌
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center py-4 px-4">
      <AnimatePresence>
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 mb-4"
        >
          <p className="text-primary-400 font-bold text-lg mb-2">
            {lastResult === 'bust' && '爆牌！喝一杯'}
            {lastResult === 'lose' && '莊家贏，喝半杯（連輸三局喝滿杯）'}
            {lastResult === 'win' && '你贏了！'}
            {lastResult === 'push' && '和局'}
          </p>
          <p className="text-white/60 text-sm mb-2">
            {splitHands
              ? `手牌1: ${blackjackValue(splitHands[0])} 手牌2: ${blackjackValue(splitHands[1])} vs 莊家 ${dealerValue} 點`
              : `你的 ${playerValue} 點 vs 莊家 ${dealerValue} 點`}
          </p>
          <p className="text-primary-400 text-sm mb-2">籌碼：{chips}</p>
          {drinksOwed > 0 && <p className="text-white/80">本局累計喝 {drinksOwed} 口</p>}
          {lastResult && (
            <CopyResultButton
              text={`21點：${lastResult === 'bust' ? '爆牌喝一杯' : lastResult === 'lose' ? '莊家贏喝半杯' : lastResult === 'win' ? '你贏' : '和局'}，你的${playerValue}點 vs 莊家${dealerValue}點${drinksOwed > 0 ? `，累計喝${drinksOwed}口` : ''}`}
              className="mt-3"
            />
          )}
        </m.div>
      </AnimatePresence>
      <button
        type="button"
        onClick={reset}
        className="min-h-[48px] px-6 py-2 rounded-xl bg-white/10 text-white/80 flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        再玩一局
      </button>
    </div>
  )
}
