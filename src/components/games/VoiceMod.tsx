'use client'

import { useState, useEffect, useRef } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { Mic, RotateCcw, Trophy, Volume2 } from 'lucide-react'

const VOICE_EFFECTS = [
  { id: 'robot', name: '機器人', description: '電子音效' },
  { id: 'chipmunk', name: '花栗鼠', description: '高音調' },
  { id: 'deep', name: '低沉', description: '深沉嗓音' },
  { id: 'echo', name: '回音', description: '空靈效果' },
  { id: 'slow', name: '慢動作', description: '慢速播放' },
  { id: 'fast', name: '快進', description: '快速播放' },
  { id: 'alien', name: '外星人', description: '奇異聲調' },
  { id: 'monster', name: '怪物', description: '恐怖音效' },
]

export default function VoiceMod() {
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'recording' | 'playing' | 'voting' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentEffect, setCurrentEffect] = useState<typeof VOICE_EFFECTS[0] | null>(null)
  const [recordings, setRecordings] = useState<Record<string, string>>({})
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
    setGameState('recording')
    setRecordings({})
    setVotes({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    play('click')
  }

  // 開始錄音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordings(prev => ({
          ...prev,
          [currentPlayer]: audioUrl
        }))
        
        if (currentPlayerIndex < players.length - 1) {
          setCurrentPlayerIndex(prev => prev + 1)
        } else {
          setGameState('playing')
          setCurrentPlayerIndex(0)
          const effect = VOICE_EFFECTS[Math.floor(Math.random() * VOICE_EFFECTS.length)]
          setCurrentEffect(effect)
        }
      }

      mediaRecorderRef.current.start()
      play('click')
    } catch (error) {
      console.error('錄音失敗:', error)
      alert('無法訪問麥克風，請檢查權限設置')
    }
  }

  // 停止錄音
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  // 播放變聲
  const playModifiedVoice = (player: string) => {
    if (audioRef.current && recordings[player]) {
      audioRef.current.src = recordings[player]
      
      // 應用變聲效果（簡化版）
      switch(currentEffect?.id) {
        case 'chipmunk':
          audioRef.current.playbackRate = 1.5
          break
        case 'deep':
          audioRef.current.playbackRate = 0.7
          break
        case 'slow':
          audioRef.current.playbackRate = 0.5
          break
        case 'fast':
          audioRef.current.playbackRate = 2.0
          break
        default:
          audioRef.current.playbackRate = 1.0
      }
      
      audioRef.current.play()
      play('click')
    }
  }

  // 投票
  const castVote = (guess: string) => {
    setVotes(prev => ({
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
    Object.entries(votes).forEach(([voter, guess]) => {
      if (guess === '正確') {
        setScores(prev => ({
          ...prev,
          [voter]: (prev[voter] || 0) + 2
        }))
      }
    })
    
    setGameState('results')
    play('win')
  }

  // 下一輪
  const nextRound = () => {
    if (round < 3) {
      setRound(prev => prev + 1)
      setGameState('recording')
      setRecordings({})
      setVotes({})
      setCurrentPlayerIndex(0)
      setCurrentEffect(null)
    } else {
      setGameState('results')
    }
    play('click')
  }

  // 重新開始
  const restartGame = () => {
    setGameState('setup')
    setRecordings({})
    setVotes({})
    setCurrentPlayerIndex(0)
    setRound(1)
    setScores({})
    setCurrentEffect(null)
    play('click')
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mic className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">變聲器</h1>
          </div>
          <p className="text-white/80 mb-6">錄製你的聲音，讓變聲器來改造！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 每輪錄製原始聲音</li>
              <li>• 系統隨機應用變聲效果</li>
              <li>• 大家猜測是誰的聲音</li>
              <li>• 猜對得分</li>
              <li>• 進行3輪比賽</li>
            </ul>
          </div>
          
          <button 
            onClick={initializeGame}
            className="games-touch-target w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg rounded-xl font-bold"
          >
            開始遊戲
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'recording') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            {currentPlayer} 請錄音
          </h2>
          
          <div className="text-6xl mb-6">
            🎤
          </div>
          
          <button 
            onClick={startRecording}
            className="games-touch-target w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold mb-4"
          >
            開始錄音
          </button>
          
          <button 
            onClick={stopRecording}
            className="games-touch-target w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold"
          >
            停止錄音
          </button>
          
          <p className="text-white/60 text-sm mt-4">
            請說幾句話錄製你的聲音
          </p>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <p className="text-sm">第 {round} 輪</p>
                <p className="text-xl font-bold text-purple-400">猜聲音</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm">變聲效果</p>
                <p className="text-lg font-bold text-yellow-400">
                  {currentEffect?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {otherPlayers.map((player) => (
              <div key={player} className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{player}</span>
                  {currentPlayer === player && (
                    <div className="ml-auto px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">
                      你的回合
                    </div>
                  )}
                </div>
                
                {recordings[player] ? (
                  <div className="space-y-3">
                    <button 
                      onClick={() => playModifiedVoice(player)}
                      className="games-touch-target w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg font-medium"
                    >
                      <Volume2 className="w-4 h-4 mr-2 inline" />
                      播放變聲
                    </button>
                    
                    {currentPlayer !== player && (
                      <div className="space-y-2">
                        <button 
                          onClick={() => castVote('正確')}
                          className="games-touch-target w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-2 rounded-lg font-medium"
                        >
                          我知道是誰
                        </button>
                        <button 
                          onClick={() => castVote('錯誤')}
                          className="games-touch-target w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2 rounded-lg font-medium"
                        >
                          我不知道
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    還沒錄音
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <audio ref={audioRef} className="hidden" />
      </div>
    )
  }

  if (gameState === 'results') {
    const sortedPlayers = [...players].sort((a, b) => 
      (scores[b] || 0) - (scores[a] || 0)
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">
              {round < 3 ? '回合結果' : '最終結果'}
            </h1>
          </div>
          
          {round < 3 && currentEffect && (
            <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
              <p className="text-white">本輪效果：{currentEffect.name}</p>
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
              className="games-touch-target w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-bold"
            >
              下一輪
            </button>
          ) : (
            <button 
              onClick={restartGame}
              className="games-touch-target w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-bold"
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