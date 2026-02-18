'use client'

import { useState, useCallback } from 'react'
import { m , AnimatePresence } from 'framer-motion'
import { Wine, RotateCcw, Trophy, Sparkles, GlassWater, Share2, Copy } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import GameRules from './GameRules'
import CopyResultButton from './CopyResultButton'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useGameReduceMotion } from './GameWrapper'

const COCKTAIL_RECIPES = [
  {
    name: '莫吉托',
    ingredients: ['白朗姆酒', '青檸汁', '糖漿', '蘇打水', '薄荷葉'],
    description: '清爽的薄荷檸檬風味'
  },
  {
    name: '馬丁尼',
    ingredients: ['琴酒', '苦艾酒', '橄欖'],
    description: '經典的英式雞尾酒'
  },
  {
    name: '曼哈頓',
    ingredients: ['威士忌', '苦精', '紅味美思'],
    description: '濃郁的威士忌調酒'
  },
  {
    name: '瑪格麗特',
    ingredients: ['龍舌蘭', '君度橙酒', '青檸汁', '鹽 rim'],
    description: '帶鹽 rim 的龍舌蘭調酒'
  },
  {
    name: '新加坡司令',
    ingredients: ['琴酒', '櫻桃白蘭地', '紅石榴糖漿', '檸檬汁', '蘇打水'],
    description: '果香濃郁的亞洲經典'
  },
  {
    name: '血腥瑪麗',
    ingredients: ['伏特加', '番茄汁', '辣醬', '檸檬汁', '各種調料'],
    description: '鹹辣清爽的早午餐必備'
  },
  {
    name: '白俄',
    ingredients: ['伏特加', '咖啡利口酒', '鮮奶油'],
    description: '濃郁香甜的奶香調酒'
  },
  {
    name: '長島冰茶',
    ingredients: ['琴酒', '伏特加', '龍舌蘭', '白朗姆', '君度橙酒', '檸檬汁', '可樂'],
    description: '看似茶實則很烈'
  },
  {
    name: '大都會',
    ingredients: ['伏特加', '君度橙酒', '蔓越莓汁', '青檸汁'],
    description: '粉紅色的水果風味'
  },
  {
    name: '海風',
    ingredients: ['伏特加', '藍橙酒', '檸檬汁', '雪碧'],
    description: '藍色的清爽海風味'
  }
]

export default function CocktailMix() {
  const { t } = useTranslation()
  const contextPlayers = useGamesPlayers()
  const { play } = useGameSound()
  const reducedMotion = useGameReduceMotion()
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup')
  const [currentCocktail, setCurrentCocktail] = useState<typeof COCKTAIL_RECIPES[0] | null>(null)
  const [playerGuesses, setPlayerGuesses] = useState<Record<string, string[]>>({})
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [round, setRound] = useState(1)

  const players = contextPlayers.length >= 2 ? contextPlayers : ['玩家1', '玩家2', '玩家3']

  const startGame = useCallback(() => {
    const randomCocktail = COCKTAIL_RECIPES[Math.floor(Math.random() * COCKTAIL_RECIPES.length)]
    setCurrentCocktail(randomCocktail)
    setPlayerGuesses({})
    setCurrentPlayerIndex(0)
    setGameState('playing')
    play('click')
  }, [play])

  const submitGuess = useCallback((player: string, guess: string[]) => {
    setPlayerGuesses(prev => ({ ...prev, [player]: guess }))
    
    // Check if guess is correct
    if (currentCocktail) {
      const correctCount = guess.filter(ing => 
        currentCocktail.ingredients.includes(ing)
      ).length
      
      const accuracy = Math.round((correctCount / currentCocktail.ingredients.length) * 100)
      
      if (accuracy >= 80) {
        setScores(prev => ({ ...prev, [player]: (prev[player] || 0) + 1 }))
        play('correct')
      } else {
        play('wrong')
      }
    }
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      setGameState('results')
      play('win')
    }
  }, [currentCocktail, currentPlayerIndex, players.length, play])

  const nextRound = useCallback(() => {
    setRound(prev => prev + 1)
    startGame()
  }, [startGame])

  const resetGame = useCallback(() => {
    setRound(1)
    setScores({})
    setGameState('setup')
    setCurrentCocktail(null)
    setPlayerGuesses({})
  }, [])

  const currentPlayer = players[currentPlayerIndex]
  const allIngredients = ['伏特加', '琴酒', '龍舌蘭', '威士忌', '白朗姆', '黑朗姆', '白蘭地', '君度橙酒', '苦艾酒', '紅味美思', '青檸汁', '檸檬汁', '橙汁', '蔓越莓汁', '番茄汁', '蘇打水', '可樂', '雪碧', '糖漿', '苦精', '薄荷葉', '橄欖', '鹽 rim', '咖啡利口酒', '櫻桃白蘭地', '紅石榴糖漿', '鮮奶油', '藍橙酒', '辣醬', '各種調料']

  const calculateAccuracy = (guess: string[]) => {
    if (!currentCocktail) return 0
    const correctCount = guess.filter(ing => 
      currentCocktail.ingredients.includes(ing)
    ).length
    return Math.round((correctCount / currentCocktail.ingredients.length) * 100)
  }

  const resultText = `調酒大師 - 第${round}回合\n${players.map(p => `${p}: ${scores[p] || 0}分`).join('\n')}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto text-center">
        <m.h1 
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          調酒大師
        </m.h1>
        <p className="text-white/80 mb-8">考驗你的調酒知識！</p>

        <GameRules 
          rules="遊戲規則：
1. 系統隨機選擇一款雞尾酒
2. 玩家需要猜出調酒的配方
3. 從提供的原料中選擇正確的配料
4. 正確率達80%以上即可得分
5. 每位玩家輪流作答
6. 猜對最多配方的玩家獲勝"
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
              <Wine className="w-16 h-16 mx-auto mb-6 text-amber-400" />
              <h2 className="text-2xl font-bold mb-4">準備開始</h2>
              <p className="text-white/80 mb-6">測試你的調酒知識！</p>
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
                className="games-touch-target px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                開始遊戲
              </button>
            </m.div>
          )}

          {gameState === 'playing' && currentCocktail && (
            <m.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-amber-400">{t('common.turnLabel', { n: round })}</h2>
                <p className="text-lg mb-4">目前玩家：{currentPlayer}</p>
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-4">
                  <p className="text-xl font-bold text-center">{currentCocktail.name}</p>
                  <p className="text-white/80 text-center mt-2">{currentCocktail.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg mb-4">請選擇調酒配方（可多選）：</p>
                <div className="grid grid-cols-2 gap-3">
                  {allIngredients.map((ingredient) => (
                    <m.button
                      key={ingredient}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white/10 hover:bg-white/20 rounded-lg p-3 text-center border border-white/20 hover:border-amber-400/50 transition-all duration-300"
                    >
                      {ingredient}
                    </m.button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-4">
                <p className="text-center">
                  還需要 {players.length - Object.keys(playerGuesses).length} 人作答
                </p>
              </div>
            </m.div>
          )}

          {gameState === 'results' && currentCocktail && (
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
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-4 mb-4">
                  <p className="text-xl font-bold text-center">{currentCocktail.name}</p>
                  <p className="text-white/80 text-center">正確配方：</p>
                  {/* GAME-064: Ingredient reveal animation */}
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {currentCocktail.ingredients.map((ing, index) => (
                      <m.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                        className="px-2 py-1 bg-amber-500/30 rounded-full text-sm"
                      >
                        {ing}
                      </m.span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {players.map((player, index) => {
                  const guess = playerGuesses[player] || []
                  const accuracy = calculateAccuracy(guess)
                  const isCorrect = accuracy >= 80
                  
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
                          {accuracy}% {isCorrect ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {guess.map((ing, idx) => (
                          <span 
                            key={idx} 
                            className={`px-2 py-1 rounded-full text-sm ${
                              currentCocktail.ingredients.includes(ing) 
                                ? 'bg-green-500/30 text-green-400' 
                                : 'bg-red-500/30 text-red-400'
                            }`}
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </m.div>
                  )
                })}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-center">累計得分</h3>
                <div className="grid grid-cols-2 gap-4">
                  {players.map((player) => (
                    <div key={player} className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-3 text-center">
                      <div className="font-bold text-amber-400">{player}</div>
                      <div className="text-2xl font-bold text-yellow-400">{scores[player] || 0}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GAME-063: Share recipe button */}
              <div className="flex gap-2 mb-4 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const text = `🍸 ${currentCocktail.name}\n${currentCocktail.description}\n材料：${currentCocktail.ingredients.join('、')}`
                    if (typeof navigator !== 'undefined' && navigator.share) {
                      navigator.share({ title: currentCocktail.name, text }).catch(() => {})
                    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(text).catch(() => {})
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs hover:bg-amber-500/30 transition-colors games-focus-ring"
                >
                  <Share2 className="w-3 h-3" /> 分享配方
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={nextRound}
                  className="flex-1 games-touch-target py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-white hover:scale-105 transition-transform"
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