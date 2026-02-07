'use client'

import { useState, useEffect, useRef } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { Mic, Volume2, Play, User, Award, RotateCcw } from 'lucide-react'

const SOUNDS = [
  '動物叫聲 - 狗叫',
  '動物叫聲 - 貓叫', 
  '動物叫聲 - 鳥叫',
  '交通工具 - 汽車喇叭',
  '交通工具 - 火車',
  '日常聲音 - 門鈴',
  '日常聲音 - 電話鈴聲',
  '日常聲音 - 拍手聲',
  '電影音效 - 笑聲',
  '電影音效 - 哭聲',
  '音樂樂器 - 鋼琴',
  '音樂樂器 - 吉他',
  '自然聲音 - 雷聲',
  '自然聲音 - 雨聲',
  '自然聲音 - 海浪聲'
]

export default function SoundImitate() {
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'recording' | 'playing' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [recordings, setRecordings] = useState<Record<string, string>>({})
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [originalSound, setOriginalSound] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState(10)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentPlayer = players[currentPlayerIndex]

  // 遊戲初始化
  const initializeGame = () => {
    setGameState('recording')
    setRecordings({})
    setVotes({})
    setCurrentPlayerIndex(0)
    const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)]
    setOriginalSound(randomSound)
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
        
        // 移動到下一個玩家
        if (currentPlayerIndex < players.length - 1) {
          setCurrentPlayerIndex(prev => prev + 1)
        } else {
          setGameState('playing')
          setCurrentPlayerIndex(0)
        }
      }

      mediaRecorderRef.current.start()
      setTimeLeft(10)
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

  // 播放音效
  const playSound = (soundUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = soundUrl
      audioRef.current.play()
      play('click')
    }
  }

  // 投票
  const handleVote = (player: string) => {
    setVotes(prev => ({
      ...prev,
      [currentPlayer]: player
    }))
    play('click')
    
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1)
    } else {
      calculateResults()
    }
  }

  // 計算結果
  const calculateResults = () => {
    setGameState('results')
    play('win')
  }

  // 下一輪
  const nextRound = () => {
    setGameState('setup')
    setCurrentPlayerIndex(0)
    setRecordings({})
    setVotes({})
    play('click')
  }

  // 倒數計時
  useEffect(() => {
    if (gameState === 'recording' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === 'recording') {
      stopRecording()
    }
  }, [timeLeft, gameState])

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mic className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">聲音模仿大師</h1>
          </div>
          <p className="text-white/80 mb-6">模仿指定的聲音，讓大家猜猜是誰！</p>
          
          <div className="text-center p-4 bg-white/10 rounded-lg mb-6">
            <p className="text-white font-medium">本輪聲音：</p>
            <p className="text-xl text-yellow-400 font-bold mt-2">{originalSound}</p>
          </div>
          
          <button 
            onClick={initializeGame}
            className="games-touch-target w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg rounded-xl font-bold"
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
          <h2 className="text-xl font-bold text-white mb-4">{currentPlayer} 請模仿</h2>
          
          <div className="p-4 bg-white/10 rounded-lg mb-6">
            <p className="text-white">請模仿：</p>
            <p className="text-xl text-yellow-400 font-bold mt-2">{originalSound}</p>
          </div>
          
          <div className="text-6xl font-bold text-red-400 mb-6">
            {timeLeft}
          </div>
          
          <button 
            onClick={startRecording}
            className="games-touch-target w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold"
          >
            <Mic className="w-5 h-5 mr-2 inline" />
            開始錄音
          </button>
          
          <p className="text-white/60 text-sm mt-4">
            點擊按鈕開始錄音，模仿 {timeLeft} 秒後自動停止
          </p>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Volume2 className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">聲音猜猜樂</h1>
            </div>
            <p className="text-white/80">聽聲音猜是誰模仿的</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {players.map((player, index) => (
              <div key={player} className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
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
                      onClick={() => playSound(recordings[player])}
                      className="games-touch-target w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg font-medium"
                    >
                      <Play className="w-4 h-4 mr-2 inline" />
                      播放聲音
                    </button>
                    
                    {currentPlayer !== player && (
                      <button 
                        onClick={() => handleVote(player)}
                        className="games-touch-target w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-2 rounded-lg font-medium"
                      >
                        <User className="w-4 h-4 mr-2 inline" />
                        我猜是他
                      </button>
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
    const voteCounts: Record<string, number> = {}
    Object.values(votes).forEach(votedPlayer => {
      voteCounts[votedPlayer] = (voteCounts[votedPlayer] || 0) + 1
    })
    
    const sortedPlayers = [...players].sort((a, b) => 
      (voteCounts[b] || 0) - (voteCounts[a] || 0)
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Award className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">遊戲結果</h1>
          </div>
          
          <div className="text-center p-4 bg-white/10 rounded-lg mb-6">
            <p className="text-white">本輪聲音：</p>
            <p className="text-xl text-yellow-400 font-bold">{originalSound}</p>
          </div>
          
          <div className="space-y-3 mb-6">
            {sortedPlayers.map((player, index) => (
              <div key={player} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{player}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/80">{voteCounts[player] || 0} 票</span>
                  {index === 0 && (
                    <Award className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={nextRound}
            className="games-touch-target w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
          >
            <RotateCcw className="w-4 h-4 mr-2 inline" />
            再玩一次
          </button>
        </div>
      </div>
    )
  }

  return null
}