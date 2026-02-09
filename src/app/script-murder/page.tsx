'use client'

/**
 * Phase 3：酒局劇本殺 — 選劇本、建立/加入房間、角色分配、章節/投票/懲罰、結束統計
 */
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Users, Copy, Play, ChevronLeft, AlertCircle, ChevronDown, ChevronUp, Check, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUser } from '@/contexts/UserContext'
import type { ChapterNode } from '@/types/script-murder'
import { parseChapterContent } from '@/types/script-murder'
import { InViewAnimate } from '@/components/ui/InViewAnimate'

const SCRIPT_MURDER_GAME_ID = 'script_murder'

type ScriptSummary = {
  id: string
  title: string
  slug: string | null
  durationMin: number | null
  minPlayers: number | null
  maxPlayers: number | null
  is18Plus: boolean
}

type ScriptDetail = ScriptSummary & {
  chapters: Array<{ id: string; chapterIndex: number; title: string; content: string | null }>
  roles: Array<{ id: string; roleName: string; roleDescription: string | null; secretClue: string | null }>
}

type RoomInfo = {
  id: string
  slug: string
  hostId: string | null
  maxPlayers: number
  scriptId: string | null
  scriptRoom: boolean
  expiresAt: string | null
}

type ScriptState = {
  scriptId?: string
  phase: 'lobby' | 'play' | 'ended'
  chapterIndex: number
  assignments: Record<string, string>
  votes?: Record<string, string>
  punishmentDone?: boolean
  totalChapters?: number
  stats?: { chaptersCompleted: number; voteRounds: number; punishmentCount: number }
}

export default function ScriptMurderPage() {
  const searchParams = useSearchParams()
  const roomSlug = searchParams.get('room') ?? ''

  const [scripts, setScripts] = useState<ScriptSummary[]>([])
  const [scriptRooms, setScriptRooms] = useState<Array<{ slug: string; scriptTitle: string | null; playerCount: number; maxPlayers: number }>>([])
  const [loadingScripts, setLoadingScripts] = useState(true)
  const [creating, setCreating] = useState(false)
  const [room, setRoom] = useState<RoomInfo | null>(null)
  const [players, setPlayers] = useState<Array<{ id: string; displayName: string; orderIndex: number }>>([])
  const [scriptDetail, setScriptDetail] = useState<ScriptDetail | null>(null)
  const [scriptState, setScriptState] = useState<ScriptState | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [joined, setJoined] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState('')
  const [myRoleId, setMyRoleId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(false)
  const [stateFetched, setStateFetched] = useState(false)
  const [myPlayerRowId, setMyPlayerRowId] = useState<string | null>(null)
  const [roleClueOpen, setRoleClueOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)

  const { user } = useUser()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const isHost = !!room && !!user?.id && room.hostId === user.id

  const fetchScripts = useCallback(async () => {
    setLoadingScripts(true)
    try {
      const [scriptsRes, roomsRes] = await Promise.all([
        fetch('/api/scripts?limit=20'),
        fetch('/api/scripts/rooms?limit=10'),
      ])
      const scriptsData = await scriptsRes.json()
      const roomsData = await roomsRes.json()
      if (scriptsData.scripts) setScripts(scriptsData.scripts)
      if (roomsData.rooms) setScriptRooms(roomsData.rooms.map((r: { slug: string; scriptTitle: string | null; playerCount: number; maxPlayers: number }) => ({ slug: r.slug, scriptTitle: r.scriptTitle, playerCount: r.playerCount, maxPlayers: r.maxPlayers })))
    } catch {
      setError('無法載入劇本列表')
    } finally {
      setLoadingScripts(false)
    }
  }, [])

  const fetchRoom = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/games/rooms/${slug}`)
      if (!res.ok) {
        if (res.status === 404) setError('房間不存在')
        return
      }
      const data = await res.json()
      setRoom(data.room)
      setPlayers(data.players ?? [])
      if (data.room?.scriptId) {
        setInviteUrl(`${baseUrl}/script-murder?room=${slug}`)
        const scriptRes = await fetch(`/api/scripts/${data.room.scriptId}`)
        if (scriptRes.ok) {
          const scriptData = await scriptRes.json()
          if (!scriptData.locked) setScriptDetail(scriptData)
        }
      }
    } catch {
      setError('無法載入房間')
    }
  }, [baseUrl])

  const fetchGameState = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/games/rooms/${slug}/game-state?game_id=${SCRIPT_MURDER_GAME_ID}`)
      setStateFetched(true)
      if (!res.ok) return
      const data = await res.json()
      if (data.state && typeof data.state === 'object') {
        setScriptState(data.state as ScriptState)
      }
    } catch {
      setStateFetched(true)
    }
  }, [])

  const initScriptState = useCallback(async () => {
    if (!roomSlug || !room?.scriptId || initializing) return
    setInitializing(true)
    const payload: ScriptState = {
      scriptId: room.scriptId,
      phase: 'lobby',
      chapterIndex: 0,
      assignments: {},
    }
    try {
      const res = await fetch(`/api/games/rooms/${roomSlug}/game-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: SCRIPT_MURDER_GAME_ID, payload }),
      })
      if (res.ok) {
        const data = await res.json()
        setScriptState(data.state ?? payload)
        fetchGameState(roomSlug)
      }
    } finally {
      setInitializing(false)
    }
  }, [roomSlug, room?.scriptId, initializing, fetchGameState])

  useEffect(() => {
    if (!roomSlug) {
      fetchScripts()
      return
    }
    fetchRoom(roomSlug)
    fetchGameState(roomSlug)
    const t = setInterval(() => {
      fetchRoom(roomSlug)
      fetchGameState(roomSlug)
    }, 3000)
    return () => clearInterval(t)
  }, [roomSlug, fetchScripts, fetchRoom, fetchGameState])

  /** 僅在已 fetch state 且為 null 時初始化 script_murder state（須在頂層，不可置於條件 return 之後） */
  useEffect(() => {
    if (!roomSlug || !room?.scriptId || !stateFetched || scriptState != null || initializing) return
    initScriptState()
  }, [roomSlug, room?.scriptId, stateFetched, scriptState, initializing, initScriptState])

  const createRoom = async (scriptId: string) => {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/games/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return
      }
      if (data.slug) {
        window.location.href = `/script-murder?room=${data.slug}`
      }
    } catch {
      setError('建立房間失敗')
    } finally {
      setCreating(false)
    }
  }

  const joinRoom = async () => {
    if (!roomSlug || !displayName.trim()) {
      setJoinError('請輸入顯示名稱')
      return
    }
    setJoinError(null)
    try {
      const res = await fetch(`/api/games/rooms/${roomSlug}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      })
      const data = await res.json()
      if (data.error) {
        setJoinError(data.message ?? data.error)
        return
      }
      setJoined(true)
      if (data.player?.id) setMyPlayerRowId(data.player.id)
      fetchRoom(roomSlug)
    } catch {
      setJoinError('加入失敗')
    }
  }

  const startGame = async () => {
    if (!roomSlug || !scriptDetail || !room?.scriptId || players.length === 0) return
    const roleIds = scriptDetail.roles.map((r) => r.id)
    const playerIds = players.map((p) => p.id)
    if (playerIds.length > roleIds.length) return
    const shuffled = [...roleIds].sort(() => Math.random() - 0.5)
    const assignments: Record<string, string> = {}
    playerIds.forEach((pid, i) => {
      assignments[pid] = shuffled[i]
    })
    const totalChapters = scriptDetail.chapters.length
    const payload: ScriptState = {
      scriptId: room.scriptId,
      phase: 'play',
      chapterIndex: 0,
      assignments,
      totalChapters,
    }
    const res = await fetch(`/api/games/rooms/${roomSlug}/game-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: SCRIPT_MURDER_GAME_ID, payload }),
    })
    if (res.ok) {
      setScriptState(payload)
      fetchGameState(roomSlug)
    }
  }

  const copyInvite = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setInviteCopied(true)
        toast.success('已複製邀請連結', { duration: 2000 })
        setTimeout(() => setInviteCopied(false), 2000)
      })
    }
  }

  const currentChapter = scriptDetail?.chapters?.[scriptState?.chapterIndex ?? 0]
  const myRole = myRoleId && scriptDetail?.roles?.find((r) => r.id === myRoleId)
  const playerId = myPlayerRowId ?? players.find((p) => p.displayName === displayName)?.id

  useEffect(() => {
    const pid = players.find((p) => p.displayName === displayName)?.id
    if (pid && !myPlayerRowId) setMyPlayerRowId(pid)
  }, [players, displayName, myPlayerRowId])
  useEffect(() => {
    if (!scriptState?.assignments || !playerId || myRoleId) return
    const rid = scriptState.assignments[playerId]
    if (rid) setMyRoleId(rid)
  }, [scriptState?.assignments, playerId, myRoleId])

  const postScriptAction = useCallback(async (action: 'advance' | 'vote' | 'punishment_done', option?: string) => {
    if (!roomSlug || actionLoading) return
    const pid = myPlayerRowId ?? players.find((p) => p.displayName === displayName)?.id
    setActionLoading(true)
    try {
      const body: { action: string; playerId?: string; option?: string } = { action }
      if (action === 'vote' && pid && option !== undefined) {
        body.playerId = pid
        body.option = option
      }
      const res = await fetch(`/api/games/rooms/${roomSlug}/script-murder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.state) setScriptState(data.state)
    } finally {
      setActionLoading(false)
    }
  }, [roomSlug, myPlayerRowId, players, displayName, actionLoading])

  if (!roomSlug) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6">
            <ChevronLeft className="w-4 h-4" /> 返回首頁
          </Link>
          <div className="flex items-center gap-3 text-primary-400 mb-6">
            <BookOpen className="w-10 h-10" aria-hidden />
            <h1 className="text-2xl font-bold text-white">酒局劇本殺</h1>
          </div>
          <p className="text-white/70 mb-8">選擇劇本，建立房間，4–8 人秘密角色、投票、懲罰。</p>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}
          {loadingScripts ? (
            <div className="space-y-4" role="status" aria-label="載入劇本中">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : scripts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center p-6 rounded-xl bg-white/5 border border-white/10"
              role="status"
            >
              <p className="text-white/50 mb-4">尚無劇本，敬請期待。</p>
              <Link href="/games" className="text-primary-400 hover:text-primary-300 text-sm">先去派對遊樂場</Link>
            </motion.div>
          ) : (
            <InViewAnimate y={30} amount={0.15}>
              <ul className="grid gap-4 sm:grid-cols-2" role="list">
              {scripts.map((s, idx) => (
                <li key={s.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[120px]"
                  >
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-white truncate">{s.title}</h2>
                      <p className="text-white/50 text-sm mt-1">
                        {s.minPlayers}–{s.maxPlayers} 人 · 約 {s.durationMin} 分鐘
                      </p>
                      {s.is18Plus && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-300">18+</span>
                      )}
                    </div>
                    <motion.button
                      type="button"
                      disabled={creating}
                      onClick={() => createRoom(s.id)}
                      whileTap={{ scale: 0.97 }}
                      className="min-h-[48px] px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium disabled:opacity-50 games-focus-ring shrink-0"
                      aria-label={`建立 ${s.title} 房間`}
                    >
                      {creating ? '建立中…' : '建立房間'}
                    </motion.button>
                  </motion.div>
                </li>
              ))}
              </ul>
            </InViewAnimate>
          )}
          {scriptRooms.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-white mb-3">現有房間</h2>
              <ul className="space-y-2">
                {scriptRooms.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/script-murder?room=${r.slug}`}
                      className="block p-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      <span className="font-medium">{r.scriptTitle ?? '劇本殺房'}</span>
                      <span className="text-white/50 text-sm ml-2">{r.playerCount}/{r.maxPlayers} 人</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 flex gap-4">
            <Link href="/games" className="text-white/60 hover:text-white text-sm">派對遊樂場</Link>
            <Link href="/learn" className="text-white/60 hover:text-white text-sm">品酒學院</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        {error && <p className="text-red-400">{error}</p>}
        <Link href="/script-murder" className="text-primary-400 hover:text-primary-300">返回劇本列表</Link>
      </div>
    )
  }

  if (!room.scriptRoom || !room.scriptId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-white/70">此房間不是劇本殺房。</p>
        <Link href="/script-murder" className="text-primary-400 hover:text-primary-300">前往劇本殺</Link>
      </div>
    )
  }

  const stateReady = scriptState != null
  const inLobby = stateReady && scriptState.phase === 'lobby'
  const inPlay = stateReady && scriptState.phase === 'play'
  const inEnded = stateReady && scriptState.phase === 'ended'

  if (!stateReady && room.scriptId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" role="status" aria-label="準備房間中">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" aria-hidden />
        <p className="text-white/50">準備房間中…</p>
      </div>
    )
  }

  if (!scriptDetail && room.scriptId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" role="status" aria-label="載入劇本中">
        <div className="w-12 h-12 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" aria-hidden />
        <p className="text-white/50">載入劇本中…</p>
      </div>
    )
  }

  if (inLobby) {
    return (
      <motion.div
        key="lobby"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="min-h-screen px-4 py-8"
      >
        <div className="max-w-lg mx-auto">
          <Link href="/script-murder" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6">
            <ChevronLeft className="w-4 h-4" /> 劇本列表
          </Link>
          <h1 className="text-xl font-bold text-white mb-2">{scriptDetail?.title} — 房間大廳</h1>
          <p className="text-white/60 text-sm mb-6">分享連結邀請好友，人齊後由房主開始遊戲。</p>
          {room.expiresAt && (
            <p className="text-white/40 text-xs mb-4" role="timer">房間有效至 {new Date(room.expiresAt).toLocaleString('zh-TW')}</p>
          )}
          {inviteUrl && (
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              />
              <button
                type="button"
                onClick={copyInvite}
                className="min-h-[48px] px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 games-focus-ring flex items-center gap-2"
                aria-label={inviteCopied ? '已複製連結' : '複製邀請連結'}
              >
                <Copy className="w-5 h-5" />
                {inviteCopied ? '已複製' : '複製'}
              </button>
            </div>
          )}
          {!joined ? (
            <div className="mb-6">
              <label className="block text-white/70 text-sm mb-2">顯示名稱</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="輸入暱稱"
                  maxLength={20}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
                />
                <button
                  type="button"
                  onClick={joinRoom}
                  className="min-h-[48px] px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white games-focus-ring"
                >
                  加入
                </button>
              </div>
              {joinError && <p className="text-red-400 text-sm mt-2">{joinError}</p>}
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-white/70 mb-4">
            <Users className="w-5 h-5" />
            <span>已加入 {players.length} / {room.maxPlayers} 人</span>
          </div>
          <ul className="space-y-2 mb-6">
            {players.map((p) => (
              <li key={p.id} className="text-white/80">{p.displayName}</li>
            ))}
          </ul>
          {joined && players.length >= (scriptDetail?.minPlayers ?? 4) && (
            <button
              type="button"
              onClick={startGame}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium flex items-center justify-center gap-2 games-focus-ring"
            >
              <Play className="w-5 h-5" /> 開始遊戲（分配角色）
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  if (inEnded) {
    const stats = scriptState.stats ?? { chaptersCompleted: 0, voteRounds: 0, punishmentCount: 0 }
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Trophy className="w-16 h-16 text-primary-400 mx-auto mb-4" aria-hidden />
            <h1 className="text-2xl font-bold text-white mb-2">本局結束</h1>
            <p className="text-white/60 mb-6">{scriptDetail?.title}</p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2">
              <p className="text-white/80">完成章節：{stats.chaptersCompleted}</p>
              <p className="text-white/80">投票輪數：{stats.voteRounds}</p>
              <p className="text-white/80">懲罰次數：{stats.punishmentCount}</p>
            </div>
          </motion.div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/script-murder?room=${roomSlug}`}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring inline-flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> 再玩一次
            </Link>
            <Link
              href="/script-murder"
              className="min-h-[48px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white games-focus-ring inline-flex items-center justify-center"
            >
              回大廳
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (inPlay && currentChapter) {
    const contentNodes = parseChapterContent(currentChapter.content)
    const totalCh = scriptDetail.chapters.length
    const currentIdx = scriptState.chapterIndex ?? 0
    const hasVote = contentNodes.some((n) => n.type === 'vote')
    const hasPunishment = contentNodes.some((n) => n.type === 'punishment')
    const myVote = playerId && scriptState.votes?.[playerId]

    return (
      <div className="min-h-screen px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalCh }).map((_, i) => (
                <motion.span
                  key={i}
                  className={`shrink-0 w-2 h-2 rounded-full ${i < currentIdx ? 'bg-primary-500' : i === currentIdx ? 'bg-primary-400' : 'bg-white/20'}`}
                  initial={false}
                  animate={{ scale: i === currentIdx ? 1.2 : 1 }}
                  transition={{ duration: 0.2 }}
                  aria-hidden
                />
              ))}
              <span className="text-white/50 text-sm tabular-nums ml-1" aria-label={`第 ${currentIdx + 1} 章，共 ${totalCh} 章`}>
                第 {currentIdx + 1}/{totalCh} 章
              </span>
            </div>
            <Link href="/script-murder" className="text-white/60 hover:text-white text-sm">離開房間</Link>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-6" role="progressbar" aria-valuenow={currentIdx + 1} aria-valuemin={1} aria-valuemax={totalCh}>
            <motion.div className="h-full bg-primary-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${((currentIdx + 1) / totalCh) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
          {/* R2-102：角色揭曉 — 進入遊戲時角色卡翻轉入場 */}
          {myRole && (
            <motion.div
              key={myRoleId ?? 'role'}
              initial={{ rotateY: -95, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22, duration: 0.5 }}
              style={{ transformOrigin: 'center center', perspective: '1000px' }}
              className="mb-6 rounded-xl bg-primary-500/10 border border-primary-500/20 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setRoleClueOpen((o) => !o)}
                className="w-full p-4 text-left flex items-center justify-between games-focus-ring"
                aria-expanded={roleClueOpen}
                aria-label={roleClueOpen ? '收合角色卡' : '展開角色卡'}
              >
                <div>
                  <h3 className="text-primary-300 font-medium">你的角色</h3>
                  <p className="text-white font-semibold">{myRole.roleName}</p>
                  {myRole.roleDescription && <p className="text-white/70 text-sm mt-1">{myRole.roleDescription}</p>}
                </div>
                {myRole.secretClue ? (roleClueOpen ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />) : null}
              </button>
              <AnimatePresence>
                {roleClueOpen && myRole.secretClue && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    className="border-t border-white/10 overflow-hidden"
                  >
                    <p className="px-4 py-2 text-amber-200/90 text-sm">秘密線索：{myRole.secretClue}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
          <motion.h2
            key={currentChapter.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-lg font-semibold text-white mb-4"
          >
            {currentChapter.title}
          </motion.h2>
          <div className="space-y-4">
            {contentNodes.map((node, i) => {
              if (node.type === 'narrative') {
                return (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-white/80 leading-relaxed"
                  >
                    {node.text}
                  </motion.p>
                )
              }
              if (node.type === 'vote') {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="text-white/80 mb-2">{node.prompt}</p>
                    {myVote ? (
                      <motion.p
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-primary-300 text-sm flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" /> 已投票：{myVote}
                      </motion.p>
                    ) : (
                      node.options?.map((opt, j) => (
                        <motion.button
                          key={j}
                          type="button"
                          disabled={actionLoading}
                          onClick={() => postScriptAction('vote', opt)}
                          whileTap={{ scale: 0.98 }}
                          className="block w-full text-left min-h-[48px] px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white mb-2 games-focus-ring disabled:opacity-50"
                        >
                          {opt}
                        </motion.button>
                      ))
                    )}
                  </motion.div>
                )
              }
              if (node.type === 'punishment') {
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                  >
                    <p className="text-amber-200 font-medium">{node.rule}</p>
                    {node.detail && <p className="text-white/70 text-sm mt-1">{node.detail}</p>}
                    {!scriptState.punishmentDone && (
                      <motion.button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => postScriptAction('punishment_done')}
                        whileTap={{ scale: 0.97 }}
                        className="mt-3 min-h-[48px] px-4 py-2 rounded-lg bg-amber-500/20 text-amber-200 font-medium games-focus-ring"
                      >
                        確認執行
                      </motion.button>
                    )}
                  </motion.div>
                )
              }
              return null
            })}
          </div>
          <div className="mt-8 flex justify-end">
            {isHost && (
              <motion.button
                type="button"
                disabled={actionLoading || (hasPunishment && !scriptState.punishmentDone)}
                onClick={() => postScriptAction('advance')}
                whileTap={{ scale: 0.97 }}
                className="min-h-[48px] px-6 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium games-focus-ring disabled:opacity-50"
              >
                {actionLoading ? '處理中…' : '下一章'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-white/50">載入中…</p>
    </div>
  )
}
