'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Hand, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useGamesPlayers } from './GamesContext'
import { useGameReduceMotion } from './GameWrapper'
import CopyResultButton from './CopyResultButton'
import { useGameSound } from '@/hooks/useGameSound'
import GameRules from './GameRules'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

/** 計算數字中含有幾個 3、6、9 */
function count369(n: number): number {
  return String(n).split('').filter(c => c === '3' || c === '6' || c === '9').length
}

/** G1.3-G1.4：369拍手遊戲 - 數到含 3/6/9 的數字要拍手 */
export default function ThreeSixNineClap() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS
  const reducedMotion = useGameReduceMotion()

  // 遊戲狀態
  const [currentNumber, setCurrentNumber] = useState(1)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [isClapping, setIsClapping] = useState(false)
  const [loser, setLoser] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<'number' | 'clap' | null>(null)
  const [wrongAction, setWrongAction] = useState<'should-clap' | 'should-number' | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [history, setHistory] = useState<{ player: string; number: number; action: 'number' | 'clap'; correct: boolean }[]>([])

  const loserClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPlayer = players[currentPlayerIndex]
  const clapCount = count369(currentNumber)
  const shouldClap = clapCount > 0

  // 重置遊戲
  const resetGame = useCallback(() => {
    setCurrentNumber(1)
    setCurrentPlayerIndex(0)
    setIsClapping(false)
    setLoser(null)
    setLastAction(null)
    setWrongAction(null)
    setHistory([])
  }, [])

  // 說數字
  const sayNumber = useCallback(() => {
    if (loser) return
    setLastAction('number')
    
    if (shouldClap) {
      // 應該拍手但說了數字 - 犯規！
      setWrongAction('should-clap')
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
  }, [loser, shouldClap, currentPlayer, currentNumber, currentPlayerIndex, players.length, play])

  // 拍手
  const clap = useCallback(() => {
    if (loser) return
    setLastAction('clap')
    setIsClapping(true)
    
    // 拍手動畫
    setTimeout(() => setIsClapping(false), 300)
    
    if (!shouldClap) {
      // 不應該拍手但拍了 - 犯規！
      setWrongAction('should-number')
      setLoser(currentPlayer)
      play('wrong')
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([150, 80, 150])
      setHistory(prev => [...prev, { player: currentPlayer, number: currentNumber, action: 'clap', correct: false }])
      
      if (loserClearTimeoutRef.current) clearTimeout(loserClearTimeoutRef.current)
      loserClearTimeoutRef.current = setTimeout(() => {
        loserClearTimeoutRef.current = null
        setWrongAction(null)
      }, 3000)
    } else {
      // 正確拍手
      if (soundEnabled) {
        // 播放拍手音效
        play('click')
      }
      setHistory(prev => [...prev, { player: currentPlayer, number: currentNumber, action: 'clap', correct: true }])
      setCurrentNumber(prev => prev + 1)
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    }
  }, [loser, shouldClap, currentPlayer, currentNumber, currentPlayerIndex, players.length, play, soundEnabled])

  // 鍵盤控制
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || loser) return
      if (e.key === ' ' || e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        clap()
      } else if (e.key === 'Enter' || e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        sayNumber()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clap, sayNumber, loser])

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
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="369拍手遊戲">
      <GameRules rules={`從 1 開始數數，遇到 3、6、9 不能說出來，要拍手！\n數字有幾個 3/6/9 就拍幾下（如 33 要拍兩下）。\n說錯或拍錯的人喝！鍵盤：空白鍵拍手，Enter 說數字。`} />
      
      {/* 音效開關 */}
      <button
        type="button"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors games-focus-ring"
        aria-label={soundEnabled ? '關閉音效' : '開啟音效'}
      >
        {soundEnabled ? <Volume2 className="w-5 h-5 text-white/70" /> : <VolumeX className="w-5 h-5 text-white/70" />}
      </button>

      {/* 當前數字 */}
      <m.div
        key={currentNumber}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`text-6xl md:text-8xl font-mono font-bold mb-4 ${
          shouldClap ? 'text-red-400' : 'text-primary-300'
        }`}
        aria-live="polite"
      >
        {currentNumber}
      </m.div>

      {/* 提示 */}
      {!loser && (
        <div className="mb-4 text-center">
          {shouldClap ? (
            <m.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-red-400 font-bold text-lg flex items-center gap-2 justify-center"
            >
              <Hand className="w-5 h-5" />
              拍 {clapCount} 下！
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

      {/* 拍手動畫 */}
      <AnimatePresence>
        {isClapping && (
          <m.div
            key="clap"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.3 }}
            className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
            aria-hidden
          >
            <Hand className="w-32 h-32 text-yellow-400" />
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
            {wrongAction === 'should-clap' ? '應該拍手！' : '應該說數字！'}
          </p>
          <p className="text-white text-xl">{loser} 喝！</p>
          <p className="text-white/50 text-sm">
            {currentNumber} {shouldClap ? `含有 ${clapCount} 個 3/6/9，要拍 ${clapCount} 下` : '不含 3/6/9，要說數字'}
          </p>
          <CopyResultButton text={`369拍手：${loser} 在 ${currentNumber} 時${wrongAction === 'should-clap' ? '應該拍手但說了數字' : '應該說數字但拍了手'}，喝！`} />
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
              shouldClap
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
            onClick={clap}
            className={`flex items-center gap-2 min-h-[56px] px-8 py-4 rounded-2xl font-bold text-xl shadow-lg games-focus-ring ${
              shouldClap
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : 'bg-white/10 text-white/70 border border-white/20'
            }`}
            aria-label={`拍手${clapCount > 1 ? ` ${clapCount} 下` : ''}`}
          >
            <Hand className="w-6 h-6" />
            拍手
          </m.button>
        </div>
      )}

      <p className="text-white/40 text-sm mt-4">鍵盤：空白鍵拍手，Enter 說數字</p>

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
                    ? h.action === 'clap'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                <span className="text-white/70">{h.player}</span>
                <span className="font-mono font-bold">{h.number}</span>
                {h.action === 'clap' ? <Hand className="w-3 h-3" /> : null}
                {!h.correct && <span>✗</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
