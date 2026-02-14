'use client'

import { useState, useCallback, useEffect } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Heart, Send, RotateCcw, Trophy } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { VoteBarChart } from './VoteBarChart'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const COMPLIMENTS = [
  '你今天看起來特別有魅力',
  '你的笑容真的很迷人',
  '你的穿搭品味很棒',
  '你很有幽默感',
  '你的想法總是很有創意',
  '你做菜一定很好吃',
  '你的聲音很好聽',
  '你很會照顧別人',
  '你的專業能力很強',
  '你的人緣一定很好',
  '你很有耐心',
  '你學習能力很強',
  '你的記憶力很棒',
  '你很懂得欣賞別人',
  '你很有責任感',
  '你的判斷力很準確',
  '你很會鼓舞別人',
  '你的執行力很強',
  '你很會規劃事情',
  '你很有同理心'
]

export default function ComplimentBattle() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'voting' | 'results'>('setup')
  const [currentCompliment, setCurrentCompliment] = useState('')
  const [compliments, setCompliments] = useState<Record<string, string>>({})
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [currentVoter, setCurrentVoter] = useState(0)
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})

  const players = contextPlayers.length >= 3 ? contextPlayers : ['玩家1', '玩家2', '玩家3', '玩家4']

  const startGame = useCallback(() => {
    const randomCompliment = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)]
    setCurrentCompliment(randomCompliment)
    setCompliments({})
    setVotes({})
    setGameState('playing')
    play('click')
  }, [play])

  const submitCompliment = useCallback((player: string, compliment: string) => {
    setCompliments(prev => ({ ...prev, [player]: compliment }))
    if (Object.keys(compliments).length + 1 === players.length) {
      setGameState('voting')
      setCurrentVoter(0)
      play('correct')
    }
  }, [compliments, players.length, play])

  const submitVote = useCallback((targetPlayer: string) => {
    setVotes(prev => ({
      ...prev,
      [targetPlayer]: (prev[targetPlayer] || 0) + 1
    }))
    
    if (currentVoter < players.length - 1) {
      setCurrentVoter(prev => prev + 1)
    } else {
      // Calculate winner and update scores
      const winner = Object.keys(votes).reduce((a, b) => 
        (votes[a] || 0) > (votes[b] || 0) ? a : b
      )
      
      setScores(prev => ({
        ...prev,
        [winner]: (prev[winner] || 0) + 1
      }))
      
      setGameState('results')
      play('win')
    }
  }, [currentVoter, players.length, votes, play])

  const nextRound = useCallback(() => {
    setRound(prev => prev + 1)
    startGame()
  }, [startGame])

  const resetGame = useCallback(() => {
    setRound(1)
    setScores({})
    setGameState('setup')
    setCurrentCompliment('')
    setCompliments({})
    setVotes({})
  }, [])

  const getVotingPlayer = () => players[currentVoter]
  const getVotedPlayers = () => Object.keys(compliments).filter(p => p !== getVotingPlayer())

  const resultText = `讚美大戰 - 第${round}回合\n${players.map(p => `${p}: ${scores[p] || 0}勝`).join('\n')}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-rose-900 to-purple-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto text-center">
        <m.h1 
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          讚美大戰
        </m.h1>
        <p className="text-white/80 mb-8">互相讚美，由大家投票選出最棒的！</p>

        <GameRules 
          rules="遊戲規則：
1. 系統給出一個讚美主題
2. 每位玩家都要讚美其他所有人
3. 讚美內容要真誠且具體
4. 所有人都讚美完後開始投票
5. 每人投一票給收到最棒讚美的玩家
6. 得票最多的人獲勝並得分
7. 最終得分最高者為讚美王"
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
              <Heart className="w-16 h-16 mx-auto mb-6 text-pink-400" />
              <h2 className="text-2xl font-bold mb-4">準備開始</h2>
              <p className="text-white/80 mb-6">點擊下方按鈕開始讚美大戰</p>
              <div className="mb-6">
                <p className="text-lg font-bold text-pink-400">參與玩家：</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {players.map((player, index) => (
                    <span key={index} className="px-3 py-1 bg-pink-500/20 rounded-full text-sm">
                      {player}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={startGame}
                className="games-touch-target px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                開始遊戲
              </button>
            </m.div>
          )}

          {gameState === 'playing' && (
            <m.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4 text-pink-400">讚美主題</h2>
                <p className="text-xl bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-lg p-4">
                  {currentCompliment}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-lg mb-4">請每位玩家輪流讚美其他人：</p>
                <div className="space-y-3">
                  {players.map((player, index) => (
                    <m.div
                      key={player}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-pink-400">{player}</span>
                        {compliments[player] ? (
                          <span className="text-green-400">✓ 已完成</span>
                        ) : (
                          <span className="text-yellow-400">進行中...</span>
                        )}
                      </div>
                      {compliments[player] && (
                        <p className="text-white/80 mt-2 text-left">&quot;{compliments[player]}&quot;</p>
                      )}
                    </m.div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-lg p-4">
                <p className="text-center">
                  {Object.keys(compliments).length === players.length 
                    ? '所有人都已完成讚美！準備進入投票階段' 
                    : `還需要 ${players.length - Object.keys(compliments).length} 人完成讚美`}
                </p>
              </div>
            </m.div>
          )}

          {gameState === 'voting' && (
            <m.div
              key="voting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4 text-rose-400">投票階段</h2>
                <p className="text-lg mb-2">目前投票者：{getVotingPlayer()}</p>
                <p className="text-white/80">請投給你認為收到最棒讚美的玩家</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {getVotedPlayers().map((player) => (
                  <m.button
                    key={player}
                    onClick={() => submitVote(player)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-xl p-4 border border-rose-400/30 hover:border-rose-400/50 transition-all duration-300 text-left"
                  >
                    <div className="font-bold text-rose-400 mb-2">{player}</div>
<p className="text-white/80">&quot;{compliments[player]}&quot;</p>
                  </m.button>
                ))}
              </div>

              <div className="w-full bg-white/10 rounded-full h-2">
                <m.div 
                  className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentVoter + 1) / players.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-center text-white/80 mt-2">
                {t('common.votesProgress', { current: currentVoter + 1, total: players.length })}
              </p>
            </m.div>
          )}

          {gameState === 'results' && (
            <m.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <Trophy className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                本回合結果
              </h2>
              
              <div className="mb-8">
                <VoteBarChart
                  items={Object.entries(votes)
                    .sort(([, a], [, b]) => b - a)
                    .map(([player, count]) => ({
                      label: player,
                      count,
                      subtitle: compliments[player],
                    }))}
                  reducedMotion={!!reducedMotion}
                  highlightFirst
                />
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-center">累計得分</h3>
                <div className="grid grid-cols-2 gap-4">
                  {players.map((player) => (
                    <div key={player} className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-lg p-3 text-center">
                      <div className="font-bold text-pink-400">{player}</div>
                      <div className="text-2xl font-bold text-yellow-400">{scores[player] || 0}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={nextRound}
                  className="flex-1 games-touch-target py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
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