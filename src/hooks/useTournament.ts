import { useState, useCallback, useEffect } from 'react'
import { nanoid } from 'nanoid'
import type { GameId } from '@/config/games.config'
import confetti from 'canvas-confetti'

export interface TournamentPlayer {
    id: string
    name: string
    avatar?: string
}

export interface TournamentMatch {
    id: string
    round: number
    player1: TournamentPlayer | null
    player2: TournamentPlayer | null
    winnerId: string | null
    nextMatchId: string | null
    nextMatchSlot?: 0 | 1 // 0 = player1, 1 = player2
}

export interface TournamentState {
    id: string
    players: TournamentPlayer[]
    matches: TournamentMatch[]
    currentRound: number
    winner: TournamentPlayer | null
    gameId: GameId
    status: 'setup' | 'in-progress' | 'completed'
}

const STORAGE_KEY = 'cheersin_tournament_state'

export function useTournament() {
    const [tournament, setTournament] = useState<TournamentState | null>(null)

    // Load from local storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    setTournament(JSON.parse(saved))
                } catch (e) {
                    console.error('Failed to parse tournament state', e)
                }
            }
        }
    }, [])

    // Save to local storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (tournament) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(tournament))
            } else {
                localStorage.removeItem(STORAGE_KEY)
            }
        }
    }, [tournament])

    const startTournament = useCallback((playerNames: string[], gameId: GameId) => {
        if (playerNames.length < 2) return

        const players: TournamentPlayer[] = playerNames.map(name => ({
            id: nanoid(),
            name,
        }))

        // Verify power of 2 or calculate rounds
        // We will create a full binary tree for the bracket
        // 1. Calculate next power of 2
        const n = players.length
        const totalSlots = Math.pow(2, Math.ceil(Math.log2(n)))
        const rounds = Math.log2(totalSlots)

        // 2. Generate matches layer by layer
        // We generate from Finals (Round = totalRounds) down to Round 1?
        // Or Round 1 up. Let's do Round 1 up to simplify NextMatch linking.
        // Actually, creating matches from top (Final) down allows linking 'children' matches to 'parent'.
        // But here flow is Player -> Round 1 -> ... -> Final.
        // 'nextMatchId' is the parent in the tree.

        // Let's generate all match IDs first to allow linking
        const matchLayers: TournamentMatch[][] = []

        // Create empty matches for all rounds
        for (let r = 1; r <= rounds; r++) {
            const matchCount = Math.pow(2, rounds - r)
            const layerMatches: TournamentMatch[] = []
            for (let i = 0; i < matchCount; i++) {
                layerMatches.push({
                    id: nanoid(),
                    round: r,
                    player1: null,
                    player2: null,
                    winnerId: null,
                    nextMatchId: null,
                    nextMatchSlot: i % 2 === 0 ? 0 : 1 // This is for the NEXT match to point to, but wait...
                    // The slot in the NEXT match depends on THIS match's position.
                    // If this is the 0th match in Round 1, it goes to 0th match in Round 2, slot 0.
                    // If 1st match in Round 1, it goes to 0th match in Round 2, slot 1.
                })
            }
            matchLayers.push(layerMatches)
        }

        // Link matches (Set nextMatchId)
        // Iterate rounds 1 to N-1
        for (let r = 0; r < rounds - 1; r++) {
            const currentLayer = matchLayers[r]
            const nextLayer = matchLayers[r + 1]

            currentLayer.forEach((match, index) => {
                const nextMatchIndex = Math.floor(index / 2)
                const nextMatch = nextLayer[nextMatchIndex]
                if (nextMatch) {
                    match.nextMatchId = nextMatch.id
                    match.nextMatchSlot = (index % 2) === 0 ? 0 : 1
                }
            })
        }

        const allMatches = matchLayers.flat()

        // 3. Place players in Round 1
        // Shuffle players
        const shuffled = [...players].sort(() => Math.random() - 0.5)

        // Distribution Strategy for Byes:
        // Byes should ideally go to the highest seeds if seeded, but here random.
        // If we have N players and S slots (S is power of 2), we have (S-N) byes.
        // We handle byes by placing "null" as opponent? No, better:
        // A match with only one player automatically resolves to that player winning.
        // We fill the first matches with 2 players, then the rest get 1 player (Bye).
        // Wait, standard Bye placement is: 1 vs Bye, 2 vs ...?
        // Let's just fill slots linearly.
        // Slot 0 (Match 0, P1): Player 0
        // Slot 1 (Match 0, P2): Player 1
        // ...
        // If we run out of players, the slot remains null.

        const round1Matches = matchLayers[0]
        let playerIdx = 0

        round1Matches.forEach(match => {
            if (playerIdx < shuffled.length) match.player1 = shuffled[playerIdx++] || null
            if (playerIdx < shuffled.length) match.player2 = shuffled[playerIdx++] || null
        })

        // 4. Resolve Byes immediately
        // If a match in Round 1 has only one player, that player auto-wins.
        // Also need to handle case where NO players in a match? (Should not happen if optimal rounds calculated)

        // Helper to collect all updates
        let updatesMade = true
        while (updatesMade) {
            updatesMade = false
            allMatches.forEach(match => {
                if (match.winnerId) return // Already decided

                // Check for generic auto-win (Bye) or if both previous matches resolved (for later rounds)
                if (match.player1 && !match.player2) {
                    // Auto win for P1
                    match.winnerId = match.player1.id
                    propagateToNext(allMatches, match)
                    updatesMade = true
                } else if (!match.player1 && match.player2) {
                    // Auto win for P2 (unlikely with linear fill but possible)
                    match.winnerId = match.player2.id
                    propagateToNext(allMatches, match)
                    updatesMade = true
                }
                // Determine winner if both inputs are valid? No, that's manual user action.
            })
        }

        setTournament({
            id: nanoid(),
            players,
            matches: allMatches,
            currentRound: 1,
            winner: null,
            gameId,
            status: 'in-progress'
        })

    }, [])

    const propagateToNext = (matches: TournamentMatch[], finishedMatch: TournamentMatch) => {
        if (!finishedMatch.nextMatchId || !finishedMatch.winnerId) return

        const nextMatch = matches.find(m => m.id === finishedMatch.nextMatchId)
        if (!nextMatch) return

        const winner = finishedMatch.winnerId === finishedMatch.player1?.id ? finishedMatch.player1 : finishedMatch.player2

        if (finishedMatch.nextMatchSlot === 0) {
            nextMatch.player1 = winner
        } else {
            nextMatch.player2 = winner
        }
    }

    const setMatchWinner = useCallback((matchId: string, winnerId: string) => {
        setTournament(prev => {
            if (!prev) return null
            const newMatches = JSON.parse(JSON.stringify(prev.matches)) as TournamentMatch[] // Deep copy needed
            const match = newMatches.find(m => m.id === matchId)

            if (!match || match.winnerId) return prev // Already decided or invalid

            match.winnerId = winnerId

            // Resolve Next Match
            propagateToNext(newMatches, match)

            // Check if this triggered other auto-wins (e.g. next match becomes a Bye)
            // We need a loop for cascading byes
            let updatesMade = true
            while (updatesMade) {
                updatesMade = false
                newMatches.forEach(m => {
                    if (m.winnerId) return // Already done
                    if (!m.player1 && !m.player2) return // Empty match

                    // Auto-advance checking
                    // Only auto-advance if it's the current round or previous resolved?
                    // Actually, standard logic: if a match has 1 player and the other slot is definitely empty (how to know?)
                    // In our logic, slots are filled from previous rounds. 
                    // If a previous match finishes, it fills a slot.
                    // If the OTHER slot is waiting for a match that is NOT finished, we can't auto-win yet.

                    // Simple check: Is the opponent slot waiting for a match?
                    // We can check if the feeding match exists.
                    // But simpler: We only auto-advance if we know for sure.
                    // For now, let's strictly auto-advance only in Round 1 logic or if we implement "Walkover".
                    // But here, if a player reaches a match where the opponent is empty... 
                    // The opponent might be coming from a delayed match.
                    // We should only auto-advance if the feeding match implies NO player coming.
                    // This is complex. For simple tournament, Byes only happen in Round 1.
                    // So cascaded Byes shouldn't strictly happen unless we have "Empty" slots propagating.
                })
            }

            // Check for Tournament Winner
            const finalMatch = newMatches.find(m => !m.nextMatchId)
            let winner = prev.winner
            let status = prev.status

            if (finalMatch && finalMatch.winnerId) {
                winner = prev.players.find(p => p.id === finalMatch.winnerId) || null
                status = 'completed'
                if (winner) {
                    triggerConfetti()
                }
            }

            return {
                ...prev,
                matches: newMatches,
                winner,
                status
            }
        })
    }, [])

    const triggerConfetti = () => {
        const duration = 3000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

        const interval: ReturnType<typeof setInterval> = setInterval(function () {
            const timeLeft = animationEnd - Date.now()
            if (timeLeft <= 0) return clearInterval(interval)

            const particleCount = 50 * (timeLeft / duration)
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
        }, 250)
    }

    const resetTournament = useCallback(() => {
        setTournament(null)
    }, [])

    return {
        tournament,
        startTournament,
        setMatchWinner,
        resetTournament
    }
}
