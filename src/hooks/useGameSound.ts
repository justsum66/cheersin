/**
 * 共用輕量音效 hook：按鈕／正確／錯誤／中獎等短音效，可選開關、跟隨系統靜音。
 * 使用 Web Audio API 產生短 beep，無需外部音檔；單一 AudioContext。
 */
'use client'

import { useCallback, useRef, useEffect, useState } from 'react'

const STORAGE_KEY = 'cheersin-game-sound-enabled'
const STORAGE_VOLUME = 'cheersin-game-sound-volume'
const STORAGE_BGM = 'cheersin-game-bgm-enabled'

export type SoundKind = 'click' | 'correct' | 'wrong' | 'win' | 'countdown' | 'drum' | 'airhorn' | 'pop'

/** 104 關鍵時刻音效：倒數、勝利、失敗 */
const SOUNDS: Record<SoundKind, { freq: number; endFreq?: number; duration: number; type?: OscillatorType }> = {
  click: { freq: 400, duration: 0.05, type: 'sine' },
  correct: { freq: 523, duration: 0.12, type: 'sine' },
  wrong: { freq: 200, endFreq: 150, duration: 0.3, type: 'sawtooth' },
  win: { freq: 660, endFreq: 880, duration: 0.3, type: 'triangle' },
  countdown: { freq: 880, duration: 0.08, type: 'sine' },
  drum: { freq: 100, endFreq: 60, duration: 0.15, type: 'square' },
  airhorn: { freq: 400, endFreq: 350, duration: 0.8, type: 'sawtooth' },
  pop: { freq: 800, endFreq: 1200, duration: 0.05, type: 'sine' },
}

function getStoredEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === '0' || v === 'false') return false
    if (v === '1' || v === 'true') return true
  } catch {
    /* ignore */
  }
  return true
}

/** 103 音量 0–1，存 localStorage */
export function getStoredVolume(): number {
  if (typeof window === 'undefined') return 1
  try {
    const v = localStorage.getItem(STORAGE_VOLUME)
    if (v == null) return 1
    const n = parseFloat(v)
    if (Number.isFinite(n) && n >= 0 && n <= 1) return n
  } catch {
    /* ignore */
  }
  return 1
}

export function setStoredVolume(volume: number): void {
  try {
    localStorage.setItem(STORAGE_VOLUME, String(Math.max(0, Math.min(1, volume))))
  } catch {
    /* ignore */
  }
}

function setStoredEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function getStoredBgm(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const v = localStorage.getItem(STORAGE_BGM)
    if (v === '0' || v === 'false') return false
    if (v === '1' || v === 'true') return true
  } catch {
    /* ignore */
  }
  return false
}

function setStoredBgm(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_BGM, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

/**
 * 回傳 play(kind)、enabled、setEnabled、toggle、BGM、preload。
 * 若 enabled 為 false 或系統靜音，play 為 no-op。
 */
export function useGameSound() {
  const ctxRef = useRef<AudioContext | null>(null)
  const bgmOscRef = useRef<OscillatorNode | null>(null)
  const bgmGainRef = useRef<GainNode | null>(null)
  const [enabled, setEnabledState] = useState(true)
  const [volume, setVolumeState] = useState(1)
  const [bgmEnabled, setBgmEnabledState] = useState(false)
  const preloadedRef = useRef(false)

  useEffect(() => {
    setEnabledState(getStoredEnabled())
    setVolumeState(getStoredVolume())
    setBgmEnabledState(getStoredBgm())
  }, [])

  /** 105 預載：取得或建立 AudioContext 並 resume，首次互動時呼叫以解鎖音效 */
  const preload = useCallback(() => {
    if (preloadedRef.current) return
    try {
      const ctx = ctxRef.current ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      if (!ctxRef.current) ctxRef.current = ctx
      if (ctx.state === 'suspended') ctx.resume()
      preloadedRef.current = true
    } catch {
      /* ignore */
    }
  }, [])

  /** 101 背景音樂：低音量循環音（Web Audio 無需外部檔）；開關存 localStorage */
  const startBGM = useCallback(() => {
    try {
      const ctx = ctxRef.current ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      if (!ctxRef.current) ctxRef.current = ctx
      if (ctx.state === 'suspended') ctx.resume()
      if (bgmOscRef.current) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 220
      gain.gain.setValueAtTime(0.03 * volume, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      bgmOscRef.current = osc
      bgmGainRef.current = gain
    } catch {
      /* ignore */
    }
  }, [volume])

  const stopBGM = useCallback(() => {
    try {
      if (bgmOscRef.current) {
        bgmOscRef.current.stop()
        bgmOscRef.current.disconnect()
        bgmOscRef.current = null
      }
      if (bgmGainRef.current) {
        bgmGainRef.current.disconnect()
        bgmGainRef.current = null
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setBgmEnabled = useCallback((value: boolean) => {
    setBgmEnabledState(value)
    setStoredBgm(value)
    if (value) startBGM()
    else stopBGM()
  }, [startBGM, stopBGM])

  const toggleBGM = useCallback(() => {
    setBgmEnabledState((prev) => {
      const next = !prev
      setStoredBgm(next)
      if (next) startBGM()
      else stopBGM()
      return next
    })
  }, [startBGM, stopBGM])

  useEffect(() => {
    if (!enabled || !bgmEnabled) stopBGM()
    else startBGM()
    return () => { stopBGM() }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startBGM/stopBGM stable refs, omit to avoid re-run
  }, [bgmEnabled, enabled])

  useEffect(() => {
    const g = bgmGainRef.current
    if (g) g.gain.setValueAtTime(0.03 * volume, (ctxRef.current?.currentTime ?? 0))
  }, [volume])

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value)
    setStoredEnabled(value)
  }, [])

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev
      setStoredEnabled(next)
      return next
    })
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolumeState(clamped)
    setStoredVolume(clamped)
  }, [])

  const play = useCallback(
    (kind: SoundKind) => {
      if (!enabled) return
      try {
        const ctx = ctxRef.current ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        if (!ctxRef.current) ctxRef.current = ctx
        if (ctx.state === 'suspended') ctx.resume()
        const config = SOUNDS[kind]
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = config.type ?? 'sine'

        // Frequency handling
        osc.frequency.setValueAtTime(config.freq, ctx.currentTime)
        if (config.endFreq) {
          osc.frequency.exponentialRampToValueAtTime(config.endFreq, ctx.currentTime + config.duration)
        }

        const amp = 0.15 * volume
        gain.gain.setValueAtTime(amp, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + config.duration)
        const safetyTimeout = setTimeout(() => {
          try { osc.disconnect(); gain.disconnect() } catch { /* ignore */ }
        }, (config.duration + 0.1) * 1000)
        osc.onended = () => {
          clearTimeout(safetyTimeout)
          try { osc.disconnect(); gain.disconnect() } catch { /* ignore */ }
        }
      } catch {
        /* ignore */
      }
    },
    [enabled, volume]
  )

  return {
    play,
    enabled,
    setEnabled,
    toggle,
    volume,
    setVolume,
    preload,
    bgmEnabled,
    setBgmEnabled,
    toggleBGM,
    startBGM,
    stopBGM,
  }
}
