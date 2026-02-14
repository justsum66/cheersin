'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { m , AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Check, UserPlus, Crown } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useSubscription } from '@/hooks/useSubscription'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { usePartyStore } from '@/store/usePartyStore'
import { logger } from '@/lib/logger'
import { useUserStore } from '@/store/useUserStore'
import { toast } from 'react-hot-toast'
import PartyLobby from './PartyLobby'

/** R2-077：從 presence state 轉成 members，含 isReady 同步 */
function presenceStateToMembers(state: Record<string, Array<{ user_id?: string; name?: string; avatar?: string; is_host?: boolean; isReady?: boolean }>>): Array<{ id: string; name: string; avatar: string; isReady: boolean; isHost: boolean }> {
    const list: Array<{ id: string; name: string; avatar: string; isReady: boolean; isHost: boolean }> = []
    for (const key of Object.keys(state)) {
        const arr = state[key]
        const p = Array.isArray(arr) ? arr[0] : undefined
        if (p && p.user_id) {
            list.push({
                id: p.user_id,
                name: p.name ?? 'Unknown',
                avatar: p.avatar ?? '',
                isReady: Boolean(p.isReady),
                isHost: Boolean(p.is_host),
            })
        }
    }
    return list
}

export default function PartyRoomManager() {
    const supabase = createClientComponentClient()
    const { tier } = useSubscription()
    const { roomId, roomCode, members, addMember, removeMember, syncMembers, setMemberReady, isHost } = usePartyStore()
    const user = useUserStore(state => state.user)
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
    const prefersReducedMotion = usePrefersReducedMotion()
    /** R2-077：自己的 presence payload，用於切換準備時重送 track */
    const myPresenceRef = useRef<{ user_id: string; name: string; avatar: string; is_host: boolean; isReady: boolean; online_at: string } | null>(null)
    /** R2-067：玩家加入通知佇列，AnimatePresence 入場後自動移除 */
    const [joinNotifications, setJoinNotifications] = useState<Array<{ id: string; name: string; avatar: string; ts: number }>>([])
    const joinTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

    useEffect(() => {
        if (!roomId || !user) return

        const channel = supabase.channel(`party:${roomId}`, {
            config: { presence: { key: user.id } },
        })

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState() as Record<string, Array<{ user_id?: string; name?: string; avatar?: string; is_host?: boolean; isReady?: boolean }>>
                const list = presenceStateToMembers(newState)
                syncMembers(list)
                logger.debug('Party presence sync', { count: list.length })
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                newPresences.forEach((presence) => {
                    const p = (presence as { user_id?: string; name?: string; avatar?: string; is_host?: boolean; isReady?: boolean }) ?? {}
                    const uid = p.user_id ?? ''
                    if (!uid || uid === user?.id) return
                    addMember({
                        id: uid,
                        name: p.name ?? 'Unknown',
                        avatar: p.avatar ?? '',
                        isReady: Boolean(p.isReady),
                        isHost: Boolean(p.is_host),
                    })
                    toast.success(`${p.name ?? '有人'} 加入了派對`, { duration: 2000 })
                    setJoinNotifications((prev) => {
                        const next = [...prev, { id: `${uid}-${Date.now()}`, name: p.name ?? 'Unknown', avatar: p.avatar ?? '', ts: Date.now() }]
                        const key = next[next.length - 1].id
                        joinTimeoutRef.current[key] = setTimeout(() => {
                            setJoinNotifications((n) => n.filter((x) => x.id !== key))
                            delete joinTimeoutRef.current[key]
                        }, 3200)
                        return next
                    })
                })
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                removeMember(key)
            })
            .on('broadcast', { event: 'game_start' }, (payload) => {
                logger.debug('Party game started', { event: payload?.event })
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    const payload = {
                        user_id: user.id,
                        name: user.name ?? user.email?.split('@')[0] ?? 'Guest',
                        avatar: user.avatarUrl ?? '',
                        is_host: isHost,
                        isReady: false,
                        online_at: new Date().toISOString(),
                    }
                    myPresenceRef.current = payload
                    await channel.track(payload)
                }
            })

        channelRef.current = channel
        return () => {
            Object.values(joinTimeoutRef.current).forEach(clearTimeout)
            joinTimeoutRef.current = {}
            supabase.removeChannel(channel)
        }
    }, [roomId, user, supabase, addMember, removeMember, syncMembers, isHost])

    /** R2-077：切換準備狀態並 broadcast 到 presence */
    const toggleReady = useCallback(async () => {
        const ch = channelRef.current
        const me = myPresenceRef.current
        if (!ch || !me || !user) return
        const nextReady = !me.isReady
        const payload = { ...me, isReady: nextReady, online_at: new Date().toISOString() }
        myPresenceRef.current = payload
        setMemberReady(user.id, nextReady)
        await ch.track(payload)
        toast.success(nextReady ? '已準備' : '已取消準備', { duration: 1500 })
    }, [user, setMemberReady])

    if (!roomId) {
        return <PartyLobby />
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8 relative">
            {/* R2-067：玩家加入通知 — AnimatePresence 自頂部滑入 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 w-full max-w-sm px-4">
                <AnimatePresence>
                    {joinNotifications.map((n) => (
                        <m.div
                            key={n.id}
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -24, scale: 0.9 }}
                            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.95 }}
                            transition={prefersReducedMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 400, damping: 28 }}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-200 shadow-lg glass-card w-full"
                            role="status"
                            aria-live="polite"
                        >
                            <UserPlus className="w-5 h-5 text-green-400 shrink-0" aria-hidden />
                            <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                {n.avatar ? (
                                    <Image src={n.avatar} alt="" fill className="object-cover" unoptimized sizes="32px" />
                                ) : (
                                    <span className="text-sm font-semibold text-green-300">{n.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <span className="text-sm font-medium truncate flex-1">{n.name} 加入了派對</span>
                        </m.div>
                    ))}
                </AnimatePresence>
            </div>
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
                {members.map(member => {
                  const isCurrentUser = user?.id === member.id
                  return (
                    <div key={member.id} className="glass-card p-4 rounded-xl flex flex-col items-center justify-center space-y-3 relative group">
                        {member.isHost && (
                            <span className="absolute top-2 right-2 text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full border border-secondary/30">
                                房主
                            </span>
                        )}
                        {member.isReady && (
                            <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-green-500/80 flex items-center justify-center" aria-label="已準備">
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </span>
                        )}
                        <div className={`relative w-16 h-16 flex items-center justify-center ${isCurrentUser ? '' : ''}`}>
                          {isCurrentUser && (
                            <m.div
                              className="absolute inset-0 rounded-full border-2 border-primary-400/60 pointer-events-none"
                              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                              aria-hidden
                            />
                          )}
                          <div className={`w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 transition-colors relative shrink-0 ${isCurrentUser ? 'border-primary-400/60' : 'border-white/20 group-hover:border-primary/50'} ${member.isReady ? 'ring-2 ring-green-400/50' : ''}`}>
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
                        </div>
                        <div className="text-center w-full">
                            <div className="font-medium truncate max-w-[120px] mx-auto">{member.name}</div>
                            {isCurrentUser && (
                                <m.button
                                    type="button"
                                    onClick={toggleReady}
                                    whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                                    className={`mt-2 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors games-focus-ring ${member.isReady ? 'bg-green-500/30 text-green-300 border border-green-500/40' : 'bg-white/10 text-white/80 hover:bg-white/15'}`}
                                    aria-pressed={member.isReady}
                                    aria-label={member.isReady ? '已準備（點擊取消）' : '點擊準備'}
                                >
                                    {member.isReady ? '已準備' : '準備'}
                                </m.button>
                            )}
                        </div>
                    </div>
                  )
                })}

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

            {members.length >= 2 && (
                <p className="text-center text-sm text-white/60" role="status">
                    {members.every(m => m.isReady)
                        ? '全部準備好了！房主可點擊開始遊戲'
                        : `${members.filter(m => m.isReady).length} / ${members.length} 已準備`}
                </p>
            )}
            {/* R2-183：免費房主顯示解鎖 12 人 CTA */}
            {isHost && tier === 'free' && (
                <div className="flex justify-center">
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-primary-500/20 border border-primary-500/40 text-primary-300 text-sm font-medium hover:bg-primary-500/30 transition-colors games-focus-ring"
                        aria-label="升級解鎖 12 人房間"
                    >
                        <Crown className="w-4 h-4" aria-hidden />
                        升級解鎖 12 人
                    </Link>
                </div>
            )}
            {isHost ? (
                <div className="flex justify-center pt-8">
                    <m.button
                        className="btn-primary w-full max-w-sm py-4 text-xl shadow-hero-glow disabled:opacity-50 disabled:cursor-not-allowed"
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                        onClick={async () => {
                            const ch = channelRef.current
                            if (ch) {
                                await ch.send({
                                    type: 'broadcast',
                                    event: 'game_start',
                                    payload: { url: '/games' },
                                })
                            }
                            window.location.href = '/games'
                        }}
                        disabled={members.length < 2}
                        aria-label="開始遊戲"
                    >
                        開始遊戲
                    </m.button>
                </div>
            ) : (
                <div className="text-center pt-8 text-white/50 animate-pulse">
                    等待房主開始遊戲...
                </div>
            )}
        </div>
    )
}
