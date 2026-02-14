'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Link2, RotateCcw, Settings, Check, X, Clock } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameReduceMotion } from './GameWrapper'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

/** 分類選項 */
const CATEGORIES = [
  { id: 'animal', name: '動物', examples: '狗、貓、大象、老虎' },
  { id: 'food', name: '食物', examples: '蘋果、漢堡、拉麵、壽司' },
  { id: 'country', name: '國家/城市', examples: '台灣、日本、紐約、巴黎' },
  { id: 'celebrity', name: '明星/名人', examples: '周杰倫、蔡依林、BTS' },
  { id: 'movie', name: '電影/動漫', examples: '復仇者聯盟、神隱少女' },
  { id: 'brand', name: '品牌', examples: 'Apple、Nike、LV、麥當勞' },
] as const

type CategoryId = typeof CATEGORIES[number]['id']

/** G1.7-G1.8：分類接龍遊戲 - 輪流說同類別的詞，卡住或重複就喝 */
export default function CategoryChain() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const reducedMotion = useGameReduceMotion()

  // 遊戲設定
  const [category, setCategory] = useState<CategoryId>('animal')
  const [showSettings, setShowSettings] = useState(false)
  const [timeLimit, setTimeLimit] = useState(10) // 秒
  
  // 遊戲狀態
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [usedWords, setUsedWords] = useState<string[]>([])
  const [currentWord, setCurrentWord] = useState('')
  const [loser, setLoser] = useState<string | null>(null)
  const [loseReason, setLoseReason] = useState<'timeout' | 'repeat' | 'skip' | null>(null)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [history, setHistory] = useState<{ player: string; word: string }[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentPlayer = players[currentPlayerIndex]
  const categoryInfo = CATEGORIES.find(c => c.id === category)!

  // 重置遊戲
  const resetGame = useCallback(() => {
    setCurrentPlayerIndex(0)
    setUsedWords([])
    setCurrentWord('')
    setLoser(null)
    setLoseReason(null)
    setTimeLeft(timeLimit)
    setIsTimerRunning(true)
    setHistory([])
    inputRef.current?.focus()
  }, [timeLimit])

  // 切換分類
  const changeCategory = useCallback((newCategory: CategoryId) => {
    setCategory(newCategory)
    resetGame()
    setShowSettings(false)
  }, [resetGame])

  // 提交答案
  const submitWord = useCallback(() => {
    if (loser || !currentWord.trim()) return
    
    const word = currentWord.trim()
    
    // 檢查是否重複
    if (usedWords.includes(word)) {
      setLoseReason('repeat')
      setLoser(currentPlayer)
      setIsTimerRunning(false)
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([150, 80, 150])
      return
    }
    
    // 答案正確
    play('correct')
    setUsedWords(prev => [...prev, word])
    setHistory(prev => [...prev, { player: currentPlayer, word }])
    setCurrentWord('')
    setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    setTimeLeft(timeLimit)
    inputRef.current?.focus()
  }, [loser, currentWord, usedWords, currentPlayer, currentPlayerIndex, players.length, timeLimit, play])

  // 跳過（認輸）
  const skipTurn = useCallback(() => {
    if (loser) return
    setLoseReason('skip')
    setLoser(currentPlayer)
    setIsTimerRunning(false)
    play('wrong')
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([150, 80, 150])
  }, [loser, currentPlayer, play])

  // 計時器
  useEffect(() => {
    if (!isTimerRunning || loser) return
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // 時間到！
          setLoseReason('timeout')
          setLoser(currentPlayer)
          setIsTimerRunning(false)
          play('wrong')
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200])
          return 0
        }
        if (prev <= 3) play('click') // 最後 3 秒警告音
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning, loser, currentPlayer, play])

  // 鍵盤控制
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        submitWord()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        skipTurn()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [submitWord, skipTurn])

  // 自動聚焦輸入框
  useEffect(() => {
    if (!loser) inputRef.current?.focus()
  }, [loser, currentPlayerIndex])

  const loseReasonText = loseReason === 'timeout' ? '時間到！' : loseReason === 'repeat' ? '重複了！' : '放棄了！'

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="分類接龍遊戲">
      <GameRules rules={`選定分類後，輪流說出該類別的詞語。\n不能重複！${timeLimit} 秒內答不出來、重複或放棄的人喝！\n鍵盤：Enter 確認，Esc 放棄。`} />
      
      {/* 設定按鈕 */}
      <button
        type="button"
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors games-focus-ring"
        aria-label="設定"
      >
        <Settings className="w-5 h-5 text-white/70" />
      </button>

      {/* 設定面板 */}
      <AnimatePresence>
        {showSettings && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-4 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 z-20 min-w-[200px]"
          >
            <h3 className="text-white/70 text-sm mb-2">選擇分類</h3>
            <div className="flex flex-col gap-2 mb-4">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => changeCategory(c.id)}
                  className={`px-4 py-2 rounded-lg text-left transition-colors games-focus-ring ${
                    category === c.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <span className="font-bold">{c.name}</span>
                  <span className="text-xs block text-white/50">{c.examples}</span>
                </button>
              ))}
            </div>
            <h3 className="text-white/70 text-sm mb-2">時間限制</h3>
            <div className="flex gap-2">
              {[5, 10, 15].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeLimit(t)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors games-focus-ring ${
                    timeLimit === t
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {t}秒
                </button>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* 分類標題 */}
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-primary-400" />
        <span className="text-xl font-bold text-white">{categoryInfo.name}接龍</span>
      </div>

      {/* 計時器 */}
      {!loser && (
        <m.div
          key={timeLeft}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-full ${
            timeLeft <= 3 ? 'bg-red-500/30 text-red-400' : 'bg-white/10 text-white/70'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold text-xl">{timeLeft}</span>
        </m.div>
      )}

      {/* 輪到誰 */}
      {!loser && (
        <p className="text-white/70 text-lg mb-4">
          輪到 <span className="text-primary-400 font-bold">{currentPlayer}</span>
        </p>
      )}

      {/* 輸家顯示 */}
      {loser && (
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 mb-6"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-red-400 font-bold text-2xl md:text-3xl">{loseReasonText}</p>
          <p className="text-white text-xl">{loser} 喝！</p>
          <CopyResultButton text={`${categoryInfo.name}接龍：${loser} ${loseReasonText.replace('！', '')}，喝！已說過：${usedWords.slice(-5).join('、')}`} />
          <button
            type="button"
            onClick={resetGame}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition-colors games-focus-ring"
          >
            <RotateCcw className="w-5 h-5" />
            再玩一局
          </button>
        </m.div>
      )}

      {/* 輸入區 */}
      {!loser && (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <div className="flex gap-2 w-full">
            <input
              ref={inputRef}
              type="text"
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value)}
              placeholder={`說一個${categoryInfo.name}...`}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 games-focus-ring"
              aria-label={`輸入${categoryInfo.name}`}
            />
            <m.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={submitWord}
              disabled={!currentWord.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed games-focus-ring"
              aria-label="確認"
            >
              <Check className="w-5 h-5" />
            </m.button>
            <m.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={skipTurn}
              className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 games-focus-ring"
              aria-label="放棄"
              title="放棄（Esc）"
            >
              <X className="w-5 h-5" />
            </m.button>
          </div>
          <p className="text-white/40 text-sm">Enter 確認 · Esc 放棄</p>
        </div>
      )}

      {/* 已說過的詞 */}
      {usedWords.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="text-white/50 text-sm mb-2">已說過（{usedWords.length} 個）</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {usedWords.slice(-15).map((word, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm"
              >
                {word}
              </span>
            ))}
            {usedWords.length > 15 && (
              <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-sm">
                +{usedWords.length - 15} 更多
              </span>
            )}
          </div>
        </div>
      )}

      {/* 歷史紀錄 */}
      {history.length > 0 && (
        <div className="mt-4 w-full max-w-md">
          <h3 className="text-white/50 text-sm mb-2">最近紀錄</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {history.slice(-8).map((h, i) => (
              <div
                key={i}
                className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1"
              >
                <span className="text-white/70">{h.player}</span>
                <span className="font-bold">{h.word}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
