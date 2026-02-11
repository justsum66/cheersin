'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { logger } from '@/lib/logger'

/** R2-015：錯誤邊界捕獲時上報 Sentry（若已整合） */
function reportToSentry(error: Error, context?: string) {
  if (typeof window === 'undefined') return
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureException?.(error, { extra: { errorBoundary: context } })
  }).catch(() => { /* Sentry 未安裝時略過 */ })
}

interface Props {
  children: ReactNode
  fallback?: ReactNode
  blockName?: string
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/** 頁面區塊 Error Boundary：防止單一組件錯誤導致全頁崩潰 */
export default class ErrorBoundaryBlock extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context = this.props.blockName ?? 'ErrorBoundaryBlock'
    logger.error(`[ErrorBoundaryBlock${context ? `:${context}` : ''}]`, { message: error.message, componentStack: errorInfo.componentStack })
    reportToSentry(error, context)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[120px] p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-white/80 text-sm mb-2">
            {this.props.blockName ? `「${this.props.blockName}」` : '此區塊'}載入時發生錯誤
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 text-white text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            重試
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
