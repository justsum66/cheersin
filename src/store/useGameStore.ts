import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface GameStatsSnapshot {
    durationSec?: number
    correctCount?: number
    punishmentCount?: number
    funFacts?: Array<{ label: string; value: string }>
}

export interface ReplayEvent {
    type: string
    label: string
    payload?: unknown
    ts: number
}

export type Player = {
    id: string
    name: string
    avatar?: string
    score: number
    isHost?: boolean
    isReady?: boolean
    isOnline?: boolean
}

export type GameState = 'lobby' | 'playing' | 'paused' | 'finished' | 'results'

interface GameStore {
    // Room & Players
    roomId: string | null
    players: Player[]
    hostId: string | null

    // Game Status
    gameState: GameState
    currentGameId: string | null
    round: number
    totalRounds: number

    // Legacy/Context Support
    stats: GameStatsSnapshot
    replayEvents: ReplayEvent[]
    isSpectator: boolean
    trial: {
        isTrial: boolean
        roundsLeft: number
    }

    // Navigation & Filtering (Merged from legacy store)
    currentRoomSlug: string | null
    categoryFilter: string | null

    // Actions
    setRoomId: (id: string) => void
    setCurrentRoomSlug: (slug: string | null) => void
    setCategoryFilter: (category: string | null) => void
    addPlayer: (player: Player) => void
    removePlayer: (playerId: string) => void
    updatePlayer: (playerId: string, updates: Partial<Player>) => void
    setGameState: (state: GameState) => void
    setCurrentGameId: (id: string | null) => void
    setRound: (round: number) => void

    // Phase 1 Task 14: Game Modes
    selectedMode: string | null
    setSelectedMode: (mode: string | null) => void

    // Context Actions
    setStats: (stats: Partial<GameStatsSnapshot>) => void
    addReplayEvent: (event: Omit<ReplayEvent, 'ts'>) => void
    setSpectator: (isSpectator: boolean) => void
    setTrial: (isTrial: boolean, roundsLeft: number) => void
    decrementTrialRound: () => void

    resetGame: () => void
}

/** Task #52: Added devtools middleware for dev debugging */
export const useGameStore = create<GameStore>()(devtools((set) => ({
    roomId: null,
    players: [],
    hostId: null,
    gameState: 'lobby',
    currentGameId: null,
    round: 1,
    totalRounds: 10,

    stats: {},
    replayEvents: [],
    isSpectator: false,
    trial: { isTrial: false, roundsLeft: 3 },

    currentRoomSlug: null,
    categoryFilter: null,

    selectedMode: null,
    setSelectedMode: (selectedMode) => set({ selectedMode }),

    setRoomId: (id) => set({ roomId: id }),
    setCurrentRoomSlug: (currentRoomSlug) => set({ currentRoomSlug }),
    setCategoryFilter: (categoryFilter) => set({ categoryFilter }),

    addPlayer: (player) => set((state) => {
        // Prevent duplicates
        if (state.players.find(p => p.id === player.id)) return state

        // Create new array with new player
        const newPlayers = [...state.players, player]

        // If no host, assign this player as host
        const newHostId = state.hostId || player.id

        return {
            players: newPlayers,
            hostId: newHostId
        }
    }),

    removePlayer: (playerId) => set((state) => {
        const newPlayers = state.players.filter(p => p.id !== playerId)
        // If we removed the host, reassign to first remaining player
        let newHostId = state.hostId
        if (state.hostId === playerId) {
            newHostId = newPlayers.length > 0 ? newPlayers[0].id : null
        }
        return { players: newPlayers, hostId: newHostId }
    }),

    updatePlayer: (playerId, updates) => set((state) => ({
        players: state.players.map(p => p.id === playerId ? { ...p, ...updates } : p)
    })),

    setGameState: (gameState) => set({ gameState }),
    setCurrentGameId: (currentGameId) => set((state) => {
        // Reset stats/replay/mode on game switch
        if (state.currentGameId !== currentGameId) {
            return { currentGameId, stats: {}, replayEvents: [], selectedMode: null }
        }
        return { currentGameId }
    }),
    setRound: (round) => set({ round }),

    setStats: (newStats) => set((state) => ({ stats: { ...state.stats, ...newStats } })),
    addReplayEvent: (event) => set((state) => ({
        replayEvents: [...state.replayEvents.slice(-49), { ...event, ts: Date.now() }]
    })),
    setSpectator: (isSpectator) => set({ isSpectator }),
    setTrial: (isTrial, roundsLeft) => set({ trial: { isTrial, roundsLeft } }),
    decrementTrialRound: () => set((state) => ({
        trial: { ...state.trial, roundsLeft: Math.max(0, state.trial.roundsLeft - 1) }
    })),

    resetGame: () => set({
        gameState: 'lobby',
        round: 1,
        players: [],
        currentGameId: null,
        selectedMode: null,
        stats: {},
        replayEvents: [],
    })
}), { name: 'GameStore', enabled: process.env.NODE_ENV !== 'production' }))
