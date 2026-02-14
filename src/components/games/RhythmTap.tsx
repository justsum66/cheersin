'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m } from 'framer-motion'
import { Music, RefreshCw, Circle } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']
const BEATS_PER_ROUND = 8
const BPM = 120

export default function RhythmTap() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [gamePhase, setGamePhase] = useState<'ready' | 'countdown' | 'playing' | 'result'>('ready')
  const [beatTimes, setBeatTimes] = useState<number[]>([])
  const [tapTimes, setTapTimes] = useState<number[]>([])
  const [currentBeat, setCurrentBeat] = useState(0)
  const [score, setScore] = useState<Record<number, number>>({})
  const [accuracy, setAccuracy] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const beatInterval = 60000 / BPM // ms per beat

  const startCountdown = useCallback(() => {
    setGamePhase('countdown')
    setCountdown(3)
    play('click')

    const countdownInterval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(countdownInterval)
          // 開始遊戲
          startTimeRef.current = Date.now()
          const beats: number[] = []
          for (let i = 0; i < BEATS_PER_ROUND; i++) {
            beats.push(startTimeRef.current + (i + 1) * beatInterval)
          }
          setBeatTimes(beats)
          setTapTimes([])
          setCurrentBeat(0)
          setGamePhase('playing')
          play('click')

          intervalRef.current = setInterval(() => {
            setCurrentBeat(b => {
              const newBeat = b + 1
              if (newBeat >= BEATS_PER_ROUND) {
                if (intervalRef.current) clearInterval(intervalRef.current)
                setTimeout(() => {
                  setGamePhase('result')
                }, 500)
              }
              play('click')
              return newBeat
            })
          }, beatInterval)

          return 0
        }
        play('click')
        return c - 1
      })
    }, 1000)
  }, [beatInterval, play])

  const handleTap = useCallback(() => {
    if (gamePhase !== 'playing') return
    const tapTime = Date.now()
    setTapTimes(prev => [...prev, tapTime])
    play('click')
  }, [gamePhase, play])

  useEffect(() => {
    if (gamePhase === 'result' && beatTimes.length > 0) {
      // 計算準確度
      let totalDiff = 0
      let matchedBeats = 0
      
      for (const tap of tapTimes) {
        // 找到最接近的節拍
        let minDiff = Infinity
        for (const beat of beatTimes) {
          const diff = Math.abs(tap - beat)
          if (diff < minDiff) {
            minDiff = diff
          }
        }
        if (minDiff < beatInterval / 2) {
          totalDiff += minDiff
          matchedBeats++
        }
      }

      // 計算準確度 (0-100)
      const avgDiff = matchedBeats > 0 ? totalDiff / matchedBeats : beatInterval
      const rawAccuracy = Math.max(0, 100 - (avgDiff / (beatInterval / 2)) * 100)
      const tapPenalty = Math.abs(tapTimes.length - BEATS_PER_ROUND) * 5
      const finalAccuracy = Math.max(0, Math.round(rawAccuracy - tapPenalty))
      
      setAccuracy(finalAccuracy)
      setScore(prev => ({
        ...prev,
        [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + finalAccuracy
      }))
    }
  }, [gamePhase, beatTimes, tapTimes, beatInterval, currentPlayerIndex])

  const nextRound = useCallback(() => {
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    setBeatTimes([])
    setTapTimes([])
    setCurrentBeat(0)
    setGamePhase('ready')
    setAccuracy(0)
  }, [players.length])

  const resetGame = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setCurrentPlayerIndex(0)
    setBeatTimes([])
    setTapTimes([])
    setCurrentBeat(0)
    setGamePhase('ready')
    setScore({})
    setAccuracy(0)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const currentPlayer = players[currentPlayerIndex]
  const leaderboard = Object.entries(score)
    .map(([i, s]) => ({ name: players[Number(i)], score: s }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="節奏點擊">
      <GameRules
        rules="跟著節奏點擊！\n聽到節拍就點擊，準確度越高分數越高！\n低於 60 分喝酒！"
        rulesKey="rhythm-tap.rules"
      />

      <Music className="w-12 h-12 text-pink-400 mb-4" />

      {gamePhase === 'ready' && (
        <div className="text-center w-full max-w-md">
          <p className="text-white/60 mb-2">挑戰者是</p>
          <p className="text-2xl font-bold text-pink-400 mb-4">{currentPlayer}</p>
          <p className="text-white/50 text-sm mb-6">跟著節奏點擊螢幕 {BEATS_PER_ROUND} 下</p>
          <button
            type="button"
            onClick={startCountdown}
            className="btn-primary px-8 py-3 text-lg games-focus-ring bg-gradient-to-r from-pink-500 to-purple-500"
          >
            開始挑戰！
          </button>
        </div>
      )}

      {gamePhase === 'countdown' && (
        <div className="text-center">
          <m.p
            key={countdown}
            initial={reducedMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-bold text-pink-400"
          >
            {countdown}
          </m.p>
          <p className="text-white/60 mt-4">準備好...</p>
        </div>
      )}

      {gamePhase === 'playing' && (
        <div className="text-center w-full max-w-md">
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: BEATS_PER_ROUND }).map((_, i) => (
              <m.div
                key={i}
                animate={{
                  scale: i === currentBeat ? [1, 1.3, 1] : 1,
                  backgroundColor: i < currentBeat ? '#22C55E' : i === currentBeat ? '#EC4899' : 'rgba(255,255,255,0.2)',
                }}
                transition={{ duration: 0.2 }}
                className="w-6 h-6 rounded-full"
              />
            ))}
          </div>

          <m.button
            type="button"
            onClick={handleTap}
            whileTap={{ scale: 0.95 }}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center games-focus-ring shadow-lg shadow-pink-500/30"
          >
            <Circle className="w-24 h-24 text-white" fill="white" />
          </m.button>

          <p className="text-white/50 mt-4">點擊次數：{tapTimes.length}</p>
        </div>
      )}

      {gamePhase === 'result' && (
        <m.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center w-full max-w-md"
        >
          <p className="text-white/60 mb-2">準確度：</p>
          <p className={`text-5xl font-bold mb-2 ${
            accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {accuracy}%
          </p>
          <p className="text-white/50 text-sm mb-4">點擊次數：{tapTimes.length} / {BEATS_PER_ROUND}</p>

          {accuracy < 60 ? (
            <p className="text-red-400 font-bold text-xl mb-4">{currentPlayer} 喝一杯！節奏感有待加強！</p>
          ) : accuracy < 80 ? (
            <p className="text-amber-400 font-bold text-xl mb-4">還不錯！繼續練習！</p>
          ) : (
            <p className="text-green-400 font-bold text-xl mb-4">節奏大師！{currentPlayer} 免喝！</p>
          )}

          <div className="flex gap-3 justify-center">
            <button type="button" onClick={nextRound} className="btn-primary px-6 py-2 games-focus-ring">
              下一位
            </button>
            <CopyResultButton
              text={`節奏點擊：\n${currentPlayer} 準確度 ${accuracy}%`}
              label="複製"
            />
          </div>
        </m.div>
      )}

      {leaderboard.length > 0 && (
        <div className="absolute bottom-4 left-4 text-white/30 text-xs">
          {leaderboard.slice(0, 3).map((p, i) => (
            <div key={i}>{p.name}: {p.score}分</div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={resetGame}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 text-white/50 games-focus-ring"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  )
}
