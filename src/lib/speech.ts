/**
 * Web Speech API 整合：語音合成與辨識
 * 供助理、學習發音、遊戲等模組使用
 */

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'speechSynthesis' in window
}

export function isRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  const Win = window as Window & {
    SpeechRecognition?: new () => unknown
    webkitSpeechRecognition?: new () => unknown
  }
  return !!(Win.SpeechRecognition || Win.webkitSpeechRecognition)
}

/** 語音朗讀；可選 lang（預設 zh-TW） */
export function speak(text: string, options?: { lang?: string; rate?: number }): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = options?.lang ?? 'zh-TW'
  u.rate = options?.rate ?? 1
  window.speechSynthesis.speak(u)
}

export function cancelSpeak(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

/** 語音辨識：回傳辨識結果或空字串（需 HTTPS 或 localhost） */
export function listen(options?: { lang?: string; continuous?: boolean }): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve('')
      return
    }
    interface RecInstance {
      start: () => void
      onresult: (e: { results: Array<{ [i: number]: { transcript: string } }> }) => void
      onerror: () => void
      onend: () => void
      continuous: boolean
      lang: string
    }
    const Win = window as Window & {
      SpeechRecognition?: new () => RecInstance
      webkitSpeechRecognition?: new () => RecInstance
    }
    const Ctor = Win.SpeechRecognition || Win.webkitSpeechRecognition
    if (!Ctor) {
      resolve('')
      return
    }
    const rec = new Ctor()
    rec.lang = options?.lang ?? 'zh-TW'
    rec.continuous = options?.continuous ?? false
    let result = ''
    rec.onresult = (e: { results: Array<{ [i: number]: { transcript: string } }> }) => {
      for (const row of e.results) {
        result = (row[0]?.transcript ?? '').trim()
        if (result) break
      }
    }
    rec.onerror = () => resolve(result || '')
    rec.onend = () => resolve(result || '')
    rec.start()
  })
}
