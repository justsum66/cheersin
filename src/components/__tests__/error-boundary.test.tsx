/**
 * TEST-012：錯誤邊界與 fallback 有測試
 * ErrorBoundaryBlock、GameErrorBoundary 渲染正常子元件與拋錯子元件
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ErrorBoundaryBlock from '../ErrorBoundaryBlock'
import GameErrorBoundary from '../games/GameErrorBoundary'

/** 會拋錯的子元件 */
function ThrowError(): never {
  throw new Error('TEST_ERROR')
}

describe('ErrorBoundaryBlock', () => {
  beforeEach(() => {
    cleanup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('正常子元件時渲染 children', () => {
    render(
      <ErrorBoundaryBlock blockName="test">
        <div data-testid="child">OK</div>
      </ErrorBoundaryBlock>
    )
    expect(screen.getByTestId('child')).toHaveTextContent('OK')
  })

  it('子元件拋錯時顯示 fallback', () => {
    render(
      <ErrorBoundaryBlock blockName="test" fallback={<div data-testid="custom-fallback">自訂錯誤</div>}>
        <ThrowError />
      </ErrorBoundaryBlock>
    )
    expect(screen.getByTestId('custom-fallback')).toHaveTextContent('自訂錯誤')
  })

  it('子元件拋錯且無 fallback 時顯示預設錯誤 UI 與重試按鈕', () => {
    render(
      <ErrorBoundaryBlock blockName="測試區塊">
        <ThrowError />
      </ErrorBoundaryBlock>
    )
    expect(screen.getByText(/測試區塊.*載入時發生錯誤/)).toBeInTheDocument()
    const retry = screen.getByRole('button', { name: /重試/ })
    expect(retry).toBeInTheDocument()
  })

  it('點擊重試按鈕可呼叫 onReset', () => {
    const onReset = vi.fn()
    render(
      <ErrorBoundaryBlock blockName="test" onReset={onReset}>
        <ThrowError />
      </ErrorBoundaryBlock>
    )
    const retryBtns = screen.getAllByRole('button', { name: /重試/ })
    fireEvent.click(retryBtns[0])
    expect(onReset).toHaveBeenCalled()
  })
})

describe('GameErrorBoundary', () => {
  beforeEach(() => {
    cleanup()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('正常子元件時渲染 children', () => {
    render(
      <GameErrorBoundary>
        <div data-testid="game-child">遊戲內容</div>
      </GameErrorBoundary>
    )
    expect(screen.getByTestId('game-child')).toHaveTextContent('遊戲內容')
  })

  it('子元件拋錯時顯示錯誤 UI、重試與回大廳', () => {
    render(
      <GameErrorBoundary gameName="骰子">
        <ThrowError />
      </GameErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '遊戲載入失敗' })).toBeInTheDocument()
    expect(screen.getByText(/骰子.*發生錯誤/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /重試/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /返回遊戲大廳|回大廳/ })).toBeInTheDocument()
  })

  it('自訂 title/desc 顯示於錯誤 UI', () => {
    render(
      <GameErrorBoundary title="自訂標題" desc="自訂描述" retryLabel="再試一次" backLobbyLabel="回列表">
        <ThrowError />
      </GameErrorBoundary>
    )
    expect(screen.getByText('自訂標題')).toBeInTheDocument()
    expect(screen.getByText('自訂描述')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再試一次' })).toBeInTheDocument()
  })
})
