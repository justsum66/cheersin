'use client'

import { useState, useMemo } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Trophy, Users, Play, RotateCcw, Swords, Target, Crown, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { gamesWithCategory, type GameId } from '@/config/games.config'
import { useTournament, type TournamentMatch } from '@/hooks/useTournament'
import { FeatureIcon } from '@/components/ui/FeatureIcon'
import { FeatureLock } from '@/components/ui'
import { useSubscription } from '@/hooks/useSubscription'

export default function TournamentPage() {
    const router = useRouter()
    const { tier } = useSubscription()
    // const isPro = tier === 'premium' // Temporarily disabled for testing
    const isPro = true

    const { tournament, startTournament, setMatchWinner, resetTournament } = useTournament()

    const [setupPlayers, setSetupPlayers] = useState<string[]>([])
    const [newPlayerName, setNewPlayerName] = useState('')
    const [selectedGameId, setSelectedGameId] = useState<GameId | null>(null)

    // Filter games suitable for tournament (1v1)
    const tournamentGames = gamesWithCategory.filter(g => g.tournamentCompatible)

    const handleAddPlayer = () => {
        if (newPlayerName.trim()) {
            setSetupPlayers([...setupPlayers, newPlayerName.trim()])
            setNewPlayerName('')
        }
    }

    const handleStart = () => {
        if (setupPlayers.length < 2 || !selectedGameId) return
        startTournament(setupPlayers, selectedGameId)
    }

    // --- Recursive Bracket Rendering ---

    const BracketNode = ({ matchId }: { matchId: string }) => {
        if (!tournament) return null
        const match = tournament.matches.find(m => m.id === matchId)
        if (!match) return null

        // Find matches that feed into this one
        const feedingMatches = tournament.matches
            .filter(m => m.nextMatchId === match.id)
            .sort((a, b) => (a.nextMatchSlot || 0) - (b.nextMatchSlot || 0))

        const isLeaf = feedingMatches.length === 0
        const isFinal = !match.nextMatchId

        const isReady = match.player1 && match.player2
        const isCompleted = !!match.winnerId

        // Match Card Component
        const MatchCard = (
            <div className={`
                relative flex flex-col w-56 bg-[#1a1a2e] border rounded-xl overflow-hidden transition-all duration-300
                ${isCompleted ? 'border-primary-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)] opacity-80' :
                    isReady ? 'border-white/40 shadow-lg scale-100' :
                        'border-white/10 opacity-60'}
            `}>
                {/* Header / Round Badge */}
                <div className="absolute top-0 right-0 p-1">
                    <span className="text-[10px] font-bold uppercase text-white/20 bg-white/5 px-2 py-0.5 rounded-bl-lg">
                        {isFinal ? 'Final' : `R${match.round}`}
                    </span>
                </div>

                {/* Player 1 */}
                <div
                    className={`
                        relative px-4 py-3 border-b border-white/5 flex justify-between items-center transition-colors
                        ${match.winnerId && match.winnerId === match.player1?.id ? 'bg-gradient-to-r from-primary-900/40 to-transparent' : ''}
                        ${isReady && !isCompleted && !match.winnerId ? 'hover:bg-white/5 cursor-pointer' : ''}
                    `}
                    onClick={() => isReady && !isCompleted && match.player1 && setMatchWinner(match.id, match.player1.id)}
                >
                    <span className={`text-sm font-medium ${match.winnerId === match.player1?.id ? 'text-primary-300' : 'text-white/80'}`}>
                        {match.player1?.name || <span className="text-white/20 italic">TBD</span>}
                    </span>
                    {match.winnerId === match.player1?.id && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>

                {/* Player 2 */}
                <div
                    className={`
                        relative px-4 py-3 flex justify-between items-center transition-colors
                        ${match.winnerId && match.winnerId === match.player2?.id ? 'bg-gradient-to-r from-primary-900/40 to-transparent' : ''}
                        ${isReady && !isCompleted && !match.winnerId ? 'hover:bg-white/5 cursor-pointer' : ''}
                    `}
                    onClick={() => isReady && !isCompleted && match.player2 && setMatchWinner(match.id, match.player2.id)}
                >
                    <span className={`text-sm font-medium ${match.winnerId === match.player2?.id ? 'text-primary-300' : 'text-white/80'}`}>
                        {match.player2?.name || <span className="text-white/20 italic">TBD</span>}
                    </span>
                    {match.winnerId === match.player2?.id && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>

                {/* Action: Play Button (Quick Link) */}
                {isReady && !isCompleted && (
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/games?game=${tournament?.gameId}&tournament_match=${match.id}&p1=${match.player1?.name}&p2=${match.player2?.name}`)
                            }}
                            className="bg-primary-500 text-white p-2 rounded-full shadow-lg hover:bg-primary-400 hover:scale-110 transition-all border-2 border-[#1a1a2e]"
                            title="Start Match"
                        >
                            <Play className="w-3 h-3 fill-current" />
                        </button>
                    </div>
                )}
            </div>
        )

        return (
            <div className="flex items-center gap-8">
                {/* Children / Feeding Matches */}
                {feedingMatches.length > 0 && (
                    <div className="flex flex-col gap-6 justify-center">
                        {feedingMatches.map(child => (
                            <BracketNode key={child.id} matchId={child.id} />
                        ))}
                    </div>
                )}

                {/* Connectors (Visual Lines) */}
                {feedingMatches.length > 0 && (
                    <div className="w-8 h-px bg-white/10 relative">
                        {/* This simple approach is limited. For perfect brackets, we use SVG overlays. 
                             But for now, standard flex gap is the connector. 
                             We can add pseudo-elements if needed for "fork" look. */}
                        {/* Fork Visualization */}
                        <div className="absolute top-1/2 left-0 w-px h-full -translate-y-1/2 bg-white/0" />
                    </div>
                )}

                {/* The Node Itself */}
                <div className="relative z-0">
                    {/* Fork lines for children: 
                        If we have children, we want a line from them to us.
                        Using a dedicated SVG might be cleaner, but let's try CSS.
                    */}
                    {MatchCard}
                </div>
            </div>
        )
    }

    const BracketView = () => {
        if (!tournament) return null
        // Find the final match (root)
        const rootMatch = tournament.matches.find(m => !m.nextMatchId)
        if (!rootMatch) return null

        return (
            <div className="overflow-x-auto min-h-[60vh] flex items-center justify-center p-12 bg-[#050510] rounded-3xl border border-white/5 shadow-2xl">
                <div className="flex flex-row-reverse items-center">
                    {/* We reverse direction: Final (Right) <--- Round 1 (Left) */}
                    {/* Recursion builds Left -> Right structure if inputs are on left? */}
                    {/* My recursive function puts children on Left. So Final is Right. */}

                    {/* Winner Celebration */}
                    {tournament.winner && (
                        <div className="ml-12 flex flex-col items-center animate-in fade-in zoom-in duration-700">
                            <div className="relative">
                                <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-white animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 mt-4">
                                {tournament.winner.name}
                            </h2>
                            <p className="text-white/40 uppercase tracking-widest text-sm mt-1">Champion</p>
                        </div>
                    )}

                    <BracketNode matchId={rootMatch.id} />
                </div>
            </div>
        )
    }

    // --- Main Render ---

    return (
        <div className="min-h-screen bg-[#0a0a1a] pb-24 pt-20">
            <div className="container mx-auto px-4 max-w-7xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Swords className="w-8 h-8 text-primary-400" />
                            Tournament Mode
                            {!isPro && <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/60 font-normal">Preview</span>}
                        </h1>
                        <p className="text-white/60">Organize a bracket and battle for the cup!</p>
                    </div>
                    {tournament && (
                        <button
                            onClick={() => { if (confirm('Reset tournament?')) resetTournament() }}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center gap-2 transition-colors border border-white/5 hover:border-white/20"
                        >
                            <RotateCcw className="w-4 h-4" /> Reset
                        </button>
                    )}
                </header>

                {!isPro && false ? (
                    <FeatureLock
                        icon={Trophy}
                        title="Tournament Mode is Pro Only"
                        description="Upgrade to organize tournaments and create brackets."
                    />
                ) : !tournament ? (
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-8 md:grid-cols-12"
                    >
                        {/* Setup Column */}
                        <div className="md:col-span-5 space-y-6">
                            <section className="bg-[#121226] rounded-3xl p-6 border border-white/10 h-full">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary-400" />
                                    1. Add Players
                                </h2>

                                <div className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        value={newPlayerName}
                                        onChange={e => setNewPlayerName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                                        placeholder="Enter name..."
                                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-white/20"
                                    />
                                    <button
                                        onClick={handleAddPlayer}
                                        className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="bg-black/20 rounded-xl border border-white/5 min-h-[300px] p-2">
                                    <ul className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        <AnimatePresence>
                                            {setupPlayers.map((p, i) => (
                                                <m.li
                                                    key={`${p}-${i}`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="group flex justify-between items-center bg-white/5 hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
                                                >
                                                    <span className="text-white font-medium">{p}</span>
                                                    <button
                                                        onClick={() => setSetupPlayers(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Remove
                                                    </button>
                                                </m.li>
                                            ))}
                                        </AnimatePresence>
                                        {setupPlayers.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-[200px] text-white/20">
                                                <Users className="w-8 h-8 mb-2 opacity-50" />
                                                <p>Add at least 2 players</p>
                                            </div>
                                        )}
                                    </ul>
                                </div>
                                <div className="mt-4 flex justify-between items-center text-sm text-white/40">
                                    <span>{setupPlayers.length} Participants</span>
                                    {setupPlayers.length >= 2 && <span className="text-green-400">Ready for Launch</span>}
                                </div>
                            </section>
                        </div>

                        {/* Game Selection */}
                        <div className="md:col-span-7">
                            <section className="bg-[#121226] rounded-3xl p-6 border border-white/10 h-full flex flex-col">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-secondary-400" />
                                    2. Choose Game
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-start">
                                    {tournamentGames.map(game => (
                                        <button
                                            key={game.id}
                                            onClick={() => setSelectedGameId(game.id as GameId)}
                                            className={`
                                                relative p-5 rounded-2xl border text-left transition-all group
                                                ${selectedGameId === game.id
                                                    ? 'bg-primary-500/10 border-primary-500/50 ring-1 ring-primary-500/50'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}
                                            `}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`
                                                    p-3 rounded-xl transition-colors
                                                    ${selectedGameId === game.id ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60 group-hover:bg-white/20'}
                                                `}>
                                                    <FeatureIcon icon={game.icon} size="sm" />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold mb-1 ${selectedGameId === game.id ? 'text-white' : 'text-white/90'}`}>{game.name}</h3>
                                                    <p className="text-xs text-white/50 leading-relaxed">{game.description}</p>
                                                </div>
                                            </div>
                                            {selectedGameId === game.id && (
                                                <div className="absolute top-4 right-4 w-2 h-2 bg-primary-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                                    <button
                                        onClick={handleStart}
                                        disabled={setupPlayers.length < 2 || !selectedGameId}
                                        className="
                                            btn-primary py-4 px-16 rounded-2xl font-bold text-lg 
                                            shadow-[0_0_30px_rgba(236,72,153,0.3)]
                                            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                                            flex items-center gap-3 transition-transform active:scale-95
                                        "
                                    >
                                        <Swords className="w-5 h-5" />
                                        Build Bracket
                                    </button>
                                </div>
                            </section>
                        </div>
                    </m.div>
                ) : (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-500/20 rounded-xl">
                                    <FeatureIcon
                                        icon={gamesWithCategory.find(g => g.id === tournament.gameId)?.icon || Trophy}
                                        color={gamesWithCategory.find(g => g.id === tournament.gameId)?.color || 'accent'}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{gamesWithCategory.find(g => g.id === tournament.gameId)?.name} Tournament</h3>
                                    <p className="text-white/40 text-sm">Round {tournament.currentRound}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-sm text-white/60">
                                <div className="flex flex-col items-center px-4 border-r border-white/10">
                                    <span className="font-bold text-white text-lg">{tournament.players.length}</span>
                                    <span className="text-xs">Players</span>
                                </div>
                                <div className="flex flex-col items-center px-4">
                                    <span className="font-bold text-white text-lg">{tournament.matches.length}</span>
                                    <span className="text-xs">Matches</span>
                                </div>
                            </div>
                        </div>

                        <BracketView />

                        <div className="text-center text-white/30 text-sm mt-8">
                            * Tap a player to advance them manually, or use the play button to start the game match.
                        </div>
                    </m.div>
                )}
            </div>
        </div>
    )
}
