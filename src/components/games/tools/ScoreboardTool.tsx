'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, RotateCcw, Trash2, Trophy, Users, UserPlus } from 'lucide-react'
import { m, AnimatePresence } from 'framer-motion'
import { FeatureIcon } from '@/components/ui/FeatureIcon' // Verify if needed or use Lucide directly

interface Player {
    id: string
    name: string
    score: number
}

export function ScoreboardTool() {
    const [players, setPlayers] = useState<Player[]>([])
    const [newPlayerName, setNewPlayerName] = useState('')

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('cheersin_scoreboard')
        if (saved) {
            try {
                setPlayers(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to load scoreboard', e)
            }
        }
    }, [])

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('cheersin_scoreboard', JSON.stringify(players))
    }, [players])

    const addPlayer = () => {
        if (!newPlayerName.trim()) return
        const newPlayer: Player = {
            id: Date.now().toString(),
            name: newPlayerName.trim(),
            score: 0
        }
        setPlayers([...players, newPlayer])
        setNewPlayerName('')
    }

    const updateScore = (id: string, delta: number) => {
        setPlayers(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, score: p.score + delta }
            }
            return p
        }))
    }

    const removePlayer = (id: string) => {
        if (confirm('Remove this player?')) {
            setPlayers(prev => prev.filter(p => p.id !== id))
        }
    }

    const resetScores = () => {
        if (confirm('Reset all scores to 0?')) {
            setPlayers(prev => prev.map(p => ({ ...p, score: 0 })))
        }
    }

    const clearAll = () => {
        if (confirm('Clear all players?')) {
            setPlayers([])
        }
    }

    // Sort by score descending for leader view? Optional.
    // Let's keep input order but highlight leader.
    const maxScore = Math.max(...players.map(p => p.score))

    return (
        <div className="max-w-2xl mx-auto p-4">
            {/* Input Area */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl mb-6 flex gap-3">
                <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                    placeholder="Player Name..."
                    className="flex-1 bg-black/20 text-white px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary-500"
                />
                <button
                    onClick={addPlayer}
                    disabled={!newPlayerName.trim()}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <UserPlus className="w-5 h-5" />
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {players.map(player => {
                        const isLeader = player.score > 0 && player.score === maxScore
                        return (
                            <m.div
                                key={player.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`
                                    relative p-4 rounded-2xl border transition-all duration-300
                                    ${isLeader
                                        ? 'bg-gradient-to-r from-primary-900/40 to-black/40 border-primary-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'}
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {isLeader && (
                                            <div className="bg-yellow-500/20 p-2 rounded-full">
                                                <Trophy className="w-5 h-5 text-yellow-500" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className={`font-bold text-lg ${isLeader ? 'text-primary-300' : 'text-white'}`}>
                                                {player.name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3 bg-black/30 rounded-full p-1 border border-white/10">
                                            <button
                                                onClick={() => updateScore(player.id, -1)}
                                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/70 flex items-center justify-center active:scale-90 transition-transform"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <span className="w-12 text-center font-mono text-2xl font-bold text-white">
                                                {player.score}
                                            </span>
                                            <button
                                                onClick={() => updateScore(player.id, 1)}
                                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/70 flex items-center justify-center active:scale-90 transition-transform"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removePlayer(player.id)}
                                            className="text-white/20 hover:text-red-400 transition-colors p-2"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </m.div>
                        )
                    })}
                </AnimatePresence>

                {players.length === 0 && (
                    <div className="text-center py-12 text-white/20">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No players yet. Add someone to start tracking!</p>
                    </div>
                )}
            </div>

            {/* Controls */}
            {players.length > 0 && (
                <div className="mt-8 flex justify-center gap-4">
                    <button
                        onClick={resetScores}
                        className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 flex items-center gap-2 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Reset Scores
                    </button>
                    <button
                        onClick={clearAll}
                        className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                </div>
            )}
        </div>
    )
}
