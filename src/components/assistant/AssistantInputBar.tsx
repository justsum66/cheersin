'use client'

/** AST-30：輸入列 — 上傳、textarea、語音、送出、字數/額度；AST-39 鍵盤彈起時固定於視窗底部 */

import { useEffect, useState } from 'react'
import { BookOpen, Send, Mic, Square, Image as ImageIcon, X } from 'lucide-react'
import { useTranslation } from '@/contexts/I18nContext'
import { MAX_INPUT_LENGTH } from '@/config/assistant.config'

/** AST-39：行動裝置鍵盤彈起時，輸入列底部偏移以免被遮住（依 visualViewport） */
function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return
    const vv = window.visualViewport
    const update = () => {
      const heightDiff = window.innerHeight - vv.height
      setOffset(heightDiff > 60 ? heightDiff : 0)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])
  return offset
}

export interface AssistantInputBarProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  imageInputRef: React.RefObject<HTMLInputElement | null>
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onImageSelect: (file: File | null) => void
  onImageDrop: (e: React.DragEvent) => void
  isDraggingImage: boolean
  setIsDraggingImage: (v: boolean) => void
  isLoading: boolean
  canSend: boolean
  isListening: boolean
  onVoiceStart: () => void
  onVoiceStop: () => void
  onStopReply: () => void
  usedToday: number
  maxPerDay: number
  onUpgradeClick: () => void
  /** AST-43：離線時禁用送出並顯示提示 */
  isOffline?: boolean
  /** AST-15：圖片預覽再送出 — 待送出圖片 dataUrl、移除回調 */
  pendingImageDataUrl?: string | null
  onRemovePendingImage?: () => void
}

export function AssistantInputBar({
  inputRef,
  imageInputRef,
  value,
  onChange,
  onSubmit,
  onImageSelect,
  onImageDrop,
  isDraggingImage,
  setIsDraggingImage,
  isLoading,
  canSend,
  isListening,
  onVoiceStart,
  onVoiceStop,
  onStopReply,
  usedToday,
  maxPerDay,
  onUpgradeClick,
  isOffline = false,
  pendingImageDataUrl = null,
  onRemovePendingImage,
}: AssistantInputBarProps) {
  const { t } = useTranslation()
  const canSubmit = canSend && !isOffline
  const keyboardOffset = useKeyboardOffset()

  return (
    <div className="fixed left-0 right-0 z-50 p-4 safe-area-pb-min-1" style={{ bottom: keyboardOffset }}>
      <div className="max-w-3xl mx-auto">
        {/* AST-15：選圖後在輸入區上方顯示縮圖與移除，確認再送出 */}
        {pendingImageDataUrl && onRemovePendingImage && (
          <div className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-white/5 border border-white/10">
            {/* AST-15：使用者選圖 data URL 預覽，非靜態資源故用 img */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingImageDataUrl} alt="" className="h-12 w-12 object-cover rounded-lg shrink-0" />
            <span className="text-white/60 text-sm flex-1">{t('assistant.identifyWinePrompt')}</span>
            <button
              type="button"
              onClick={onRemovePendingImage}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring"
              aria-label={t('assistant.imagePreviewRemove')}
              title={t('assistant.imagePreviewRemove')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {/* AST-23：可見 label 關聯（id 供 aria-describedby）；檔案輸入已有 aria-label */}
        <span id="assistant-upload-desc" className="sr-only">{t('assistant.uploadDropHint')}</span>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label={t('assistant.uploadImage')}
          aria-describedby="assistant-upload-desc"
          onChange={(e) => onImageSelect(e.target.files?.[0] ?? null)}
        />
        <form
          onSubmit={onSubmit}
          aria-describedby="assistant-upload-desc"
          className="relative rounded-full focus-within:ring-2 focus-within:ring-primary-400/30 focus-within:ring-offset-2 focus-within:ring-offset-[#0a0a1a]"
          onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true) }}
          onDragLeave={() => setIsDraggingImage(false)}
          onDrop={onImageDrop}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              e.preventDefault()
              if (value.trim() && canSubmit) e.currentTarget.requestSubmit()
            }
          }}
        >
          <div className={`absolute inset-0 backdrop-blur-xl rounded-full border shadow-2xl transition-colors ${isDraggingImage ? 'bg-primary-500/20 border-primary-500/50' : 'bg-white/5 border-white/10'}`} />

          <div className="relative flex items-center pl-5 pr-2 py-2 gap-2" aria-busy={isLoading}>
            <button
              type="button"
              disabled={isLoading}
              className="p-2.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring disabled:opacity-50 disabled:pointer-events-none"
              title={t('assistant.knowledgeBase')}
              aria-label={t('assistant.knowledgeBase')}
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring disabled:opacity-50 disabled:pointer-events-none"
              title={t('assistant.uploadImage')}
              aria-label={t('assistant.uploadImage')}
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={isLoading ? t('assistant.repliesIn') : t('assistant.placeholder')}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-white placeholder-white/40 px-2 py-3 min-h-[48px] font-medium text-[15px]"
              disabled={isLoading}
              title={t('assistant.ctrlEnter')}
              aria-label={t('assistant.placeholder')}
            />

            <button
              type="button"
              disabled={isLoading}
              onClick={isListening ? onVoiceStop : onVoiceStart}
              aria-pressed={isListening}
              aria-label={isListening ? t('assistant.recordingStop') : t('assistant.voiceInput')}
              className={`p-2.5 rounded-full transition-colors shrink-0 min-h-[48px] min-w-[48px] flex items-center justify-center games-focus-ring disabled:opacity-50 disabled:pointer-events-none ${isListening ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
              title={isListening ? t('assistant.recordingStop') : t('assistant.voiceInput')}
            >
              {isListening ? <Square className="w-5 h-5" aria-hidden /> : <Mic className="w-5 h-5" aria-hidden />}
            </button>

            {isLoading ? (
              <button
                type="button"
                onClick={onStopReply}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center p-2.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 shrink-0 games-focus-ring gap-1.5"
                title={t('assistant.stopReply')}
                aria-label={t('assistant.stopReply')}
              >
                <Square className="w-5 h-5 shrink-0" aria-hidden />
                <span className="text-xs font-medium text-red-400/90 whitespace-nowrap">{t('assistant.repliesIn')}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!value.trim() || !canSubmit}
                className={`min-h-[48px] min-w-[48px] flex items-center justify-center p-2.5 rounded-full transition-all duration-300 shrink-0 games-focus-ring ${value.trim() && canSubmit
                  ? 'bg-primary-500 text-white shadow-[0_0_20px_rgba(139,0,0,0.4)] hover:scale-105'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                title={isOffline ? t('assistant.offlineSendHint') : !canSend ? t('assistant.upgradeUnlock') : t('assistant.sendAria')}
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>

        {isOffline && (
          <p className="text-center text-xs text-amber-400/90 mt-1.5" role="status" aria-live="polite">
            {t('assistant.offlineSendHint')}
          </p>
        )}
        <p className="text-center text-[10px] text-white/30 mt-1.5" aria-hidden>{t('assistant.ctrlEnter')}</p>
        {value.length > 0 && (
          <p className={`text-center text-xs mt-2 ${value.length > 1800 ? 'text-orange-400' : 'text-white/40'}`}>
            {value.length}/{MAX_INPUT_LENGTH} {t('assistant.charCount')}
            {value.length > MAX_INPUT_LENGTH && <span className="text-red-400 ml-1">（{t('assistant.overLimit')}）</span>}
          </p>
        )}
        {maxPerDay >= 0 && (
          <p className="text-center text-xs text-white/40 mt-2">
            {t('assistant.usedToday', { used: usedToday, max: maxPerDay })}
            {!canSend && (
              <button type="button" onClick={onUpgradeClick} className="ml-2 text-primary-400 hover:underline">
                {t('assistant.upgradeUnlock')}
              </button>
            )}
          </p>
        )}
        <p className="text-center text-[10px] text-white/20 mt-3 font-mono">
          {t('assistant.disclaimer')}
        </p>
        <p className="text-center text-[10px] text-white/30 mt-2">
          {t('assistant.alcoholDisclaimer')}
        </p>
      </div>
    </div>
  )
}
