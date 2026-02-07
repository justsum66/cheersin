'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, RefreshCw, Trophy, Sparkles } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const FORTUNE_CATEGORIES = [
  { type: 'love', label: '愛情運', emoji: '💕', color: 'from-pink-500 to-rose-500' },
  { type: 'work', label: '工作運', emoji: '💼', color: 'from-blue-500 to-indigo-500' },
  { type: 'money', label: '財運', emoji: '💰', color: 'from-amber-500 to-yellow-500' },
  { type: 'health', label: '健康運', emoji: '💪', color: 'from-green-500 to-emerald-500' },
  { type: 'luck', label: '整體運勢', emoji: '🍀', color: 'from-purple-500 to-violet-500' },
]

const FORTUNES = {
  love: [
    { level: 5, text: '桃花朵朵開！今晚會有意想不到的邂逅！', action: '向左邊的人敬酒！' },
    { level: 4, text: '感情順遂，單身者有機會脫單！', action: '和喜歡的人乾杯！' },
    { level: 3, text: '平淡中見真情，維持現狀即可', action: '喝半杯' },
    { level: 2, text: '小心爛桃花，保持警覺', action: '喝一杯消災' },
    { level: 1, text: '愛情運低迷，建議專注自我', action: '喝兩杯轉運！' },
  ],
  work: [
    { level: 5, text: '事業大吉！貴人相助，升遷有望！', action: '請大家喝一輪！' },
    { level: 4, text: '工作順利，計畫能順利執行', action: '輕鬆喝一口' },
    { level: 3, text: '穩定發展，按部就班', action: '喝半杯' },
    { level: 2, text: '小人作祟，注意人際關係', action: '喝一杯避小人' },
    { level: 1, text: '諸事不順，建議低調行事', action: '喝兩杯轉運！' },
  ],
  money: [
    { level: 5, text: '財源滾滾！意外之財將至！', action: '發紅包或請大家喝！' },
    { level: 4, text: '正財運旺，收入穩定增長', action: '慶祝喝一口' },
    { level: 3, text: '收支平衡，量入為出', action: '喝半杯' },
    { level: 2, text: '破財在即，減少不必要開支', action: '喝一杯消財' },
    { level: 1, text: '財運低迷，避免投資冒險', action: '喝兩杯轉運！' },
  ],
  health: [
    { level: 5, text: '身體健康，精力充沛！', action: '帶大家做10個深蹲！' },
    { level: 4, text: '健康運佳，適合運動', action: '做5個伏地挺身' },
    { level: 3, text: '注意作息，適度休息', action: '喝半杯補充水分' },
    { level: 2, text: '小心感冒，注意保暖', action: '喝一杯暖身' },
    { level: 1, text: '健康亮紅燈，好好休息', action: '喝兩杯早點回家睡！' },
  ],
  luck: [
    { level: 5, text: '大吉大利！今晚一定要買樂透！', action: '請大家喝一輪！' },
    { level: 4, text: '運勢不錯，把握機會', action: '向大家敬酒' },
    { level: 3, text: '中規中矩，平安是福', action: '喝半杯' },
    { level: 2, text: '運勢低迷，凡事多加小心', action: '喝一杯避災' },
    { level: 1, text: '運勢谷底，建議早點回家', action: '喝兩杯趕快轉運！' },
  ],
}

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function FortuneDraw() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [fortune, setFortune] = useState<{ level: number; text: string; action: string } | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [history, setHistory] = useState<{ player: string; category: string; level: number }[]>([])
  /** G1.12 自訂功能：自訂籤文指令 */
  const [customActions, setCustomActions] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')

  const drawFortune = useCallback((categoryType: string) => {
    setSelectedCategory(categoryType)
    setIsDrawing(true)
    play('click')

    setTimeout(() => {
      const categoryFortunes = FORTUNES[categoryType as keyof typeof FORTUNES]
      const base = categoryFortunes[Math.floor(Math.random() * categoryFortunes.length)]
      const action = customActions.length > 0
        ? customActions[Math.floor(Math.random() * customActions.length)]
        : base.action
      setFortune({ level: base.level, text: base.text, action })
      setIsDrawing(false)

      if (base.level >= 4) {
        play('correct')
      } else if (base.level <= 2) {
        play('wrong')
      }

      setHistory(prev => [...prev, {
        player: players[currentPlayerIndex],
        category: categoryType,
        level: base.level
      }])
    }, 1500)
  }, [currentPlayerIndex, players, play, customActions])

  const nextPlayer = useCallback(() => {
    setFortune(null)
    setSelectedCategory(null)
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    play('click')
  }, [players.length, play])

  const resetGame = useCallback(() => {
    setCurrentPlayerIndex(0)
    setSelectedCategory(null)
    setFortune(null)
    setIsDrawing(false)
    setHistory([])
  }, [])

  const currentPlayer = players[currentPlayerIndex]
  const categoryData = FORTUNE_CATEGORIES.find(c => c.type === selectedCategory)

  const getLevelStars = (level: number) => '⭐'.repeat(level)
  const getLevelText = (level: number) => {
    if (level === 5) return '大吉'
    if (level === 4) return '中吉'
    if (level === 3) return '小吉'
    if (level === 2) return '凶'
    return '大凶'
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="命運抽籤">
      <GameRules
        rules="選擇想算的運勢類型，抽取你的命運籤！\n運勢好壞決定要執行的指令，可能要喝酒或請大家喝！"
        rulesKey="fortune-draw.rules"
      />

      <p className="text-white/60 mb-4">
        輪到 <span className="text-primary-400 font-medium">{currentPlayer}</span> 抽籤
      </p>

      {!fortune && !isDrawing && (
        <>
          <p className="text-white/50 text-sm mb-6">選擇想算的運勢：</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md mb-6">
            {FORTUNE_CATEGORIES.map(category => (
              <button
                key={category.type}
                type="button"
                onClick={() => drawFortune(category.type)}
                className={`p-4 rounded-xl bg-gradient-to-br ${category.color} border border-white/20 text-white hover:scale-105 transition-transform games-focus-ring min-h-[80px]`}
              >
                <p className="text-2xl mb-1">{category.emoji}</p>
                <p className="text-sm font-medium">{category.label}</p>
              </button>
            ))}
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-4"
            >
              <Sparkles className="w-full h-full text-amber-400" />
            </motion.div>
            <p className="text-white/70">抽籤中...</p>
          </motion.div>
        )}

        {fortune && categoryData && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.8, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            className={`w-full max-w-md bg-gradient-to-br ${categoryData.color} rounded-2xl p-6 mb-6 border border-white/30 shadow-lg`}
          >
            <div className="text-center text-white">
              <p className="text-4xl mb-2">{categoryData.emoji}</p>
              <p className="text-lg font-bold mb-1">{categoryData.label}</p>
              <p className="text-3xl font-bold mb-2">
                {getLevelText(fortune.level)}
              </p>
              <p className="text-lg mb-4">{getLevelStars(fortune.level)}</p>
              <div className="bg-white/20 rounded-xl p-4 mb-4">
                <p className="text-base leading-relaxed">{fortune.text}</p>
              </div>
              <div className="bg-black/20 rounded-xl p-3">
                <p className="text-sm text-white/80">執行指令：</p>
                <p className="text-lg font-bold">{fortune.action}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {fortune && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={nextPlayer}
            className="btn-primary px-6 py-2 games-focus-ring"
          >
            下一位抽籤
          </button>
          <CopyResultButton
            text={`命運抽籤：\n${currentPlayer} 抽到「${categoryData?.label}」\n結果：${getLevelText(fortune.level)} ${getLevelStars(fortune.level)}\n${fortune.text}\n指令：${fortune.action}`}
            label="複製結果"
          />
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6 w-full max-w-md bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-white/50 text-xs mb-2 flex items-center gap-1">
            <Trophy className="w-3 h-3" /> 抽籤記錄
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {history.slice(-5).reverse().map((record, i) => (
              <div key={i} className="flex justify-between text-sm text-white/70">
                <span>{record.player}</span>
                <span>{FORTUNE_CATEGORIES.find(c => c.type === record.category)?.emoji} {getLevelText(record.level)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={resetGame}
        className="mt-4 px-4 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 games-focus-ring flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        重新開始
      </button>
      <div className="mt-6 w-full max-w-md bg-white/5 rounded-xl p-3 border border-white/10">
        <p className="text-white/50 text-xs mb-2">自訂執行指令（抽籤時隨機選一條）</p>
        <div className="flex gap-2 mb-2">
          <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="例：喝一口" className="flex-1 min-h-[40px] px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm" onKeyDown={(e) => { if (e.key === 'Enter' && customInput.trim()) { setCustomActions((a) => [...a, customInput.trim()]); setCustomInput('') } }} />
          <button type="button" onClick={() => { if (customInput.trim()) { setCustomActions((a) => [...a, customInput.trim()]); setCustomInput('') } }} className="px-3 py-2 rounded-lg bg-primary-500/30 text-primary-300 text-sm">新增</button>
        </div>
        {customActions.length > 0 && <div className="flex flex-wrap gap-1">{customActions.map((act, i) => <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-white/80 text-xs">{act} <button type="button" onClick={() => setCustomActions((a) => a.filter((_, j) => j !== i))} className="text-white/50 hover:text-white">×</button></span>)}</div>}
      </div>
    </div>
  )
}
