'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  gameName?: string
  onReset?: () => void
  /** GAMES_500 #302：回大廳 CTA；未提供時使用 Link 至 /games */
  onBackToLobby?: () => void
  /** GAME-013：錯誤邊界文案可從父層傳入 i18n */
  title?: string
  desc?: string
  retryLabel?: string
  backLobbyLabel?: string
}

interface State {
  hasError: boolean
  error: Error | null
  isRetrying: boolean
}

/** 遊戲區塊錯誤邊界：單一遊戲崩潰不影響整頁 */
export default class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, isRetrying: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRetrying: false }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[GameErrorBoundary]', { message: error.message, componentStack: errorInfo.componentStack })
    if (typeof window !== 'undefined') {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException?.(error, { extra: { errorBoundary: 'GameErrorBoundary', gameName: this.props.gameName } })
      }).catch(() => {})
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, isRetrying: true })
    this.props.onReset?.()
    // Reset retrying state after a tick to allow re-render
    setTimeout(() => this.setState({ isRetrying: false }), 0)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[300px] p-4 md:p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-full"
          role="alert"
          aria-live="assertive"
          aria-labelledby="game-error-title"
          aria-describedby="game-error-desc"
        >
          {/* G-Common-08 / GAME-013：錯誤區 RWD、重試鈕可點；文案可由父層傳入 i18n */}
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" aria-hidden />
          <h3 id="game-error-title" className="text-lg font-bold text-white mb-2">
            {this.props.title ?? '遊戲載入失敗'}
          </h3>
          <p id="game-error-desc" className="text-white/60 text-sm mb-4 max-w-md">
            {this.props.desc ?? (this.props.gameName ? `「${this.props.gameName}」` : '此遊戲') + '發生錯誤，請重新整理或返回遊戲列表再試。'}
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 max-w-md text-left">
              <summary className="text-white/40 text-xs cursor-pointer hover:text-white/60">開發者資訊</summary>
              <pre className="mt-1 p-2 rounded bg-black/30 text-red-300/80 text-xs overflow-auto max-h-[150px] whitespace-pre-wrap break-all">{this.state.error.stack ?? this.state.error.message}</pre>
            </details>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              disabled={this.state.isRetrying}
              className="game-btn-touch games-focus-ring min-h-[48px] min-w-[48px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white text-sm font-medium focus:outline-none disabled:opacity-50"
              aria-label={this.props.retryLabel ?? '重試載入遊戲'}
            >
              <RefreshCw className="w-4 h-4" />
              {this.props.retryLabel ?? '重試'}
            </button>
            {this.props.onBackToLobby ? (
              <button
                type="button"
                onClick={this.props.onBackToLobby}
                className="game-btn-touch games-focus-ring min-h-[48px] min-w-[48px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white text-sm font-medium focus:outline-none"
                aria-label={this.props.backLobbyLabel ?? '返回遊戲大廳'}
              >
                <Home className="w-4 h-4" />
                {this.props.backLobbyLabel ?? '回大廳'}
              </button>
            ) : (
              <Link
                href="/games"
                className="game-btn-touch games-focus-ring min-h-[48px] min-w-[48px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white text-sm font-medium focus:outline-none"
                aria-label={this.props.backLobbyLabel ?? '返回遊戲大廳'}
              >
                <Home className="w-4 h-4" />
                {this.props.backLobbyLabel ?? '回大廳'}
              </Link>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
