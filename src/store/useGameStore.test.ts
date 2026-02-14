/**
 * TD-28：useGameStore 單元測試
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@/store/useGameStore'

describe('useGameStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        useGameStore.setState({
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
        })
    })

    describe('initial state', () => {
        it('should start in lobby state', () => {
            const state = useGameStore.getState()
            expect(state.gameState).toBe('lobby')
            expect(state.round).toBe(1)
            expect(state.players).toEqual([])
            expect(state.roomId).toBeNull()
        })
    })

    describe('room & navigation', () => {
        it('setRoomId sets room', () => {
            useGameStore.getState().setRoomId('room-123')
            expect(useGameStore.getState().roomId).toBe('room-123')
        })

        it('setCurrentRoomSlug sets slug', () => {
            useGameStore.getState().setCurrentRoomSlug('my-room')
            expect(useGameStore.getState().currentRoomSlug).toBe('my-room')
        })

        it('setCategoryFilter sets filter', () => {
            useGameStore.getState().setCategoryFilter('dice')
            expect(useGameStore.getState().categoryFilter).toBe('dice')
        })
    })

    describe('player management', () => {
        const player1 = { id: 'p1', name: 'Alice', score: 0 }
        const player2 = { id: 'p2', name: 'Bob', score: 0 }

        it('addPlayer adds a player and auto-assigns host', () => {
            useGameStore.getState().addPlayer(player1)
            const state = useGameStore.getState()
            expect(state.players).toHaveLength(1)
            expect(state.players[0].name).toBe('Alice')
            expect(state.hostId).toBe('p1')
        })

        it('addPlayer prevents duplicates', () => {
            useGameStore.getState().addPlayer(player1)
            useGameStore.getState().addPlayer(player1)
            expect(useGameStore.getState().players).toHaveLength(1)
        })

        it('addPlayer does not override existing host', () => {
            useGameStore.getState().addPlayer(player1)
            useGameStore.getState().addPlayer(player2)
            expect(useGameStore.getState().hostId).toBe('p1')
        })

        it('removePlayer removes player', () => {
            useGameStore.getState().addPlayer(player1)
            useGameStore.getState().addPlayer(player2)
            useGameStore.getState().removePlayer('p1')
            expect(useGameStore.getState().players).toHaveLength(1)
            expect(useGameStore.getState().players[0].id).toBe('p2')
        })

        it('removePlayer reassigns host when host is removed', () => {
            useGameStore.getState().addPlayer(player1)
            useGameStore.getState().addPlayer(player2)
            useGameStore.getState().removePlayer('p1')
            expect(useGameStore.getState().hostId).toBe('p2')
        })

        it('removePlayer sets host to null when last player removed', () => {
            useGameStore.getState().addPlayer(player1)
            useGameStore.getState().removePlayer('p1')
            expect(useGameStore.getState().hostId).toBeNull()
        })

        it('updatePlayer updates specific fields', () => {
            useGameStore.getState().addPlayer(player1)
            useGameStore.getState().updatePlayer('p1', { score: 10 })
            expect(useGameStore.getState().players[0].score).toBe(10)
        })
    })

    describe('game state', () => {
        it('setGameState transitions state', () => {
            useGameStore.getState().setGameState('playing')
            expect(useGameStore.getState().gameState).toBe('playing')
        })

        it('setCurrentGameId resets stats/replay when switching games', () => {
            useGameStore.getState().setStats({ correctCount: 5 })
            useGameStore.getState().addReplayEvent({ type: 'answer', label: 'Correct!' })
            useGameStore.getState().setCurrentGameId('game-1')
            useGameStore.getState().setCurrentGameId('game-2')
            const state = useGameStore.getState()
            expect(state.currentGameId).toBe('game-2')
            expect(state.stats).toEqual({})
            expect(state.replayEvents).toEqual([])
        })

        it('setRound updates round', () => {
            useGameStore.getState().setRound(5)
            expect(useGameStore.getState().round).toBe(5)
        })
    })

    describe('stats & replay', () => {
        it('setStats merges stats', () => {
            useGameStore.getState().setStats({ correctCount: 3 })
            useGameStore.getState().setStats({ punishmentCount: 2 })
            const { stats } = useGameStore.getState()
            expect(stats.correctCount).toBe(3)
            expect(stats.punishmentCount).toBe(2)
        })

        it('addReplayEvent appends with timestamp', () => {
            useGameStore.getState().addReplayEvent({ type: 'guess', label: 'Guessed X' })
            const { replayEvents } = useGameStore.getState()
            expect(replayEvents).toHaveLength(1)
            expect(replayEvents[0].type).toBe('guess')
            expect(replayEvents[0].ts).toBeGreaterThan(0)
        })

        it('addReplayEvent caps at 50 events', () => {
            for (let i = 0; i < 60; i++) {
                useGameStore.getState().addReplayEvent({ type: 'e', label: `Event ${i}` })
            }
            expect(useGameStore.getState().replayEvents.length).toBeLessThanOrEqual(50)
        })
    })

    describe('trial & spectator', () => {
        it('setSpectator sets flag', () => {
            useGameStore.getState().setSpectator(true)
            expect(useGameStore.getState().isSpectator).toBe(true)
        })

        it('setTrial sets trial state', () => {
            useGameStore.getState().setTrial(true, 5)
            const { trial } = useGameStore.getState()
            expect(trial.isTrial).toBe(true)
            expect(trial.roundsLeft).toBe(5)
        })

        it('decrementTrialRound decrements and floors at 0', () => {
            useGameStore.getState().setTrial(true, 1)
            useGameStore.getState().decrementTrialRound()
            expect(useGameStore.getState().trial.roundsLeft).toBe(0)
            useGameStore.getState().decrementTrialRound()
            expect(useGameStore.getState().trial.roundsLeft).toBe(0)
        })
    })

    describe('resetGame', () => {
        it('resets game state to defaults', () => {
            useGameStore.getState().setGameState('playing')
            useGameStore.getState().setRound(5)
            useGameStore.getState().addPlayer({ id: 'p1', name: 'A', score: 0 })
            useGameStore.getState().setCurrentGameId('g1')
            useGameStore.getState().resetGame()
            const state = useGameStore.getState()
            expect(state.gameState).toBe('lobby')
            expect(state.round).toBe(1)
            expect(state.players).toEqual([])
            expect(state.currentGameId).toBeNull()
        })
    })
})
