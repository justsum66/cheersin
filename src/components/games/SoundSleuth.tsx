'use client'

import { useState, useEffect, useRef } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { Ear, RotateCcw, Trophy, Play } from 'lucide-react'

const SOUND_CATEGORIES = [
  { id: 'animal', name: '動物聲音', sounds: ['🐶 狗叫', '🐱 貓叫', '🐮 牛叫', '🐑 羊叫', '🐔 雞叫'] },
  { id: 'instrument', name: '樂器聲音', sounds: ['🎸 吉他', '🎹 鋼琴', '🎺 小號', '🥁 鼓聲', '🎻 小提琴'] },
  { id: 'vehicle', name: '交通工具', sounds: ['🚗 汽車', '✈️ 飛機', '🚢 輪船', '🚲 自行車', '🚂 火車'] },
  { id: 'nature', name: '自然聲音', sounds: ['🌧️ 下雨', '🌊 海浪', '🌪️ 風聲', '🐦 鳥叫', '🔥 火焰'] },
  { id: 'household', name: '家用聲音', sounds: ['⏰ 鬧鐘', '📞 電話', '🚪 門鈴', '🚿 淋浴', '🍳 煎蛋'] },
]

export default function SoundSleuth() {
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'guessing' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentCategory, setCurrentCategory] = useState<typeof SOUND_CATEGORIES[0] | null>(null)
  const [currentSound, setCurrentSound] = useState<string | null>(null)
  const [guesses, setGuesses] = useState<Record<string, string>>({})
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentPlayer = players[currentPlayerIndex]
  const otherPlayers = players.filter(p => p !== currentPlayer)

  // 遊戲初始化
  const initializeGame = () => {
    setGameState('playing')
    setGuesses({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    play('click')
  }

  // 開始播放聲音
  const playSound = () => {
    const category = SOUND_CATEGORIES[Math.floor(Math.random() * SOUND_CATEGORIES.length)]
    const sound = category.sounds[Math.floor(Math.random() * category.sounds.length)]
    
    setCurrentCategory(category)
    setCurrentSound(sound)
    setGuesses({})
    setCurrentPlayerIndex(0)
    play('click')
    
    // 模擬播放聲音（這裡用視覺提示代替）
    setTimeout(() => {
      setGameState('guessing')
    }, 2000)
  }

  // 猜測聲音
  const makeGuess = (guess: string) => {
    setGuesses(prev => ({
      ...prev,
      [currentPlayer]: guess
    }))
    play('click')
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      calculateRoundResults()
    }
  }

  // 計算回合結果
  const calculateRoundResults = () => {
    // 計算正確猜測數
    Object.entries(guesses).forEach(([player, guess]) => {
      if (guess === currentSound) {
        setScores(prev => ({
          ...prev,
          [player]: (prev[player] || 0) + 3
        }))
      }
    })
    
    // 表演者得分（如果有猜對的人）
    const correctGuesses = Object.values(guesses).filter(g => g === currentSound).length
    if (correctGuesses > 0) {
      setScores(prev => ({
        ...prev,
        [currentPlayer]: (prev[currentPlayer] || 0) + correctGuesses
      }))
    }
    
    setGameState('results')
    play('win')
  }

  // 下一輪
  const nextRound = () => {
    if (round < 5) {
      setRound(prev => prev + 1)
      setGameState('playing')
      setGuesses({})
      setCurrentPlayerIndex(0)
      setCurrentCategory(null)
      setCurrentSound(null)
    } else {
      setGameState('results')
    }
    play('click')
  }

  // 重新開始
  const restartGame = () => {
    setGameState('setup')
    setGuesses({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    setCurrentCategory(null)
    setCurrentSound(null)
    play('click')
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Ear className="w-8 h-8 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">聲音偵探</h1>
          </div>
          <p className="text-white/80 mb-6">考驗你的聽力，辨識各種聲音！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 輪流播放神秘聲音</li>
              <li>• 其他人猜測是什麼聲音</li>
              <li>• 猜對得分</li>
              <li>• 表演者根據猜對人數得分</li>
              <li>• 進行5輪比賽</li>
            </ul>
          </div>
          
          <button 
            onClick={initializeGame}
            className="games-touch-target w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 text-lg rounded-xl font-bold"
          >
            開始遊戲
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            {currentPlayer} 的回合
          </h2>
          
          <div className="text-8xl mb-6">
            🎧
          </div>
          
          <p className="text-white/80 mb-6">準備播放神秘聲音</p>
          
          <button 
            onClick={playSound}
            className="games-touch-target w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-xl font-bold"
          >
            播放聲音
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'guessing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <p className="text-sm">第 {round} 輪</p>
                <p className="text-xl font-bold text-amber-400">猜聲音</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm">聲音類別</p>
                <p className="text-lg font-bold text-yellow-400">
                  {currentCategory?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherPlayers.map((player) => (
              <div key={player} className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{player}</span>
                  {currentPlayer === player && (
                    <div className="ml-auto px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">
                      播放者
                    </div>
                  )}
                </div>
                
                {currentPlayer !== player ? (
                  <div className="space-y-2">
                    {currentCategory?.sounds.map((sound) => (
                      <button
                        key={sound}
                        onClick={() => makeGuess(sound)}
                        disabled={!!guesses[player]}
                        className="games-touch-target w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium"
                      >
                        {sound}
                      </button>
                    ))}
                    {guesses[player] && (
                      <div className="text-center py-2 text-green-400 font-medium">
                        已選擇：{guesses[player]}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    你是播放者
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'results') {
    const sortedPlayers = [...players].sort((a, b) => 
      (scores[b] || 0) - (scores[a] || 0)
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">
              {round < 5 ? '回合結果' : '最終結果'}
            </h1>
          </div>
          
          {round < 5 && currentSound && (
            <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
              <p className="text-4xl mb-2">🎧</p>
              <p className="text-white">本輪聲音：{currentSound}</p>
              <p className="text-white/60 text-sm">類別：{currentCategory?.name}</p>
            </div>
          )}
          
          <div className="space-y-3 mb-6">
            {sortedPlayers.map((player, index) => (
              <div key={player} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{player}</span>
                </div>
                <span className="text-white/80">{scores[player] || 0} 分</span>
              </div>
            ))}
          </div>
          
          {round < 5 ? (
            <button 
              onClick={nextRound}
              className="games-touch-target w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-xl font-bold"
            >
              下一輪
            </button>
          ) : (
            <button 
              onClick={restartGame}
              className="games-touch-target w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-xl font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              再玩一次
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}