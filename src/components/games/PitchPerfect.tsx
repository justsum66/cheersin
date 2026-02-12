'use client'

import { useState, useEffect, useRef } from 'react'
import { useGamesPlayers } from './GamesContext'
import { useGameSound } from '@/hooks/useGameSound'
import { useTranslation } from '@/contexts/I18nContext'
import { Music, RotateCcw, Trophy, Volume2 } from 'lucide-react'

const NOTES = [
  { name: 'Do', frequency: 261.63, emoji: '🎵' },
  { name: 'Re', frequency: 293.66, emoji: '🎶' },
  { name: 'Mi', frequency: 329.63, emoji: '🎼' },
  { name: 'Fa', frequency: 349.23, emoji: '🎹' },
  { name: 'Sol', frequency: 392.00, emoji: '🎸' },
  { name: 'La', frequency: 440.00, emoji: '🎻' },
  { name: 'Ti', frequency: 493.88, emoji: '🎺' },
]

export default function PitchPerfect() {
  const { t } = useTranslation()
  const players = useGamesPlayers()
  const { play } = useGameSound()
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'guessing' | 'results'>('setup')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [targetNote, setTargetNote] = useState<typeof NOTES[0] | null>(null)
  const [guesses, setGuesses] = useState<Record<string, string>>({})
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState<Record<string, number>>({})
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)

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

  // 播放目標音符
  const playTargetNote = () => {
    const note = NOTES[Math.floor(Math.random() * NOTES.length)]
    setTargetNote(note)
    setGuesses({})
    setCurrentPlayerIndex(0)
    
    // 播放音符
    if (typeof window !== 'undefined') {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
      }
      
      oscillatorRef.current = audioContextRef.current.createOscillator()
      oscillatorRef.current.type = 'sine'
      oscillatorRef.current.frequency.setValueAtTime(note.frequency, audioContextRef.current.currentTime)
      
      const gainNode = audioContextRef.current.createGain()
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 1.5)
      
      oscillatorRef.current.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillatorRef.current.start()
      oscillatorRef.current.stop(audioContextRef.current.currentTime + 1.5)
    }
    
    setTimeout(() => {
      setGameState('guessing')
    }, 2000)
    
    play('click')
  }

  // 猜測音符
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
      if (guess === targetNote?.name) {
        setScores(prev => ({
          ...prev,
          [player]: (prev[player] || 0) + 3
        }))
      }
    })
    
    // 表演者得分（如果有猜對的人）
    const correctGuesses = Object.values(guesses).filter(g => g === targetNote?.name).length
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
      setTargetNote(null)
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
    setTargetNote(null)
    
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    play('click')
  }

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">完美音準</h1>
          </div>
          <p className="text-white/80 mb-6">測試你的音感，聽音辨符！</p>
          
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white font-medium">遊戲規則：</p>
            <ul className="text-white/80 text-sm mt-2 text-left">
              <li>• 輪流播放神秘音符</li>
              <li>• 其他人猜測是哪個音符</li>
              <li>• 猜對得分</li>
              <li>• 表演者根據猜對人數得分</li>
              <li>• 進行5輪比賽</li>
            </ul>
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

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            {currentPlayer} 的回合
          </h2>
          
          <div className="text-8xl mb-6">
            🎵
          </div>
          
          <p className="text-white/80 mb-6">準備播放音符</p>
          
          <button 
            onClick={playTargetNote}
            className="games-touch-target w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
          >
            播放音符
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'guessing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <p className="text-sm">{t('common.roundLabel', { n: round })}</p>
                <p className="text-xl font-bold text-purple-400">猜音符</p>
              </div>
              <div className="text-center">
                <Volume2 className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                <p className="text-white/60 text-sm">音符</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherPlayers.map((player) => (
              <div key={player} className="bg-black/20 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {player.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{player}</span>
                  {currentPlayer === player && (
                    <div className="ml-auto px-2 py-1 bg-pink-500 text-black text-xs rounded-full">
                      播放者
                    </div>
                  )}
                </div>
                
                {currentPlayer !== player ? (
                  <div className="space-y-2">
                    {NOTES.map((note) => (
                      <button
                        key={note.name}
                        onClick={() => makeGuess(note.name)}
                        disabled={!!guesses[player]}
                        className="games-touch-target w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium"
                      >
                        {note.emoji} {note.name}
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">
              {round < 5 ? '回合結果' : '最終結果'}
            </h1>
          </div>
          
          {round < 5 && targetNote && (
            <div className="bg-white/10 rounded-lg p-4 mb-6 text-center">
              <p className="text-4xl mb-2">{targetNote.emoji}</p>
              <p className="text-white">本輪音符：{targetNote.name}</p>
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
              className="games-touch-target w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
            >
              下一輪
            </button>
          ) : (
            <button 
              onClick={restartGame}
              className="games-touch-target w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold"
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