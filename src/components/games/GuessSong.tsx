'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Music, Play, Pause, RefreshCw, Trophy } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'
import { GUESS_SONG_ITEMS } from '@/data/guess-song'

/** R2-139：猜歌擴充 — 題庫改為 data/guess-song，歌名＋歌詞片段文字猜題 */
const SONGS = GUESS_SONG_ITEMS

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function GuessSong() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentSong, setCurrentSong] = useState<typeof SONGS[0] | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [scores, setScores] = useState<Record<number, number>>({})
  const [usedSongs, setUsedSongs] = useState<Set<string>>(new Set())
  const [gameStarted, setGameStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timer, setTimer] = useState(30)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const nextSong = useCallback(() => {
    stopTimer()
    const available = SONGS.filter(s => !usedSongs.has(s.title))
    if (available.length === 0) {
      setCurrentSong(null)
      return
    }
    const next = available[Math.floor(Math.random() * available.length)]
    setCurrentSong(next)
    setShowHint(false)
    setShowAnswer(false)
    setIsPlaying(false)
    setTimer(30)
    setUsedSongs(prev => new Set([...prev, next.title]))
    play('click')
  }, [usedSongs, play, stopTimer])

  const startGame = useCallback(() => {
    setGameStarted(true)
    nextSong()
  }, [nextSong])

  const startTimer = useCallback(() => {
    setIsPlaying(true)
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          stopTimer()
          setIsPlaying(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer])

  const toggleTimer = useCallback(() => {
    if (isPlaying) {
      stopTimer()
      setIsPlaying(false)
    } else {
      startTimer()
    }
  }, [isPlaying, stopTimer, startTimer])

  const handleCorrect = useCallback(() => {
    if (!currentSong) return
    stopTimer()
    play('correct')
    const points = timer > 20 ? 3 : timer > 10 ? 2 : 1
    setScores(prev => ({
      ...prev,
      [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + points
    }))
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    nextSong()
  }, [currentSong, timer, currentPlayerIndex, players.length, play, nextSong, stopTimer])

  const handleWrong = useCallback(() => {
    stopTimer()
    play('wrong')
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    nextSong()
  }, [players.length, play, nextSong, stopTimer])

  const resetGame = useCallback(() => {
    stopTimer()
    setGameStarted(false)
    setCurrentSong(null)
    setScores({})
    setUsedSongs(new Set())
    setCurrentPlayerIndex(0)
    setShowHint(false)
    setShowAnswer(false)
    setTimer(30)
    setIsPlaying(false)
  }, [stopTimer])

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  const leaderboard = Object.entries(scores)
    .map(([i, score]) => ({ index: Number(i), name: players[Number(i)], score }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  const isGameOver = usedSongs.size >= SONGS.length && !currentSong
  const currentPlayer = players[currentPlayerIndex]

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="猜歌名">
      <GameRules
        rules="輪流猜歌名！由一人唱歌詞或哼旋律，其他人猜！\n猜對越快分數越高，猜錯喝一口！"
        rulesKey="guess-song.rules"
      />

      {!gameStarted ? (
        <div className="text-center">
          <Music className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <p className="text-white/70 mb-6">準備好猜歌名了嗎？</p>
          <button
            type="button"
            onClick={startGame}
            className="btn-primary px-8 py-3 text-lg games-focus-ring"
          >
            開始遊戲
          </button>
        </div>
      ) : isGameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">遊戲結束！</h2>
          {leaderboard.length > 0 && (
            <div className="mb-6">
              <p className="text-primary-400 text-xl mb-2">
                <Trophy className="inline w-6 h-6 mr-2" />
                歌神：{leaderboard[0].name} ({leaderboard[0].score} 分)
              </p>
            </div>
          )}
          <CopyResultButton
            text={`猜歌名結果：\n${leaderboard.map((e, i) => `${i + 1}. ${e.name}: ${e.score} 分`).join('\n')}`}
            label="複製結果"
          />
          <button
            type="button"
            onClick={resetGame}
            className="mt-4 btn-secondary px-6 py-2 games-focus-ring flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            再玩一次
          </button>
        </div>
      ) : (
        <>
          <p className="text-white/60 mb-2">
            輪到 <span className="text-primary-400 font-medium">{currentPlayer}</span> 唱歌
          </p>
          <p className="text-white/40 text-sm mb-4">
            剩餘 {SONGS.length - usedSongs.size + 1} 首
          </p>

          <AnimatePresence mode="wait">
            {currentSong && (
              <m.div
                key={currentSong.title}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -20 }}
                className="w-full max-w-md bg-gradient-to-br from-primary-900/40 to-secondary-900/40 rounded-2xl p-6 mb-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={toggleTimer}
                    className="w-12 h-12 rounded-full bg-primary-500/20 border border-primary-500/50 flex items-center justify-center hover:bg-primary-500/30 games-focus-ring"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 text-primary-400" /> : <Play className="w-6 h-6 text-primary-400" />}
                  </button>
                  <div className="text-center">
                    <p className={`text-3xl font-bold tabular-nums ${timer <= 10 ? 'text-red-400' : 'text-white'}`}>
                      {timer}秒
                    </p>
                  </div>
                  <div className="w-12" />
                </div>

                <div className="text-center mb-4">
                  {showAnswer ? (
                    <>
                      <h2 className="text-2xl font-bold text-primary-400">{currentSong.title}</h2>
                      <p className="text-white/60 mt-1">{currentSong.artist} · {currentSong.era}</p>
                    </>
                  ) : (
                    <h2 className="text-2xl font-bold text-white/30">??? 猜猜看</h2>
                  )}
                </div>

                {showHint && !showAnswer && (
                  <p className="text-center text-white/70 text-sm bg-white/10 rounded-lg p-3 mb-4">
                    歌詞提示：「{currentSong.hint}」
                  </p>
                )}

                <div className="flex flex-wrap gap-2 justify-center">
                  {!showHint && !showAnswer && (
                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 games-focus-ring min-h-[48px]"
                    >
                      顯示歌詞提示
                    </button>
                  )}
                  {!showAnswer && (
                    <button
                      type="button"
                      onClick={() => setShowAnswer(true)}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 games-focus-ring min-h-[48px]"
                    >
                      揭曉答案
                    </button>
                  )}
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={handleCorrect}
              className="px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 games-focus-ring min-h-[48px]"
            >
              有人猜對！
            </button>
            <button
              type="button"
              onClick={handleWrong}
              className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 games-focus-ring min-h-[48px]"
            >
              沒人猜對 (喝一口)
            </button>
          </div>

          {leaderboard.length > 0 && (
            <div className="mt-6 w-full max-w-xs bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white/50 text-xs mb-2 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> 得分排行
              </p>
              <ul className="space-y-1">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <li key={entry.index} className="flex justify-between text-sm text-white/70">
                    <span>{i === 0 && '🎤 '}{entry.name}</span>
                    <span>{entry.score} 分</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
