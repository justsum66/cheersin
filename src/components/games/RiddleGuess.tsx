'use client'

import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { HelpCircle, RotateCcw, Trophy, Lightbulb } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useTranslation } from '@/contexts/I18nContext'
import { useGameReduceMotion } from './GameWrapper'

const RIDDLES = [
  { riddle: '什麼東西越洗越髒？', answer: '水' },
  { riddle: '什麼門永遠關不上？', answer: '球門' },
  { riddle: '什麼書買不到？', answer: '遺書' },
  { riddle: '什麼瓜不能吃？', answer: '傻瓜' },
  { riddle: '什麼馬不能騎？', answer: '海馬' },
  { riddle: '什麼雞沒有毛？', answer: '田雞' },
  { riddle: '什麼車不能坐？', answer: '風車' },
  { riddle: '什麼花不能摘？', answer: '雪花' },
  { riddle: '什麼鳥不會飛？', answer: '企鵝' },
  { riddle: '什麼魚不能吃？', answer: '木魚' },
  { riddle: '什麼帽不能戴？', answer: '螺帽' },
  { riddle: '什麼河沒有水？', answer: '銀河' },
  { riddle: '什麼山沒有石頭？', answer: '火山' },
  { riddle: '什麼火不燙人？', answer: '怒火' },
  { riddle: '什麼眼看不到？', answer: '心眼' },
]

export default function RiddleGuess() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup')
  const [currentRiddle, setCurrentRiddle] = useState<typeof RIDDLES[0] | null>(null)
  const [playerGuesses, setPlayerGuesses] = useState<Record<string, string>>({})
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [round, setRound] = useState(1)
  /** P1-215：提示系統 — 每次點擊揭示一個線索，增加懲罰（本回合使用提示則猜對只得 0.5 分） */
  const [hintClue, setHintClue] = useState<string | null>(null)
  const [hintUsed, setHintUsed] = useState(false)

  const players = contextPlayers.length >= 2 ? contextPlayers : ['玩家1', '玩家2', '玩家3']

  const startGame = useCallback(() => {
    const randomRiddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)]
    setCurrentRiddle(randomRiddle)
    setPlayerGuesses({})
    setCurrentPlayerIndex(0)
    setGameState('playing')
    setHintClue(null)
    setHintUsed(false)
    play('click')
  }, [play])

  /** P1-215：揭示線索（答案字數或首字），使用後本回合猜對得分減半 */
  const revealHint = useCallback(() => {
    if (!currentRiddle || hintClue) return
    setHintClue(`答案共 ${currentRiddle.answer.length} 個字，第一個字：「${currentRiddle.answer[0]}」`)
    setHintUsed(true)
    play('click')
  }, [currentRiddle, hintClue, play])

  const submitGuess = useCallback((player: string, guess: string) => {
    setPlayerGuesses(prev => ({ ...prev, [player]: guess }))
    
    if (currentRiddle && guess.trim() === currentRiddle.answer) {
      const points = hintUsed ? 0.5 : 1
      setScores(prev => ({ ...prev, [player]: (prev[player] || 0) + points }))
      play('correct')
    } else {
      play('wrong')
    }
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      setGameState('results')
      play('win')
    }
  }, [currentRiddle, currentPlayerIndex, players.length, play, hintUsed])

  const nextRound = useCallback(() => {
    setRound(prev => prev + 1)
    startGame()
  }, [startGame])

  const resetGame = useCallback(() => {
    setRound(1)
    setScores({})
    setGameState('setup')
    setCurrentRiddle(null)
    setPlayerGuesses({})
  }, [])

  const currentPlayer = players[currentPlayerIndex]

  const resultText = `猜謎語 - 第${round}回合\n${players.map(p => `${p}: ${scores[p] || 0}分`).join('\n')}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-900 to-orange-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto text-center">
        <m.h1 
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          猜謎語
        </m.h1>
        <p className="text-white/80 mb-8">考驗你的智慧和想像力！</p>

        <GameRules 
          rules="遊戲規則：
1. 系統給出一個謎語
2. 玩家輪流猜答案
3. 猜對得分，猜錯繼續
4. 每人都有一次作答機會
5. 最終得分最高者獲勝"
        />

        <AnimatePresence mode="wait">
          {gameState === 'setup' && (
            <m.div
              key="setup"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <HelpCircle className="w-16 h-16 mx-auto mb-6 text-amber-400" />
              <h2 className="text-2xl font-bold mb-4">準備開始</h2>
              <p className="text-white/80 mb-6">挑戰你的腦力！</p>
              <div className="mb-6">
                <p className="text-lg font-bold text-amber-400">參與玩家：</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {players.map((player, index) => (
                    <span key={index} className="px-3 py-1 bg-amber-500/20 rounded-full text-sm">
                      {player}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={startGame}
                className="games-touch-target px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                開始遊戲
              </button>
            </m.div>
          )}

          {gameState === 'playing' && currentRiddle && (
            <m.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-amber-400">{t('common.turnLabel', { n: round })}</h2>
                <p className="text-lg mb-4">
                  目前玩家：
                  <m.span
                    key={currentPlayerIndex}
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="inline-block ml-1 px-2 py-0.5 rounded-lg bg-amber-500/30 font-semibold"
                    aria-live="polite"
                  >
                    {currentPlayer}
                  </m.span>
                </p>
                <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg p-6">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                  <p className="text-2xl font-bold text-center">&quot;{currentRiddle.riddle}&quot;</p>
                </div>
              </div>

              {/* P1-215：提示按鈕 — 揭示線索會增加懲罰（本回合猜對得分減半） */}
              {hintClue && (
                <div className="mb-4 p-3 rounded-lg bg-amber-500/20 border border-amber-400/40 text-sm text-amber-100">
                  💡 提示：{hintClue}
                  {hintUsed && <span className="block mt-1 text-amber-300/80">（使用提示後本回合猜對只得 0.5 分）</span>}
                </div>
              )}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="輸入你的答案..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white text-center text-lg border border-white/20 focus:border-amber-400 outline-none"
                  autoFocus
                />
                <div className="flex gap-2 mt-4">
                  {!hintClue && (
                    <m.button
                      type="button"
                      onClick={revealHint}
                      className="games-touch-target flex-1 py-3 px-4 rounded-xl bg-amber-500/40 border border-amber-400/50 font-medium text-amber-100 hover:bg-amber-500/50 transition-colors"
                      aria-label="顯示提示（會增加懲罰）"
                      animate={reducedMotion ? undefined : { rotate: [0, -4, 4, -2, 2, 0] }}
                      transition={reducedMotion ? undefined : { repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
                    >
                      💡 提示
                    </m.button>
                  )}
                  <button
                    className="games-touch-target flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
                  >
                    提交答案
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg p-4">
                <p className="text-center">
                  還需要 {players.length - Object.keys(playerGuesses).length} 人作答
                </p>
              </div>
            </m.div>
          )}

          {gameState === 'results' && currentRiddle && (
            <m.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <Trophy className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                回合結果
              </h2>
              
              <div className="mb-6">
                <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg p-4 mb-4">
                  <p className="text-xl font-bold text-center">謎語：{currentRiddle.riddle}</p>
                  <p className="text-white/80 text-center mt-2">答案：{currentRiddle.answer}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {players.map((player, index) => {
                  const guess = playerGuesses[player] || ''
                  const isCorrect = guess.trim() === currentRiddle.answer
                  
                  return (
                    <m.div
                      key={player}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white/10 rounded-lg p-4 border-l-4 ${
                        isCorrect ? 'border-green-400' : 'border-red-400'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-amber-400">{player}</span>
                        <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                          {isCorrect ? '✓ 正確' : '✗ 錯誤'}
                        </span>
                      </div>
                      {guess && (
                        <p className="text-white/80">回答：{guess}</p>
                      )}
                    </m.div>
                  )
                })}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-center">累計得分</h3>
                <div className="grid grid-cols-2 gap-4">
                  {players.map((player) => (
                    <div key={player} className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg p-3 text-center">
                      <div className="font-bold text-amber-400">{player}</div>
                      <div className="text-2xl font-bold text-yellow-400">{scores[player] || 0}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={nextRound}
                  className="flex-1 games-touch-target py-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
                >
                  下一回合
                </button>
                <button
                  onClick={resetGame}
                  className="flex-1 games-touch-target py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium"
                >
                  <RotateCcw className="w-5 h-5 inline mr-2" />
                  重新開始
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div className="mt-6">
          <CopyResultButton 
            text={resultText}
            label="複製結果"
            className="w-full games-touch-target py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium"
          />
        </div>
      </div>
    </div>
  )
}