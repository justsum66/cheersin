'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, RefreshCw, Trophy, ArrowRight } from 'lucide-react'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const TEAM_CHALLENGES = [
  { category: '動物', words: ['貓', '狗', '獅子', '老虎', '大象', '熊貓', '企鵝', '海豚'] },
  { category: '食物', words: ['蘋果', '香蕉', '漢堡', '披薩', '壽司', '火鍋', '蛋糕', '冰淇淋'] },
  { category: '職業', words: ['醫生', '老師', '警察', '廚師', '工程師', '藝術家', '運動員', '歌手'] },
  { category: '電影', words: ['星際大戰', '復仇者', '哈利波特', '鐵達尼號', '神鬼奇航', '玩具總動員'] },
  { category: '國家', words: ['日本', '美國', '法國', '英國', '義大利', '澳洲', '加拿大', '韓國'] },
  { category: '運動', words: ['籃球', '足球', '游泳', '跑步', '網球', '高爾夫', '滑雪', '瑜伽'] },
  { category: '水果', words: ['西瓜', '葡萄', '草莓', '芒果', '鳳梨', '櫻桃', '奇異果', '檸檬'] },
  { category: '城市', words: ['東京', '紐約', '巴黎', '倫敦', '台北', '首爾', '香港', '新加坡'] },
]

const DEFAULT_PLAYERS = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

export default function TeamGuess() {
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  const players = contextPlayers.length >= 4 ? contextPlayers : DEFAULT_PLAYERS

  const [team1, setTeam1] = useState<string[]>([])
  const [team2, setTeam2] = useState<string[]>([])
  const [teamScores, setTeamScores] = useState<{ team1: number; team2: number }>({ team1: 0, team2: 0 })
  const [currentTeam, setCurrentTeam] = useState<1 | 2>(1)
  const [currentChallenge, setCurrentChallenge] = useState<typeof TEAM_CHALLENGES[0] | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [teamsFormed, setTeamsFormed] = useState(false)
  const [roundScore, setRoundScore] = useState(0)
  const [showWord, setShowWord] = useState(true)
  const [usedCategories, setUsedCategories] = useState<Set<string>>(new Set())

  const formTeams = useCallback(() => {
    const shuffled = [...players].sort(() => Math.random() - 0.5)
    const mid = Math.ceil(shuffled.length / 2)
    setTeam1(shuffled.slice(0, mid))
    setTeam2(shuffled.slice(mid))
    setTeamsFormed(true)
    play('click')
  }, [players, play])

  const startRound = useCallback(() => {
    const available = TEAM_CHALLENGES.filter(c => !usedCategories.has(c.category))
    if (available.length === 0) {
      setCurrentChallenge(null)
      return
    }
    const challenge = available[Math.floor(Math.random() * available.length)]
    setCurrentChallenge(challenge)
    setCurrentWordIndex(0)
    setRoundScore(0)
    setShowWord(true)
    setUsedCategories(prev => new Set([...prev, challenge.category]))
    setGameStarted(true)
    play('click')
  }, [usedCategories, play])

  const handleCorrect = useCallback(() => {
    if (!currentChallenge) return
    play('correct')
    setRoundScore(prev => prev + 1)
    
    if (currentWordIndex < currentChallenge.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1)
      setShowWord(true)
    } else {
      // 回合結束
      const finalScore = roundScore + 1
      if (currentTeam === 1) {
        setTeamScores(prev => ({ ...prev, team1: prev.team1 + finalScore }))
      } else {
        setTeamScores(prev => ({ ...prev, team2: prev.team2 + finalScore }))
      }
      setCurrentChallenge(null)
      setGameStarted(false)
      setCurrentTeam(prev => prev === 1 ? 2 : 1)
    }
  }, [currentChallenge, currentWordIndex, roundScore, currentTeam, play])

  const handleSkip = useCallback(() => {
    if (!currentChallenge) return
    play('wrong')
    
    if (currentWordIndex < currentChallenge.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1)
      setShowWord(true)
    } else {
      // 回合結束
      if (currentTeam === 1) {
        setTeamScores(prev => ({ ...prev, team1: prev.team1 + roundScore }))
      } else {
        setTeamScores(prev => ({ ...prev, team2: prev.team2 + roundScore }))
      }
      setCurrentChallenge(null)
      setGameStarted(false)
      setCurrentTeam(prev => prev === 1 ? 2 : 1)
    }
  }, [currentChallenge, currentWordIndex, roundScore, currentTeam, play])

  const resetGame = useCallback(() => {
    setTeam1([])
    setTeam2([])
    setTeamScores({ team1: 0, team2: 0 })
    setCurrentTeam(1)
    setCurrentChallenge(null)
    setCurrentWordIndex(0)
    setGameStarted(false)
    setTeamsFormed(false)
    setRoundScore(0)
    setShowWord(true)
    setUsedCategories(new Set())
  }, [])

  const currentTeamMembers = currentTeam === 1 ? team1 : team2
  const currentWord = currentChallenge?.words[currentWordIndex]
  const isGameOver = usedCategories.size >= TEAM_CHALLENGES.length && !currentChallenge
  const winner = teamScores.team1 > teamScores.team2 ? 'team1' : teamScores.team1 < teamScores.team2 ? 'team2' : 'tie'

  return (
    <div className="flex flex-col items-center justify-center h-full py-4 md:py-6 px-4 safe-area-px" role="main" aria-label="團隊猜謎">
      <GameRules
        rules="兩隊輪流競賽！一人比劃其他人猜！\n猜對越多分數越高，輸的隊伍成員各喝一口！"
        rulesKey="team-guess.rules"
      />

      {!teamsFormed ? (
        <div className="text-center">
          <Users className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <p className="text-white/70 mb-4">玩家：{players.join('、')}</p>
          <p className="text-white/50 text-sm mb-6">將隨機分成兩隊進行對抗！</p>
          <button
            type="button"
            onClick={formTeams}
            className="btn-primary px-8 py-3 text-lg games-focus-ring"
          >
            分隊開始
          </button>
        </div>
      ) : isGameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">遊戲結束！</h2>
          <div className="flex gap-8 justify-center mb-6">
            <div className={`p-4 rounded-xl ${winner === 'team1' ? 'bg-green-500/20 border-2 border-green-500' : 'bg-white/10'}`}>
              <p className="text-white/70 text-sm mb-1">隊伍 1</p>
              <p className="text-2xl font-bold text-white">{teamScores.team1} 分</p>
              {winner === 'team1' && <Trophy className="w-6 h-6 text-amber-400 mx-auto mt-2" />}
            </div>
            <div className={`p-4 rounded-xl ${winner === 'team2' ? 'bg-green-500/20 border-2 border-green-500' : 'bg-white/10'}`}>
              <p className="text-white/70 text-sm mb-1">隊伍 2</p>
              <p className="text-2xl font-bold text-white">{teamScores.team2} 分</p>
              {winner === 'team2' && <Trophy className="w-6 h-6 text-amber-400 mx-auto mt-2" />}
            </div>
          </div>
          <p className="text-red-400 text-lg mb-4">
            {winner === 'tie' ? '平手！兩隊都喝一口！' : `${winner === 'team1' ? '隊伍 2' : '隊伍 1'} 的成員各喝一口！`}
          </p>
          <CopyResultButton
            text={`團隊猜謎結果：\n隊伍1 (${team1.join('、')}): ${teamScores.team1} 分\n隊伍2 (${team2.join('、')}): ${teamScores.team2} 分\n${winner === 'tie' ? '平手！' : `${winner === 'team1' ? '隊伍1' : '隊伍2'} 獲勝！`}`}
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
      ) : !gameStarted ? (
        <div className="text-center w-full max-w-md">
          <div className="flex gap-4 justify-center mb-6">
            <div className={`flex-1 p-4 rounded-xl ${currentTeam === 1 ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-white/10'}`}>
              <p className="text-white/70 text-sm mb-2">隊伍 1</p>
              <p className="text-white font-medium">{team1.join('、')}</p>
              <p className="text-2xl font-bold text-white mt-2">{teamScores.team1} 分</p>
            </div>
            <div className={`flex-1 p-4 rounded-xl ${currentTeam === 2 ? 'bg-secondary-500/20 border-2 border-secondary-500' : 'bg-white/10'}`}>
              <p className="text-white/70 text-sm mb-2">隊伍 2</p>
              <p className="text-white font-medium">{team2.join('、')}</p>
              <p className="text-2xl font-bold text-white mt-2">{teamScores.team2} 分</p>
            </div>
          </div>
          <p className="text-white/70 mb-4">
            輪到 <span className="text-primary-400 font-bold">隊伍 {currentTeam}</span> 出題
          </p>
          <p className="text-white/50 text-sm mb-4">
            剩餘 {TEAM_CHALLENGES.length - usedCategories.size} 個類別
          </p>
          <button
            type="button"
            onClick={startRound}
            className="btn-primary px-8 py-3 text-lg games-focus-ring"
          >
            開始回合
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between w-full max-w-md mb-4">
            <p className="text-white/60">
              隊伍 {currentTeam}：<span className="text-primary-400">{currentTeamMembers.join('、')}</span>
            </p>
            <p className="text-amber-400 font-bold">本回合：{roundScore} 分</p>
          </div>

          <AnimatePresence mode="wait">
            {currentChallenge && currentWord && (
              <motion.div
                key={currentWord}
                initial={reducedMotion ? false : { opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, rotateY: -90 }}
                className="w-full max-w-md bg-gradient-to-br from-primary-900/40 to-secondary-900/40 rounded-2xl p-6 mb-6 border border-white/20"
              >
                <p className="text-white/50 text-sm text-center mb-2">
                  類別：{currentChallenge.category} ({currentWordIndex + 1}/{currentChallenge.words.length})
                </p>
                <div className="text-center">
                  {showWord ? (
                    <h2 className="text-4xl font-bold text-primary-400 py-4">{currentWord}</h2>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowWord(true)}
                      className="text-2xl text-white/50 py-4"
                    >
                      點擊顯示題目
                    </button>
                  )}
                </div>
                <p className="text-white/40 text-xs text-center mt-2">
                  只有比劃的人可以看題目！
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={handleCorrect}
              className="px-8 py-3 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 games-focus-ring min-h-[48px] flex items-center gap-2"
            >
              猜對了！
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="px-8 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 games-focus-ring min-h-[48px] flex items-center gap-2"
            >
              跳過
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
