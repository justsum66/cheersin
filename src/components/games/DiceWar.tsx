'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export default function DiceWar() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [playerDice, setPlayerDice] = useState<[number, number]>([1, 1])
  const [opponentDice, setOpponentDice] = useState<[number, number]>([1, 1])
  const [rolling, setRolling] = useState(false)
  const [phase, setPhase] = useState<'waiting' | 'rolling' | 'result'>('waiting')
  const [winner, setWinner] = useState<string | null>(null)

  const players = contextPlayers.length > 0 ? contextPlayers : ['玩家1', '玩家2']
  const player1 = players[0]
  const player2 = players[1] || '對手'

  const rollDice = useCallback(() => {
    setRolling(true)
    setPhase('rolling')
    play('click')

    let count = 0
    const interval = setInterval(() => {
      setPlayerDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ])
      setOpponentDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ])
      count++
      if (count >= 10) {
        clearInterval(interval)
        const p1 = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1] as [number, number]
        const p2 = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1] as [number, number]
        setPlayerDice(p1)
        setOpponentDice(p2)
        setRolling(false)

        const sum1 = p1[0] + p1[1]
        const sum2 = p2[0] + p2[1]

        if (sum1 > sum2) {
          setWinner(player1)
          setScores(s => ({ ...s, [player1]: (s[player1] || 0) + 1 }))
          play('correct')
        } else if (sum2 > sum1) {
          setWinner(player2)
          setScores(s => ({ ...s, [player2]: (s[player2] || 0) + 1 }))
          play('wrong')
        } else {
          setWinner('平手')
          play('click')
        }
        setPhase('result')
      }
    }, 100)
  }, [player1, player2, play])

  const nextRound = () => {
    setRound(r => r + 1)
    setPhase('waiting')
    setWinner(null)
  }

  const resetGame = () => {
    setRound(1)
    setScores({})
    setPhase('waiting')
    setWinner(null)
  }

  const resultText = `${player1}: ${scores[player1] || 0}分、${player2}: ${scores[player2] || 0}分`

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main">
      <GameRules rules="雙方各擲兩顆骰子，點數大的獲勝！輸的喝酒！" rulesKey="dice-war.rules" />

      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="text-2xl font-bold text-white">第 {round} 回合</h2>
            <div className="text-white/80">{player1} vs {player2}</div>
            <button
              onClick={rollDice}
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 rounded-2xl text-white font-bold text-xl transition-colors"
            >
              擲骰子！
            </button>
          </motion.div>
        )}

        {(phase === 'rolling' || phase === 'result') && (
          <motion.div
            key="rolling"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-white font-bold">{player1}</div>
              <div className="flex gap-4">
                <motion.div
                  animate={rolling ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.1, repeat: rolling ? Infinity : 0 }}
                  className="text-6xl"
                >
                  {DICE_FACES[playerDice[0] - 1]}
                </motion.div>
                <motion.div
                  animate={rolling ? { rotate: -360 } : { rotate: 0 }}
                  transition={{ duration: 0.1, repeat: rolling ? Infinity : 0 }}
                  className="text-6xl"
                >
                  {DICE_FACES[playerDice[1] - 1]}
                </motion.div>
              </div>
              <div className="text-accent-400 font-bold text-2xl">
                總計：{playerDice[0] + playerDice[1]}
              </div>
            </div>

            <div className="text-white/40 text-2xl">VS</div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-white font-bold">{player2}</div>
              <div className="flex gap-4">
                <motion.div
                  animate={rolling ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.1, repeat: rolling ? Infinity : 0 }}
                  className="text-6xl"
                >
                  {DICE_FACES[opponentDice[0] - 1]}
                </motion.div>
                <motion.div
                  animate={rolling ? { rotate: -360 } : { rotate: 0 }}
                  transition={{ duration: 0.1, repeat: rolling ? Infinity : 0 }}
                  className="text-6xl"
                >
                  {DICE_FACES[opponentDice[1] - 1]}
                </motion.div>
              </div>
              <div className="text-accent-400 font-bold text-2xl">
                總計：{opponentDice[0] + opponentDice[1]}
              </div>
            </div>

            {phase === 'result' && winner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 mt-4"
              >
                <div className={`text-3xl font-bold ${winner === '平手' ? 'text-yellow-400' : winner === player1 ? 'text-green-400' : 'text-red-400'}`}>
                  {winner === '平手' ? '平手！再來一次！' : `${winner} 獲勝！`}
                </div>
                {winner !== '平手' && winner !== player1 && (
                  <div className="text-white/60">{player1} 喝一口！</div>
                )}
                <div className="text-white mt-2">{resultText}</div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={nextRound}
                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-bold transition-colors"
                  >
                    下一回合
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors"
                  >
                    重新開始
                  </button>
                </div>
                <CopyResultButton text={`骰子大戰 ${resultText}`} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
