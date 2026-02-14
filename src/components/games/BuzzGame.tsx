'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Ban, RotateCcw, Settings } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameReduceMotion } from './GameWrapper'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']
const BUZZ_OPTIONS = [3, 5, 7] as const

/** 檢查數字是否要說 Buzz（是 buzzNumber 的倍數或包含該數字） */
function shouldBuzz(n: number, buzzNumber: number): boolean {
  // 是倍數
  if (n % buzzNumber === 0) return true
  // 包含該數字
  if (String(n).includes(String(buzzNumber))) return true
  return false
}

/** G1.5-G1.6：Buzz禁語遊戲 - 遇到特定數字或其倍數要說 Buzz */
export default function BuzzGame() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const reducedMotion = useGameReduceMotion()

  // 遊戲設定
  const [buzzNumber, setBuzzNumber] = useState<typeof BUZZ_OPTIONS[number]>(7)
  const [showSettings, setShowSettings] = useState(false)
  
  // 遊戲狀態
  const [currentNumber, setCurrentNumber] = useState(1)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [loser, setLoser] = useState<string | null>(null)
  const [wrongAction, setWrongAction] = useState<'should-buzz' | 'should-number' | null>(null)
  const [buzzAnimation, setBuzzAnimation] = useState(false)
  const [history, setHistory] = useState<{ player: string; number: number; action: 'number' | 'buzz'; correct: boolean }[]>([])

  const loserClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPlayer = players[currentPlayerIndex]
  const needsBuzz = shouldBuzz(currentNumber, buzzNumber)

  // 重置遊戲
  const resetGame = useCallback(() => {
    setCurrentNumber(1)
    setCurrentPlayerIndex(0)
    setLoser(null)
    setWrongAction(null)
    setBuzzAnimation(false)
    setHistory([])
  }, [])

  // 說數字
  const sayNumber = useCallback(() => {
    if (loser) return
    
    if (needsBuzz) {
      // 應該說 Buzz 但說了數字 - 犯規！
      setWrongAction('should-buzz')
      setLoser(currentPlayer)
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([150, 80, 150])
      setHistory(prev => [...prev, { player: currentPlayer, number: currentNumber, action: 'number', correct: false }])
      
      if (loserClearTimeoutRef.current) clearTimeout(loserClearTimeoutRef.current)
      loserClearTimeoutRef.current = setTimeout(() => {
        loserClearTimeoutRef.current = null
        setWrongAction(null)
      }, 3000)
    } else {
      // 正確說數字
      play('click')
      setHistory(prev => [...prev, { player: currentPlayer, number: currentNumber, action: 'number', correct: true }])
      setCurrentNumber(prev => prev + 1)
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    }
  }, [loser, needsBuzz, currentPlayer, currentNumber, currentPlayerIndex, players.length, play])

  // 說 Buzz
  const sayBuzz = useCallback(() => {
    if (loser) return
    
    setBuzzAnimation(true)
    setTimeout(() => setBuzzAnimation(false), 300)
    
    if (!needsBuzz) {
      // 不應該說 Buzz 但說了 - 犯規！
      setWrongAction('should-number')
      setLoser(currentPlayer)
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([150, 80, 150])
      setHistory(prev => [...prev, { player: currentPlayer, number: currentNumber, action: 'buzz', correct: false }])
      
      if (loserClearTimeoutRef.current) clearTimeout(loserClearTimeoutRef.current)
      loserClearTimeoutRef.current = setTimeout(() => {
        loserClearTimeoutRef.current = null
        setWrongAction(null)
      }, 3000)
    } else {
      // 正確說 Buzz
      play('correct')
      setHistory(prev => [...prev, { player: currentPlayer, number: currentNumber, action: 'buzz', correct: true }])
      setCurrentNumber(prev => prev + 1)
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    }
  }, [loser, needsBuzz, currentPlayer, currentNumber, currentPlayerIndex, players.length, play])

  // 鍵盤控制
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || loser) return
      if (e.key === 'b' || e.key === 'B' || e.key === ' ') {
        e.preventDefault()
        sayBuzz()
      } else if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        sayNumber()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sayBuzz, sayNumber, loser])

  // 清理
  useEffect(() => {
    return () => {
      if (loserClearTimeoutRef.current) {
        clearTimeout(loserClearTimeoutRef.current)
        loserClearTimeoutRef.current = null
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="Buzz禁語遊戲">
      <GameRules rules={`從 1 開始數數，遇到 ${buzzNumber} 的倍數或包含 ${buzzNumber} 的數字，\n不能說數字要說「Buzz」！說錯的人喝。\n鍵盤：空白鍵/B 說 Buzz，Enter 說數字。`} />
      
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
            className="absolute top-14 right-4 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 z-20"
          >
            <h3 className="text-white/70 text-sm mb-2">禁語數字</h3>
            <div className="flex gap-2">
              {BUZZ_OPTIONS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setBuzzNumber(n)
                    resetGame()
                    setShowSettings(false)
                  }}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors games-focus-ring ${
                    buzzNumber === n
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* 禁語提示 */}
      <div className="flex items-center gap-2 mb-4 text-white/50 text-sm">
        <Ban className="w-4 h-4" />
        <span>禁語：{buzzNumber} 的倍數或包含 {buzzNumber}</span>
      </div>

      {/* 當前數字 */}
      <m.div
        key={currentNumber}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-6xl md:text-8xl font-mono font-bold mb-4 ${
          needsBuzz ? 'text-red-400' : 'text-primary-300'
        }`}
        aria-live="polite"
      >
        {currentNumber}
      </m.div>

      {/* 提示 */}
      {!loser && (
        <div className="mb-4 text-center">
          {needsBuzz ? (
            <m.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-red-400 font-bold text-lg flex items-center gap-2 justify-center"
            >
              <Ban className="w-5 h-5" />
              說 Buzz！
            </m.p>
          ) : (
            <p className="text-white/50 text-lg">說數字！</p>
          )}
        </div>
      )}

      {/* 輪到誰 */}
      {!loser && (
        <p className="text-white/70 text-lg mb-6">
          輪到 <span className="text-primary-400 font-bold">{currentPlayer}</span>
        </p>
      )}

      {/* Buzz 動畫 */}
      <AnimatePresence>
        {buzzAnimation && (
          <m.div
            key="buzz"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.3 }}
            className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
            aria-hidden
          >
            <span className="text-6xl font-bold text-accent-400">BUZZ!</span>
          </m.div>
        )}
      </AnimatePresence>

      {/* 輸家顯示 */}
      {loser && (
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4 mb-6"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-red-400 font-bold text-2xl md:text-3xl">
            {wrongAction === 'should-buzz' ? '應該說 Buzz！' : '應該說數字！'}
          </p>
          <p className="text-white text-xl">{loser} 喝！</p>
          <p className="text-white/50 text-sm">
            {currentNumber} {needsBuzz ? `是 ${buzzNumber} 的倍數或包含 ${buzzNumber}，要說 Buzz` : `不含 ${buzzNumber}，要說數字`}
          </p>
          <CopyResultButton text={`Buzz禁語（${buzzNumber}）：${loser} 在 ${currentNumber} 時${wrongAction === 'should-buzz' ? '應該說 Buzz 但說了數字' : '應該說數字但說了 Buzz'}，喝！`} />
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

      {/* 操作按鈕 */}
      {!loser && (
        <div className="flex gap-4">
          <m.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={sayNumber}
            className={`flex items-center gap-2 min-h-[56px] px-8 py-4 rounded-2xl font-bold text-xl shadow-lg games-focus-ring ${
              needsBuzz
                ? 'bg-white/10 text-white/70 border border-white/20'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
            }`}
            aria-label={`說 ${currentNumber}`}
          >
            {currentNumber}
          </m.button>
          
          <m.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={sayBuzz}
            className={`flex items-center gap-2 min-h-[56px] px-8 py-4 rounded-2xl font-bold text-xl shadow-lg games-focus-ring ${
              needsBuzz
                ? 'bg-gradient-to-r from-accent-500 to-purple-500 text-white'
                : 'bg-white/10 text-white/70 border border-white/20'
            }`}
            aria-label="說 Buzz"
          >
            <Ban className="w-6 h-6" />
            Buzz
          </m.button>
        </div>
      )}

      <p className="text-white/40 text-sm mt-4">鍵盤：空白鍵/B 說 Buzz，Enter 說數字</p>

      {/* 歷史紀錄 */}
      {history.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <h3 className="text-white/50 text-sm mb-2">最近紀錄</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {history.slice(-10).map((h, i) => (
              <div
                key={i}
                className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                  h.correct
                    ? h.action === 'buzz'
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                <span className="text-white/70">{h.player}</span>
                <span className="font-mono font-bold">{h.number}</span>
                {h.action === 'buzz' ? <Ban className="w-3 h-3" /> : null}
                {!h.correct && <span>✗</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
