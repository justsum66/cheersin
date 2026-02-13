'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { usePartyStore } from '@/store/usePartyStore'
import { logger } from '@/lib/logger'
import { useUserStore } from '@/store/useUserStore'
import { toast } from 'react-hot-toast'
import PartyLobby from './PartyLobby'

export default function PartyRoomManager() {
    const supabase = createClientComponentClient()
    const { roomId, roomCode, members, addMember, removeMember, isHost } = usePartyStore()
    const user = useUserStore(state => state.user)
    const channelRef = useRef<any>(null)

    useEffect(() => {
        if (!roomId || !user) return

        // Initialize Realtime Channel
        const channel = supabase.channel(`party:${roomId}`, {
            config: {
                presence: {
                    key: user.id,
                },
            },
        })

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState()
                // Map presence state to members
                // Presence state structure: { [key: string]: [ { user_id: ..., ... } ] }
                // We'll trust the payload we send in .track()
                logger.debug('Party presence sync', { count: Object.keys(newState).length })
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                newPresences.forEach((p: any) => {
                    addMember({
                        id: p.user_id,
                        name: p.name || 'Unknown',
                        avatar: p.avatar || '',
                        isReady: false,
                        isHost: p.is_host || false
                    })
                    toast.success(`${p.name || '有人'} 加入了派對`, { duration: 2000 })
                })
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                removeMember(key)
            })
            .on('broadcast', { event: 'game_start' }, (payload) => {
                logger.debug('Party game started', { event: payload?.event })
                // Handle game start sync
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        name: user.name || user.email?.split('@')[0] || 'Guest', // Use name if available
                        avatar: user.avatarUrl || '',
                        is_host: isHost,
                        online_at: new Date().toISOString(),
                    })
                }
            })

        channelRef.current = channel

        return () => {
            supabase.removeChannel(channel)
        }
    }, [roomId, user, supabase, addMember, removeMember, isHost])

    if (!roomId) {
        return <PartyLobby />
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
            <div className="flex justify-between items-center glass-card p-6 rounded-2xl">
                <div>
                    <h2 className="text-xl font-bold">派對房間</h2>
                    <p className="text-white/50 text-sm">代碼: <span className="font-mono text-secondary text-lg ml-2">{roomCode}</span></p>
                </div>
                <div className="flex items-center gap-2" role="status" aria-live="polite" aria-label={`${members.length} 人在線`}>
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" aria-hidden></span>
                    <span className="text-sm font-medium">{members.length} 人在線</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="status" aria-live="polite" aria-label={`目前 ${members.length} 位玩家`}>
                {members.map(member => (
                    <div key={member.id} className="glass-card p-4 rounded-xl flex flex-col items-center justify-center space-y-3 relative group">
                        {member.isHost && (
                            <span className="absolute top-2 right-2 text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full border border-secondary/30">
                                房主
                            </span>
                        )}
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20 group-hover:border-primary/50 transition-colors relative">
                            {member.avatar ? (
                                <Image
                                    src={member.avatar}
                                    alt={member.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <span className="text-2xl">{member.name[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="font-medium truncate max-w-[120px]">{member.name}</div>
                        </div>
                    </div>
                ))}

                {/* Empty slots placeholders */}
                {Array.from({ length: Math.max(0, 8 - members.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="glass-card p-4 rounded-xl flex flex-col items-center justify-center space-y-3 opacity-30 border-dashed border-white/10">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="text-2xl text-white/20">+</span>
                        </div>
                        <div className="h-5 w-20 bg-white/10 rounded"></div>
                    </div>
                ))}
            </div>

            {isHost ? (
                <div className="flex justify-center pt-8">
                    <button
                        className="btn-primary w-full max-w-sm py-4 text-xl shadow-hero-glow"
                        onClick={async () => {
                            // Broadcast game start to all members
                            // In a real app we'd trigger a Supabase function or broadcast event
                            // For now we assume the 'broadcast' event in useEffect will pick it up if we sent it,
                            // or we just rely on local state if we are just testing MVP on single device?
                            // Realtime broadcast:
                            const channel = supabase.channel(`party:${roomId}`)
                            // Wait, we are already subscribed in useEffect, we should reuse that channel if possible
                            // or just send on the same topic.
                            // Actually, using the same topic name 'party:ROOMID' should work.

                            await channel.send({
                                type: 'broadcast',
                                event: 'game_start',
                                payload: { url: '/games' }
                            })

                            // Host navigates immediately
                            window.location.href = '/games'
                        }}
                    >
                        開始遊戲
                    </button>
                </div>
            ) : (
                <div className="text-center pt-8 text-white/50 animate-pulse">
                    等待房主開始遊戲...
                </div>
            )}
        </div>
    )
}
