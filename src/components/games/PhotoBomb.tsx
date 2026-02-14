'use client'

import { useState, useCallback, useRef } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Camera, RefreshCw, Trophy, Share2 } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const PHOTO_CHALLENGES = [
  { pose: '比心', description: '用手比出愛心', emoji: '💕' },
  { pose: '驚嚇表情', description: '最誇張的驚嚇臉', emoji: '😱' },
  { pose: '裝可愛', description: '最嗲的表情', emoji: '🥺' },
  { pose: '酷帥表情', description: '最帥的表情', emoji: '😎' },
  { pose: '鬼臉', description: '最醜的鬼臉', emoji: '🤪' },
  { pose: '睡著', description: '裝睡的樣子', emoji: '😴' },
  { pose: '生氣', description: '最兇的表情', emoji: '😤' },
  { pose: '笑容', description: '最燦爛的笑容', emoji: '😁' },
  { pose: '思考者', description: '沉思的樣子', emoji: '🤔' },
  { pose: '驕傲', description: '得意洋洋的表情', emoji: '😏' },
  { pose: '委屈', description: '最委屈的表情', emoji: '🥲' },
  { pose: '瘋狂', description: '最瘋狂的表情', emoji: '🤯' },
  { pose: '慶祝', description: '歡呼慶祝的樣子', emoji: '🎉' },
  { pose: '害羞', description: '害羞的表情', emoji: '☺️' },
  { pose: '困惑', description: '困惑的表情', emoji: '😕' },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3']

export default function PhotoBomb() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 2 ? contextPlayers : DEFAULT_PLAYERS

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentChallenge, setCurrentChallenge] = useState<typeof PHOTO_CHALLENGES[0] | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [votes, setVotes] = useState<Record<number, number>>({})
  const [votingMode, setVotingMode] = useState(false)
  const [hasVoted, setHasVoted] = useState<Set<number>>(new Set())
  const [roundComplete, setRoundComplete] = useState(false)
  const [usedChallenges, setUsedChallenges] = useState<Set<string>>(new Set())

  const drawChallenge = useCallback(() => {
    const available = PHOTO_CHALLENGES.filter(c => !usedChallenges.has(c.pose))
    if (available.length === 0) {
      // 重置挑戰
      setUsedChallenges(new Set())
      const challenge = PHOTO_CHALLENGES[Math.floor(Math.random() * PHOTO_CHALLENGES.length)]
      setCurrentChallenge(challenge)
      setUsedChallenges(new Set([challenge.pose]))
    } else {
      const challenge = available[Math.floor(Math.random() * available.length)]
      setCurrentChallenge(challenge)
      setUsedChallenges(prev => new Set([...prev, challenge.pose]))
    }
    setVotingMode(false)
    setHasVoted(new Set())
    setRoundComplete(false)
    play('click')
  }, [usedChallenges, play])

  const startGame = useCallback(() => {
    setGameStarted(true)
    drawChallenge()
  }, [drawChallenge])

  const startVoting = useCallback(() => {
    setVotingMode(true)
    play('click')
  }, [play])

  const voteFor = useCallback((playerIndex: number) => {
    if (hasVoted.has(currentPlayerIndex)) return
    
    play('click')
    setVotes(prev => ({
      ...prev,
      [playerIndex]: (prev[playerIndex] || 0) + 1
    }))
    setHasVoted(prev => new Set([...prev, currentPlayerIndex]))
    
    // 檢查是否所有人都投票了
    if (hasVoted.size + 1 >= players.length) {
      setRoundComplete(true)
    }
  }, [currentPlayerIndex, hasVoted, players.length, play])

  const nextRound = useCallback(() => {
    setCurrentPlayerIndex((i) => (i + 1) % players.length)
    drawChallenge()
  }, [players.length, drawChallenge])

  const resetGame = useCallback(() => {
    setGameStarted(false)
    setCurrentChallenge(null)
    setCurrentPlayerIndex(0)
    setVotes({})
    setVotingMode(false)
    setHasVoted(new Set())
    setRoundComplete(false)
    setUsedChallenges(new Set())
  }, [])

  const leaderboard = Object.entries(votes)
    .map(([i, score]) => ({ index: Number(i), name: players[Number(i)], score }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)

  const currentPlayer = players[currentPlayerIndex]

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="照片炸彈">
      <GameRules
        rules="抽取表情挑戰，擺出指定表情拍照！\n大家投票選出最佳表演，得票最少的喝酒！"
        rulesKey="photo-bomb.rules"
      />

      {!gameStarted ? (
        <div className="text-center">
          <Camera className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <p className="text-white/70 mb-6">準備好拍搞笑照片了嗎？</p>
          <button
            type="button"
            onClick={startGame}
            className="btn-primary px-8 py-3 text-lg games-focus-ring"
          >
            開始遊戲
          </button>
        </div>
      ) : (
        <>
          {!votingMode ? (
            <>
              <p className="text-white/60 mb-4">
                表演者：<span className="text-primary-400 font-medium">{currentPlayer}</span>
              </p>

              <AnimatePresence mode="wait">
                {currentChallenge && (
                  <m.div
                    key={currentChallenge.pose}
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-gradient-to-br from-primary-900/40 to-secondary-900/40 rounded-2xl p-6 mb-6 border border-white/20"
                  >
                    <div className="text-center">
                      <p className="text-6xl mb-4">{currentChallenge.emoji}</p>
                      <h2 className="text-2xl font-bold text-white mb-2">{currentChallenge.pose}</h2>
                      <p className="text-white/60">{currentChallenge.description}</p>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>

              <p className="text-white/50 text-sm mb-4 text-center">
                擺出表情，讓大家拍照或記住！
              </p>

              <button
                type="button"
                onClick={startVoting}
                className="btn-primary px-8 py-3 games-focus-ring"
              >
                開始投票
              </button>
            </>
          ) : (
            <>
              <p className="text-white/60 mb-4">投票時間！選出表演最好的人！</p>

              {!roundComplete ? (
                <>
                  <p className="text-white/50 text-sm mb-4">
                    {players[currentPlayerIndex]} 請投票（不能投自己）
                  </p>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-4">
                    {players.map((player, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => voteFor(i)}
                        disabled={i === currentPlayerIndex || hasVoted.has(currentPlayerIndex)}
                        className="p-4 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 games-focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {player}
                        {votes[i] && <span className="ml-2 text-primary-400">({votes[i]})</span>}
                      </button>
                    ))}
                  </div>
                  {hasVoted.has(currentPlayerIndex) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPlayerIndex((i) => (i + 1) % players.length)
                      }}
                      className="btn-secondary px-6 py-2 games-focus-ring"
                    >
                      下一位投票
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center w-full max-w-md">
                  <h2 className="text-xl font-bold text-white mb-4">投票結果</h2>
                  
                  {leaderboard.length > 0 && (
                    <div className="bg-white/10 rounded-xl p-4 mb-4">
                      <p className="text-primary-400 font-bold">
                        <Trophy className="inline w-5 h-5 mr-1" />
                        最佳表演：{leaderboard[0].name} ({leaderboard[0].score} 票)
                      </p>
                    </div>
                  )}

                  <p className="text-red-400 mb-4">
                    得票最少的人喝一口！
                  </p>

                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={nextRound}
                      className="btn-primary px-6 py-2 games-focus-ring"
                    >
                      下一輪
                    </button>
                    <CopyResultButton
                      text={`照片炸彈結果：\n表情：${currentChallenge?.pose}\n得票：\n${leaderboard.map((e, i) => `${i + 1}. ${e.name}: ${e.score} 票`).join('\n')}`}
                      label="複製"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="button"
            onClick={resetGame}
            className="mt-6 px-4 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 games-focus-ring flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            重新開始
          </button>
        </>
      )}
    </div>
  )
}
