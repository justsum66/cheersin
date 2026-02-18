'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EnhancedCardHover } from './EnhancedCardHover'
import { ShimmerProgressBar } from './ShimmerProgressBar'
import { AutoEmotionEmoji } from './EmotionEmoji'
import { TypingAnimation } from './TypingAnimation'
import { Button } from './Button'
import { GlassCard } from './GlassCard'

/**
 * 遊戲頁面動畫整合示範
 * 展示如何在遊戲大廳和遊戲過程中使用優化元件
 */
export function GamesPageIntegrationDemo() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameProgress, setGameProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const games = [
    {
      id: 'truth-or-dare',
      title: '真心話大冒險',
      description: '經典派對遊戲',
      players: '2-10人',
      category: 'party'
    },
    {
      id: 'roulette',
      title: '俄羅斯輪盤',
      description: '刺激冒險遊戲',
      players: '2-6人',
      category: 'adventure'
    },
    {
      id: 'never-have-i-ever',
      title: '我從來沒有',
      description: '趣味互動遊戲',
      players: '3-12人',
      category: 'fun'
    },
    {
      id: 'kings-cup',
      title: '國王遊戲',
      description: '經典酒桌遊戲',
      players: '4-8人',
      category: 'drinking'
    }
  ]

  const startGame = (gameId: string) => {
    setSelectedGame(gameId)
    setIsPlaying(true)
    // 模擬遊戲進度
    const interval = setInterval(() => {
      setGameProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 200)
  }

  const exitGame = () => {
    setSelectedGame(null)
    setIsPlaying(false)
    setGameProgress(0)
  }

  if (isPlaying && selectedGame) {
    return (
      <GamePlayView 
        gameId={selectedGame} 
        progress={gameProgress} 
        onExit={exitGame} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">遊戲大廳</h1>
          <p className="text-white/70 text-lg">選擇你喜歡的遊戲開始冒險</p>
        </motion.div>

        {/* 遊戲網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EnhancedCardHover 
                variant="standard"
                className="h-full cursor-pointer"
                onClick={() => startGame(game.id)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{game.title}</h3>
                    <AutoEmotionEmoji content={`選擇${game.title}遊戲`} />
                  </div>
                  <p className="text-white/70 mb-4">{game.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">{game.players}</span>
                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                      {game.category}
                    </span>
                  </div>
                </div>
              </EnhancedCardHover>
            </motion.div>
          ))}
        </div>

        {/* 用戶統計 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">你的遊戲統計</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: '總遊戲數', value: '24', change: '+3' },
                { label: '勝率', value: '72%', change: '+5%' },
                { label: '好友數', value: '12', change: '+2' },
                { label: '成就數', value: '18', change: '+1' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center p-4 bg-white/5 rounded-xl"
                >
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/70 text-sm mb-1">{stat.label}</div>
                  <div className="text-green-400 text-xs">↑ {stat.change}</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

function GamePlayView({ 
  gameId, 
  progress, 
  onExit 
}: { 
  gameId: string; 
  progress: number; 
  onExit: () => void; 
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isAnswering, setIsAnswering] = useState(false)

  const questions = [
    "如果你可以擁有任何超能力，你會選擇什麼？",
    "描述一個讓你感到最尷尬的時刻",
    "如果你能和任何歷史人物共進晚餐，你會選擇誰？",
    "你最想去的世界哪個地方旅行？"
  ]

  const handleNextQuestion = () => {
    setIsAnswering(true)
    setTimeout(() => {
      setCurrentQuestion(prev => (prev + 1) % questions.length)
      setIsAnswering(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 遊戲頭部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">真心話大冒險</h1>
            <div className="flex items-center gap-4">
              <ShimmerProgressBar
                value={progress}
                variant="primary"
                height="sm"
                showLabel={true}
                label="遊戲進度"
              />
            </div>
          </div>
          <Button onClick={onExit} variant="outline">
            離開遊戲
          </Button>
        </motion.div>

        {/* 遊戲內容 */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="mb-8"
        >
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <AutoEmotionEmoji 
                content="這是一個很有趣的問題！" 
                className="text-5xl mb-4" 
              />
              <h2 className="text-2xl font-bold text-white mb-6">
                問題 {currentQuestion + 1}
              </h2>
            </div>
            
            {isAnswering ? (
              <div className="text-center py-12">
                <TypingAnimation
                  text="正在準備下一個問題..."
                  speed={60}
                  showCursor={true}
                  className="text-white/80 text-xl"
                />
              </div>
            ) : (
              <div className="text-center">
                <p className="text-white text-xl mb-8 leading-relaxed">
                  {questions[currentQuestion]}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="px-8 py-3"
                    onClick={handleNextQuestion}
                  >
                    下一題
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-3"
                  >
                    跳過
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* 遊戲提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <GlassCard className="p-6 inline-block">
            <p className="text-white/70">
              <AutoEmotionEmoji content="加油！你做得很好！" className="inline mr-2" />
              享受遊戲時光！
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}