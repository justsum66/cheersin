import { create } from 'zustand'

interface PartyMember {
    id: string
    name: string
    avatar: string
    isReady: boolean
    isHost: boolean
}

// Types for Party Plan
export interface PartyPlanPhase {
    phase: string
    durationMin: number
    gameIds: string[]
    transitionText: string
}

export interface PartyPlan {
    phases: PartyPlanPhase[]
    totalMin: number
}

interface PartyState {
    roomId: string | null
    roomCode: string | null
    members: PartyMember[]
    currentGame: string | null
    isHost: boolean
    partyPlan: PartyPlan | null

    setRoomInfo: (id: string, code: string, isHost: boolean) => void
    addMember: (member: PartyMember) => void
    removeMember: (memberId: string) => void
    setMemberReady: (memberId: string, isReady: boolean) => void
    setCurrentGame: (gameId: string | null) => void
    setPartyPlan: (plan: PartyPlan | null) => void
    resetParty: () => void
}

export const usePartyStore = create<PartyState>((set) => ({
    roomId: null,
    roomCode: null,
    members: [],
    currentGame: null,
    isHost: false,
    partyPlan: null,

    setRoomInfo: (id, code, isHost) => set({ roomId: id, roomCode: code, isHost }),

    addMember: (member) => set((state) => {
        if (state.members.find(m => m.id === member.id)) return state
        return { members: [...state.members, member] }
    }),

    removeMember: (memberId) => set((state) => ({
        members: state.members.filter(m => m.id !== memberId)
    })),

    setMemberReady: (memberId, isReady) => set((state) => ({
        members: state.members.map(m => m.id === memberId ? { ...m, isReady } : m)
    })),

    setCurrentGame: (gameId) => set({ currentGame: gameId }),

    setPartyPlan: (plan) => set({ partyPlan: plan }),

    resetParty: () => set({
        roomId: null,
        roomCode: null,
        members: [],
        currentGame: null,
        isHost: false,
        partyPlan: null
    })
}))
