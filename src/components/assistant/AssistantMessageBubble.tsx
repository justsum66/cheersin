'use client'

/** AST-06：單一訊息氣泡 — React.memo 依 message.id 與內容避免無謂重繪 */

import React from 'react'
import { m } from 'framer-motion'
import Image from 'next/image'
import { User, Copy, Volume2, Heart, ThumbsUp, ThumbsDown } from 'lucide-react'
import { BRAND_NAME } from '@/components/BrandLogo'
import { WineCard } from '@/components/wine/WineCard'
import { MarkdownMessage } from '@/components/assistant/MarkdownMessage'
import { SkeletonText } from '@/components/ui/Skeleton'
import { SpeechVisualizer } from '@/components/ui/SpeechVisualizer'
import type { AssistantMessage, WineCardDataFromAI } from '@/types/assistant'

export interface AssistantMessageBubbleProps {
  message: AssistantMessage
  isLastAndLoading: boolean
  prefersReducedMotion: boolean
  speakingMessageId: string | null
  isFeedbackOpen: boolean
  feedbackText: string
  onSendMessage: (text: string) => void
  onCopy: (content: string) => void
  onSpeak: (content: string, messageId: string) => void
  onStopSpeak: () => void
  onAddToWishlistMessage: (content: string, messageId: string) => void
  onLike: (messageId: string, liked: boolean) => void
  onRetry: (messageId: string) => void
  onFeedbackTextChange: (value: string) => void
  onSubmitFeedback: (messageId: string) => void
  onCloseFeedback: () => void
  onAddToWishlistWine: (wine: WineCardDataFromAI) => void
  isWineInWishlist: (wineId: string) => boolean
  t: (key: string, opts?: Record<string, string | number>) => string
}

function AssistantMessageBubbleComponent({
  message,
  isLastAndLoading,
  prefersReducedMotion,
  speakingMessageId,
  isFeedbackOpen,
  feedbackText,
  onSendMessage,
  onCopy,
  onSpeak,
  onStopSpeak,
  onAddToWishlistMessage,
  onLike,
  onRetry,
  onFeedbackTextChange,
  onSubmitFeedback,
  onCloseFeedback,
  onAddToWishlistWine,
  isWineInWishlist,
  t,
}: AssistantMessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSpeaking = speakingMessageId === message.id
  const senderId = `msg-${message.id}-sender`

  return (
    <article
      id={`msg-${message.id}`}
      aria-labelledby={senderId}
      className="contents"
    >
    <m.div
      className={`flex gap-6 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, x: isUser ? 24 : -24, scale: 0.96 }
      }
      animate={
        prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0.15 }
          : { type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }
      }
    >
      <div className="flex-shrink-0 mt-1">
        <span id={senderId} className="sr-only">
          {message.role === 'user' ? t('assistant.me') : t('assistant.aiSommelier')}
        </span>
        {message.role === 'assistant' ? (
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center border border-white/10 overflow-hidden ${isLastAndLoading ? 'animate-pulse' : ''}`}
          >
            <Image src="/sizes/icon_128_gold.png" alt={BRAND_NAME} width={24} height={24} className="object-contain" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-primary-800/60 flex items-center justify-center border border-primary-500/30">
            <User className="w-5 h-5 text-white/90" />
          </div>
        )}
      </div>

      <div className={`flex flex-col w-full max-w-[85%] md:max-w-2xl min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-6 py-4 rounded-3xl text-[15px] leading-relaxed tracking-wide ${
            isUser
              ? 'bg-primary-500/20 border border-primary-500/30 text-white rounded-tr-sm shadow-lg text-right'
              : 'glass-card bg-white/[0.06] border border-white/10 text-gray-100 rounded-tl-sm backdrop-blur-xl text-left'
          }`}
        >
          {message.role === 'assistant' ? (
            isLastAndLoading && !message.content?.trim() ? (
              <div className="py-1 max-w-md" aria-live="polite" aria-busy>
                <SkeletonText lines={3} className="max-w-sm" />
              </div>
            ) : (
              <MarkdownMessage content={message.content?.trim() ? message.content : t('assistant.emptyReply')} />
            )
          ) : (
            message.content
          )}
        </div>

        {message.role === 'assistant' && message.wines?.length ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-full min-w-0" role="region" aria-label={`推薦 ${message.wines.length} 款酒`}>
            {message.wines.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                onAddToWishlist={onAddToWishlistWine}
                inWishlist={isWineInWishlist(wine.id)}
                variant="horizontal"
              />
            ))}
          </div>
        ) : null}

        <span className={`mt-1.5 text-[10px] font-mono text-white/30 ${isUser ? 'mr-1' : 'ml-1'}`}>
          {message.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
        </span>

        {message.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {message.role === 'assistant' && message.sources?.length ? (
          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
            {message.sources.map((s) => (
              <span key={s.index} className="text-xs text-white/50 hover:text-white/80 transition-colors cursor-default" title={s.source}>
                <sup className="text-[10px] font-mono">[{s.index}]</sup> {s.source.slice(0, 40)}{s.source.length > 40 ? '…' : ''}
              </span>
            ))}
          </div>
        ) : null}

        {message.role === 'assistant' && message.similarQuestions?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.similarQuestions.map((q) => (
              <button
                key={q}
                onClick={() => onSendMessage(q)}
                className="text-xs px-3 py-1.5 min-h-[48px] rounded-full bg-white/5 border border-white/10 hover:border-primary-500/40 text-white/70 hover:text-white transition-colors games-focus-ring"
              >
                {q}
              </button>
            ))}
          </div>
        ) : null}

        {message.role === 'assistant' && (
          <div className="flex items-center gap-2 mt-3 ml-auto flex-wrap justify-end">
            <button onClick={() => onCopy(message.content)} className="p-1.5 min-h-[48px] min-w-[48px] rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors games-focus-ring flex items-center justify-center" title={t('assistant.copy')}>
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => (isSpeaking ? onStopSpeak() : onSpeak(message.content, message.id))}
              className="p-1.5 min-h-[48px] min-w-[48px] rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors games-focus-ring flex items-center justify-center gap-1.5"
              title={isSpeaking ? (t('assistant.stopSpeak') ?? '停止朗讀') : t('assistant.speak')}
            >
              {isSpeaking ? <SpeechVisualizer isSpeaking reducedMotion={prefersReducedMotion} /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button onClick={() => onAddToWishlistMessage(message.content, message.id)} className="p-1.5 min-h-[48px] min-w-[48px] rounded-lg text-white/30 hover:text-primary-400 transition-colors games-focus-ring flex items-center justify-center" title={t('assistant.addToWishlist')}>
              <Heart className="w-4 h-4" />
            </button>
            <button onClick={() => onLike(message.id, true)} className={`p-1.5 min-h-[48px] min-w-[48px] rounded-lg transition-colors games-focus-ring flex items-center justify-center ${message.liked === true ? 'text-primary-500 bg-primary-500/20' : 'text-white/30 hover:text-primary-400 hover:bg-white/10'}`} title="讚">
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button onClick={() => onLike(message.id, false)} className={`p-1.5 min-h-[48px] min-w-[48px] rounded-lg transition-colors games-focus-ring flex items-center justify-center ${message.liked === false ? 'text-red-400 bg-red-500/20' : 'text-white/30 hover:text-red-400 hover:bg-white/10'}`} title="倒讚">
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {message.role === 'assistant' && message.isError && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onRetry(message.id)}
              className="px-4 py-2 min-h-[48px] rounded-xl bg-primary-500/20 border border-primary-500/40 text-primary-300 hover:bg-primary-500/30 transition-colors games-focus-ring text-sm font-medium"
              aria-label={t('assistant.retry')}
            >
              {t('assistant.retry')}
            </button>
          </div>
        )}

        {message.role === 'assistant' && isFeedbackOpen && (
          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2 max-w-sm">
            <label className="text-xs text-white/60">{t('assistant.improveHint')}</label>
            <textarea
              value={feedbackText}
              onChange={(e) => onFeedbackTextChange(e.target.value)}
              placeholder={t('assistant.placeholderFeedback')}
              maxLength={500}
              rows={2}
              className="input-glass text-sm resize-none"
            />
            <div className="flex gap-2">
              <button type="button" onClick={onCloseFeedback} className="px-3 py-1.5 min-h-[48px] rounded-lg text-white/60 hover:text-white text-sm games-focus-ring">
                {t('assistant.skip')}
              </button>
              <button type="button" onClick={() => onSubmitFeedback(message.id)} className="px-3 py-1.5 min-h-[48px] rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm games-focus-ring">
                {t('assistant.send')}
              </button>
            </div>
          </div>
        )}
      </div>
    </m.div>
    </article>
  )
}

/** AST-06：依 message.id 與 content 等避免無謂重繪 */
function arePropsEqual(prev: AssistantMessageBubbleProps, next: AssistantMessageBubbleProps): boolean {
  if (prev.message.id !== next.message.id) return false
  if (prev.message.content !== next.message.content) return false
  if (prev.message.role !== next.message.role) return false
  if (prev.message.liked !== next.message.liked) return false
  if (prev.message.isError !== next.message.isError) return false
  if (prev.isLastAndLoading !== next.isLastAndLoading) return false
  if (prev.speakingMessageId !== next.speakingMessageId && (prev.speakingMessageId === prev.message.id || next.speakingMessageId === next.message.id)) return false
  if (prev.isFeedbackOpen !== next.isFeedbackOpen && (prev.isFeedbackOpen || next.isFeedbackOpen)) return false
  if (prev.isFeedbackOpen && next.isFeedbackOpen && prev.feedbackText !== next.feedbackText) return false
  if (prev.message.wines?.length !== next.message.wines?.length) return false
  if (prev.message.tags?.length !== next.message.tags?.length) return false
  if (prev.message.sources?.length !== next.message.sources?.length) return false
  if (prev.message.similarQuestions?.length !== next.message.similarQuestions?.length) return false
  return true
}

export const AssistantMessageBubble = React.memo(AssistantMessageBubbleComponent, arePropsEqual)
