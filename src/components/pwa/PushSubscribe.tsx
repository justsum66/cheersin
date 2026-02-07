'use client'

import { useState, useCallback } from 'react'
import { Bell, BellOff } from 'lucide-react'

const VAPID_KEY = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : ''

/**
 * 294 推播訂閱：請求通知權限並向 SW 訂閱 push（需設定 NEXT_PUBLIC_VAPID_PUBLIC_KEY）。
 * 訂閱後可將 subscription 送至後端以發送推播。
 */
export default function PushSubscribe() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'subscribed' | 'unsupported' | 'denied' | 'no-vapid'>('idle')

  const subscribe = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (!VAPID_KEY?.trim()) {
      setStatus('no-vapid')
      return
    }
    setStatus('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        setStatus('subscribed')
        return
      }
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY) as BufferSource,
      })
      fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      }).catch(() => { /* 訂閱已成立，後端儲存為最佳努力 */ })
      setStatus('subscribed')
    } catch {
      setStatus('denied')
    }
  }, [])

  if (status === 'unsupported') return <p className="text-white/50 text-sm">此瀏覽器不支援推播</p>
  if (status === 'no-vapid') return <p className="text-white/50 text-sm">推播需設定 VAPID 金鑰</p>
  if (status === 'denied') return <p className="text-white/50 text-sm">已拒絕通知權限</p>
  if (status === 'subscribed') {
    return (
      <div className="flex items-center gap-2 text-primary-400 text-sm">
        <Bell className="w-4 h-4" />
        已訂閱推播
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={subscribe}
      disabled={status === 'loading'}
      className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium disabled:opacity-50"
    >
      {status === 'loading' ? (
        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      訂閱推播
    </button>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
