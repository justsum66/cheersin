import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { m } from 'framer-motion'
import toast from 'react-hot-toast'
import { ModalCloseButton } from '@/components/ui/ModalCloseButton'
import { useTranslation } from '@/contexts/I18nContext'

interface InviteModalProps {
    slug: string
    inviteUrl: string
    onClose: () => void
}

export function InviteModal({ slug, inviteUrl, onClose }: InviteModalProps) {
    const router = useRouter()
    const { t } = useTranslation()
    const [inviteBlockCollapsed, setInviteBlockCollapsed] = useState(false)
    const [inviteCopyJustDone, setInviteCopyJustDone] = useState(false)
    const inviteCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // GAMES_500 #159：邀請連結 QR code 可選（行動端顯示，桌面可收合）
    const [showQR, setShowQR] = useState(false)

    useEffect(() => {
        const check = () => setShowQR(typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window))
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    useEffect(() => {
        return () => {
            if (inviteCopyTimeoutRef.current) clearTimeout(inviteCopyTimeoutRef.current)
        }
    }, [])

    const handleCopy = () => {
        try {
            navigator.clipboard.writeText(inviteUrl)
            toast.success(t('common.copied'))
            setInviteCopyJustDone(true)
            if (inviteCopyTimeoutRef.current) clearTimeout(inviteCopyTimeoutRef.current)
            inviteCopyTimeoutRef.current = setTimeout(() => {
                inviteCopyTimeoutRef.current = null
                setInviteCopyJustDone(false)
            }, 2000)
        } catch {
            toast.error(t('gamesRoom.copyFailed'))
        }
    }

    const handleEnterRoom = () => {
        router.replace(`/games?room=${slug}`)
        onClose()
    }

    return (
        <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <m.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/10 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #6B0F1A 0%, #8B1530 50%, #C9A961 100%)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">邀請玩家</h2>
                    <ModalCloseButton onClick={onClose} aria-label="關閉" className="rounded-full text-white/80" />
                </div>
                <p className="text-white/90 text-sm mb-1 text-center">建立成功！進入房間後即可開始選遊戲。</p>
                <p className="text-white/90 text-2xl md:text-3xl font-bold font-mono tracking-widest mb-2 text-center">
                    {slug}
                </p>
                {inviteBlockCollapsed ? (
                    <>
                        <p className="text-white/70 text-sm mb-4 text-center">房間碼 · 點下方展開可複製連結或 QR</p>
                        <button
                            type="button"
                            onClick={() => setInviteBlockCollapsed(false)}
                            className="w-full min-h-[48px] mb-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                            aria-expanded="false"
                            aria-label="展開邀請連結與 QR 碼"
                        >
                            展開邀請連結
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-white/70 text-sm mb-2 text-center">房間碼 · 分享連結或掃描 QR 加入</p>
                        <button
                            type="button"
                            onClick={() => setInviteBlockCollapsed(true)}
                            className="mb-3 text-white/50 text-xs hover:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded px-2 py-1"
                            aria-expanded="true"
                            aria-label="收合邀請區塊"
                        >
                            收合
                        </button>
                        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                            <input
                                readOnly
                                value={inviteUrl}
                                aria-label="邀請連結"
                                className="flex-1 min-w-0 min-h-[48px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                            />
                            <div className="flex gap-2 w-full sm:w-auto sm:shrink-0">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    aria-label={inviteCopyJustDone ? t('gamesRoom.inviteCopiedAria') : t('gamesRoom.inviteCopyAria')}
                                    className="min-h-[48px] min-w-[120px] px-5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a] transition-colors"
                                >
                                    {inviteCopyJustDone ? t('common.copied') : t('gamesRoom.copyLink')}
                                </button>
                            </div>
                        </div>
                        {showQR && (
                            <div className="flex justify-center mb-4">
                                <Image
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteUrl)}`}
                                    alt={t('gamesRoom.inviteQR')}
                                    width={200}
                                    height={200}
                                    className="rounded-xl border border-white/10"
                                />
                            </div>
                        )}
                    </>
                )}
                <button
                    type="button"
                    onClick={handleEnterRoom}
                    className="w-full min-h-[48px] rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a1a]"
                >
                    進入房間
                </button>
            </m.div>
        </m.div>
    )
}
