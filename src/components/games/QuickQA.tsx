'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Zap, RotateCcw, Clock, Trophy } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { DrinkingAnimation } from './DrinkingAnimation'
import { useGameReduceMotion } from './GameWrapper'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2']

/** G2.2 題庫系統：常識題庫擴充，供快問快答使用 */
const TRIVIA_QUESTIONS = [
  { q: '日本的首都是？', a: '東京' },
  { q: '一年有幾天？', a: '365' },
  { q: '水的化學式是？', a: 'H2O' },
  { q: '地球有幾大洲？', a: '7' },
  { q: '太陽系有幾大行星？', a: '8' },
  { q: '一打是幾個？', a: '12' },
  { q: '彩虹有幾種顏色？', a: '7' },
  { q: '人體有幾塊骨頭？', a: '206' },
  { q: '撲克牌一副有幾張？', a: '52' },
  { q: '一世紀是幾年？', a: '100' },
  { q: '最大的海洋是？', a: '太平洋' },
  { q: '法國的首都是？', a: '巴黎' },
  { q: '一天有幾小時？', a: '24' },
  { q: '一週有幾天？', a: '7' },
  { q: '地球繞太陽一圈要多久？', a: '一年/365天' },
  { q: '中國有幾個省？', a: '23' },
  { q: '奧運會幾年舉辦一次？', a: '4' },
  { q: '一個足球隊有幾人？', a: '11' },
  { q: '披頭四有幾個成員？', a: '4' },
  { q: '一分鐘有幾秒？', a: '60' },
  { q: '英國的首都是？', a: '倫敦' },
  { q: '美國有幾州？', a: '50' },
  { q: '三角形內角和幾度？', a: '180' },
  { q: '一公里等於幾公尺？', a: '1000' },
  { q: '一年有幾個月？', a: '12' },
  { q: '一公斤等於幾公克？', a: '1000' },
  { q: '長方形有幾條邊？', a: '4' },
  { q: '一打雞蛋有幾顆？', a: '12' },
  { q: '鋼琴有幾個白鍵？', a: '52' },
  { q: '奧斯卡獎幾年頒一次？', a: '1' },
  { q: '聖誕節是幾月幾日？', a: '12月25日' },
  { q: '台灣最高峰是？', a: '玉山' },
  { q: '長江是中國第幾長河？', a: '第一' },
  { q: '北極熊主要住在哪一洲？', a: '北極/北美洲' },
  { q: '蜜蜂有幾隻腳？', a: '6' },
  { q: '蜘蛛有幾隻腳？', a: '8' },
  { q: '一公升等於幾毫升？', a: '1000' },
  { q: '圓周率約等於？', a: '3.14' },
  { q: '一平方公尺等於幾平方公分？', a: '10000' },
  { q: '西洋棋有幾種棋子？', a: '6' },
]

/** G2.1-G2.2：快問快答 - 搶答常識題，答錯或最慢喝 */
export default function QuickQA() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentQ, setCurrentQ] = useState<typeof TRIVIA_QUESTIONS[0] | null>(null)
  const [usedQs, setUsedQs] = useState<Set<number>>(new Set())
  const [showAnswer, setShowAnswer] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)
  const [isRunning, setIsRunning] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [loser, setLoser] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getNextQ = useCallback(() => {
    const available = TRIVIA_QUESTIONS.map((_, i) => i).filter(i => !usedQs.has(i))
    if (available.length === 0) {
      setUsedQs(new Set())
      return TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)]
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedQs(prev => new Set([...prev, idx]))
    return TRIVIA_QUESTIONS[idx]
  }, [usedQs])

  const startRound = useCallback(() => {
    play('click')
    const q = getNextQ()
    setCurrentQ(q)
    setShowAnswer(false)
    setTimeLeft(10)
    setIsRunning(true)
    setLoser(null)
  }, [getNextQ, play])

  const revealAnswer = useCallback(() => {
    play('correct')
    setShowAnswer(true)
    setIsRunning(false)
  }, [play])

  const markCorrect = useCallback((player: string) => {
    play('correct')
    setScores(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }))
    setShowAnswer(true)
    setIsRunning(false)
  }, [play])

  const markWrong = useCallback((player: string) => {
    play('wrong')
    setLoser(player)
    setShowAnswer(true)
    setIsRunning(false)
  }, [play])

  useEffect(() => {
    if (!isRunning) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          setShowAnswer(true)
          play('wrong')
          return 0
        }
        if (prev <= 3) play('click')
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isRunning, play])

  const resetGame = useCallback(() => {
    setCurrentQ(null)
    setUsedQs(new Set())
    setShowAnswer(false)
    setTimeLeft(10)
    setIsRunning(false)
    setScores({})
    setLoser(null)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4 safe-area-px">
      <GameRules rules={`快問快答！看到題目後搶答。\n答對得分，答錯或時間到的人喝！`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">快問快答</h2>
      </div>

      {!currentQ ? (
        <m.button
          whileTap={{ scale: 0.96 }}
          onClick={startRound}
          className="px-8 py-6 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl games-focus-ring"
        >
          開始搶答！
        </m.button>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          {isRunning && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeLeft <= 3 ? 'bg-red-500/30 text-red-400' : 'bg-white/10 text-white/70'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-xl">{timeLeft}</span>
            </div>
          )}

          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-center"
          >
            <p className="text-white text-xl font-medium">{currentQ.q}</p>
          </m.div>

          {showAnswer && (
            <m.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
              <p className="text-emerald-400 font-bold text-2xl">答案：{currentQ.a}</p>
              {loser && <p className="text-red-400 mt-2">{loser} 答錯，喝！</p>}
              {timeLeft === 0 && !loser && <p className="text-red-400 mt-2">時間到！大家都喝！</p>}
              {(loser || (timeLeft === 0 && !loser)) && !reducedMotion && <DrinkingAnimation duration={1.2} className="my-3 mx-auto" />}
            </m.div>
          )}

          {isRunning && (
            <div className="flex flex-wrap gap-2 justify-center">
              {players.map(p => (
                <div key={p} className="flex gap-1">
                  <button onClick={() => markCorrect(p)} className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm games-focus-ring">✓ {p}</button>
                  <button onClick={() => markWrong(p)} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm games-focus-ring">✗</button>
                </div>
              ))}
            </div>
          )}

          {!isRunning && !showAnswer && (
            <button onClick={revealAnswer} className="px-6 py-3 rounded-xl bg-accent-500 text-white font-bold games-focus-ring">揭曉答案</button>
          )}

          {showAnswer && (
            <div className="flex gap-3">
              <button onClick={startRound} className="px-6 py-3 rounded-xl bg-primary-500 text-white font-bold games-focus-ring">下一題</button>
              <CopyResultButton text={`快問快答：${currentQ.q} 答案：${currentQ.a}`} />
            </div>
          )}
        </div>
      )}

      {Object.keys(scores).length > 0 && (
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-1 text-white/30 text-xs mb-1"><Trophy className="w-3 h-3" /> 分數</div>
          {Object.entries(scores).sort((a,b) => b[1]-a[1]).map(([p,s]) => (
            <div key={p} className="text-xs text-white/50">{p}: {s}</div>
          ))}
        </div>
      )}

      <button onClick={resetGame} className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring">
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  )
}
