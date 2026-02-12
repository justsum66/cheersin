'use client'

import { useState, useEffect, useRef } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useTranslation } from '@/contexts/I18nContext'
import { Mic, RotateCcw, Trophy, Volume2 } from 'lucide-react'

const SONGS = [
  { title: '小星星', artist: '兒歌', difficulty: 'easy' },
  { title: '生日快樂', artist: '經典歌曲', difficulty: 'easy' },
  { title: '茉莉花', artist: '民謠', difficulty: 'medium' },
  { title: '月亮代表我的心', artist: '鄧麗君', difficulty: 'medium' },
  { title: '青花瓷', artist: '周杰倫', difficulty: 'hard' },
  { title: '稻香', artist: '周杰倫', difficulty: 'medium' },
  { title: '告白氣球', artist: '周杰倫', difficulty: 'medium' },
  { title: '夜曲', artist: '周杰倫', difficulty: 'hard' },
  { title: '簡單愛', artist: '周杰倫', difficulty: 'medium' },
  { title: '聽媽媽的話', artist: '周杰倫', difficulty: 'medium' },
  { title: '七里香', artist: '周杰倫', difficulty: 'hard' },
  { title: '雙截棍', artist: '周杰倫', difficulty: 'hard' },
]

export default function VocalWar() {
  const { t } = useTranslation()
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'voting' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentSong, setCurrentSong] = useState<typeof SONGS[0] | null>(null)
  const [performances, setPerformances] = useState<Record<string, number>>({})
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentPlayer = players[currentPlayerIndex]
  const otherPlayers = players.filter(p => p !== currentPlayer)

  // 遊戲初始化
  const initializeGame = () => {
    setGameState('playing')
    setCurrentSong(null)
    setPerformances({})
    setVotes({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    play('click')
  }

  // 開始演唱
  const startSinging = () => {
    const song = SONGS[Math.floor(Math.random() * SONGS.length)]
    setCurrentSong(song)
    setPerformances({})
    setVotes({})
    setCurrentPlayerIndex(0)
    play('click')
  }

  // 完成演唱
  const finishSinging = (score: number) => {
    setPerformances(prev => ({
      ...prev,
      [currentPlayer]: score
    }))
    play('click')
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      setGameState('voting')
      setCurrentPlayerIndex(0)
    }
  }

  // 投票
  const castVote = (candidate: string) => {
    setVotes(prev => ({
      ...prev,
      [currentPlayer]: candidate
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
    // 計算得票數
    const voteCounts: Record<string, number> = {}
    Object.values(votes).forEach(voted => {
      voteCounts[voted] = (voteCounts[voted] || 0) + 1
    })
    
    // 給分（演唱分數 + 投票分數）
    Object.entries(performances).forEach(([player, score]) => {
      setScores(prev => ({
        ...prev,
        [player]: (prev[player] || 0) + Math.floor(score / 10) // 演唱分數
      }))
    })
    
    Object.entries(voteCounts).forEach(([player, votes]) => {
      setScores(prev => ({
        ...prev,
        [player]: (prev[player] || 0) + votes * 2 // 投票分數
      }))
    })
    
    setGameState('results')
    play('win')
  }

  // 下一輪
  const nextRound = () => {
    if (round < 3) {
      setRound(prev => prev + 1)
      setGameState('playing')
      setCurrentSong(null)
      setPerformances({})
      setVotes({})
      setCurrentPlayerIndex(0)
    } else {
      setGameState('results')
    }
    play('click')
  }

  // 重新開始
  const restartGame = () => {
    setGameState('setup')
    setCurrentSong(null)
    setPerformances({})
    setVotes({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    play('click')
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mic className="w-8 h-8 text-red-400" />
            <h1 className="text-2xl font-bold text-white">歌喉戰</h1>
          </div>
          <p className="text-white/80 mb-6">展現你的歌喉，爭奪歌王寶座！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 每輪隨機歌曲</li>
              <li>• 輪流演唱展示</li>
              <li>• 其他人評分和投票</li>
              <li>• 綜合得分最高者獲勝</li>
              <li>• 進行3輪比賽</li>
            </ul>
          </div>
          
          <button 
            onClick={initializeGame}
            className="games-touch-target w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 text-lg rounded-xl font-bold"
          >
            開始對決
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <p className="text-sm">{t('common.roundLabel', { n: round })}</p>
                <p className="text-xl font-bold text-red-400">{currentPlayer} 的回合</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm">歌曲難度</p>
                <p className="text-lg font-bold text-yellow-400">
                  {currentSong ? currentSong.difficulty : '待選擇'}
                </p>
              </div>
            </div>
          </div>

          {!currentSong ? (
            <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">準備開始</h2>
              <p className="text-white/80 mb-6">{currentPlayer} 請準備演唱</p>
              <button 
                onClick={startSinging}
                className="games-touch-target bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 px-8 rounded-xl font-bold"
              >
                開始演唱
              </button>
            </div>
          ) : (
            <div className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{currentSong.title}</h2>
                <p className="text-white/60 mb-4">原唱：{currentSong.artist}</p>
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <p className="text-white/80">難度：{currentSong.difficulty}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => finishSinging(95)}
                  className="games-touch-target bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold"
                >
                  完美演唱 (95分)
                </button>
                <button 
                  onClick={() => finishSinging(85)}
                  className="games-touch-target bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-xl font-bold"
                >
                  優秀演唱 (85分)
                </button>
                <button 
                  onClick={() => finishSinging(75)}
                  className="games-touch-target bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-4 rounded-xl font-bold"
                >
                  一般演唱 (75分)
                </button>
                <button 
                  onClick={() => finishSinging(65)}
                  className="games-touch-target bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold"
                >
                  需要練習 (65分)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'voting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-white text-center">投票時間</h1>
            <p className="text-white/80 text-center mt-2">請投票選出最佳演唱</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {otherPlayers.map((player) => (
              <div key={player} className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{player}</span>
                  {currentPlayer === player && (
                    <div className="ml-auto px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">
                      你的回合
                    </div>
                  )}
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">
                    {performances[player] >= 90 ? '🎤' :
                     performances[player] >= 80 ? '🎵' :
                     performances[player] >= 70 ? '🎶' :
                     performances[player] >= 60 ? '🎼' : '🎵'}
                  </div>
                  <p className="text-white/80">{performances[player]} 分</p>
                  <p className="text-white/60 text-sm mt-1">
                    {currentSong?.title}
                  </p>
                </div>
                
                {currentPlayer !== player && (
                  <button 
                    onClick={() => castVote(player)}
                    className="games-touch-target w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-2 rounded-lg font-medium"
                  >
                    我投給他
                  </button>
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
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">
              {round < 3 ? '回合結果' : '最終結果'}
            </h1>
          </div>
          
          {round < 3 && currentSong && (
            <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
              <p className="text-white">本輪歌曲：{currentSong.title}</p>
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
          
          {round < 3 ? (
            <button 
              onClick={nextRound}
              className="games-touch-target w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-xl font-bold"
            >
              下一輪
            </button>
          ) : (
            <button 
              onClick={restartGame}
              className="games-touch-target w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-xl font-bold"
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