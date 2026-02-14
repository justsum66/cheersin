/**
 * TD-28：usePartyStore 單元測試
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { usePartyStore } from '@/store/usePartyStore'

const mkMember = (id: string, name: string, isHost = false) => ({
    id,
    name,
    avatar: `https://avatar/${id}`,
    isReady: false,
    isHost,
})

describe('usePartyStore', () => {
    beforeEach(() => {
        usePartyStore.getState().resetParty()
    })

    describe('initial state', () => {
        it('starts with null room and empty members', () => {
            const state = usePartyStore.getState()
            expect(state.roomId).toBeNull()
            expect(state.roomCode).toBeNull()
            expect(state.members).toEqual([])
            expect(state.currentGame).toBeNull()
            expect(state.isHost).toBe(false)
            expect(state.partyPlan).toBeNull()
        })
    })

    describe('setRoomInfo', () => {
        it('sets room id, code, and host flag', () => {
            usePartyStore.getState().setRoomInfo('room-1', 'ABCD', true)
            const state = usePartyStore.getState()
            expect(state.roomId).toBe('room-1')
            expect(state.roomCode).toBe('ABCD')
            expect(state.isHost).toBe(true)
        })
    })

    describe('member management', () => {
        it('addMember adds a member', () => {
            usePartyStore.getState().addMember(mkMember('m1', 'Alice'))
            expect(usePartyStore.getState().members).toHaveLength(1)
        })

        it('addMember prevents duplicate by id', () => {
            usePartyStore.getState().addMember(mkMember('m1', 'Alice'))
            usePartyStore.getState().addMember(mkMember('m1', 'Alice2'))
            expect(usePartyStore.getState().members).toHaveLength(1)
            expect(usePartyStore.getState().members[0].name).toBe('Alice')
        })

        it('removeMember removes by id', () => {
            usePartyStore.getState().addMember(mkMember('m1', 'Alice'))
            usePartyStore.getState().addMember(mkMember('m2', 'Bob'))
            usePartyStore.getState().removeMember('m1')
            expect(usePartyStore.getState().members).toHaveLength(1)
            expect(usePartyStore.getState().members[0].id).toBe('m2')
        })

        it('setMemberReady toggles isReady', () => {
            usePartyStore.getState().addMember(mkMember('m1', 'Alice'))
            usePartyStore.getState().setMemberReady('m1', true)
            expect(usePartyStore.getState().members[0].isReady).toBe(true)
            usePartyStore.getState().setMemberReady('m1', false)
            expect(usePartyStore.getState().members[0].isReady).toBe(false)
        })

        it('syncMembers replaces entire member list', () => {
            usePartyStore.getState().addMember(mkMember('m1', 'Alice'))
            const newMembers = [mkMember('m2', 'Bob'), mkMember('m3', 'Charlie')]
            usePartyStore.getState().syncMembers(newMembers)
            expect(usePartyStore.getState().members).toHaveLength(2)
            expect(usePartyStore.getState().members[0].id).toBe('m2')
        })
    })

    describe('game & plan', () => {
        it('setCurrentGame sets the active game', () => {
            usePartyStore.getState().setCurrentGame('dice')
            expect(usePartyStore.getState().currentGame).toBe('dice')
        })

        it('setCurrentGame clears with null', () => {
            usePartyStore.getState().setCurrentGame('dice')
            usePartyStore.getState().setCurrentGame(null)
            expect(usePartyStore.getState().currentGame).toBeNull()
        })

        it('setPartyPlan sets party plan', () => {
            const plan = {
                phases: [{ phase: 'Warm-up', durationMin: 10, gameIds: ['dice'], transitionText: 'Let\'s start!' }],
                totalMin: 10,
            }
            usePartyStore.getState().setPartyPlan(plan)
            expect(usePartyStore.getState().partyPlan).toEqual(plan)
        })
    })

    describe('resetParty', () => {
        it('resets all state to defaults', () => {
            usePartyStore.getState().setRoomInfo('r1', 'CODE', true)
            usePartyStore.getState().addMember(mkMember('m1', 'Alice'))
            usePartyStore.getState().setCurrentGame('trivia')
            usePartyStore.getState().resetParty()
            const state = usePartyStore.getState()
            expect(state.roomId).toBeNull()
            expect(state.roomCode).toBeNull()
            expect(state.members).toEqual([])
            expect(state.currentGame).toBeNull()
            expect(state.isHost).toBe(false)
            expect(state.partyPlan).toBeNull()
        })
    })
})
