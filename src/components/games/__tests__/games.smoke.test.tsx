/**
 * P2 #70：每款遊戲關鍵路徑單元測試（精簡版）。
 * 各遊戲至少一項：渲染不報錯、主按鈕可點。
 * #79：Batch1 結果區 data-testid 斷言（roulette-result, dice-result 等）。
 */
import type React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('@/lib/celebration', () => ({ fireFullscreenConfetti: vi.fn() }))
vi.mock('@/hooks/useGameSound', () => ({ useGameSound: () => ({ play: vi.fn() }) }))
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GameSessionProvider } from '../GameSessionProvider'
import Roulette from '../Roulette'
import Dice from '../Dice'
import TruthOrDare from '../TruthOrDare'
import NeverHaveIEver from '../NeverHaveIEver'
import Trivia from '../Trivia'
import LiarDice from '../LiarDice'
import NameTrain from '../NameTrain'
import HotPotato from '../HotPotato'
import SevenTap from '../SevenTap'
import SpinBottle from '../SpinBottle'
import DareDice from '../DareDice'
import RhythmGuess from '../RhythmGuess'
import ToastRelay from '../ToastRelay'
import KingsCup from '../KingsCup'
import WhoMostLikely from '../WhoMostLikely'

const defaultPlayers = ['玩家 1', '玩家 2', '玩家 3', '玩家 4']

const testQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function wrap(Component: React.ComponentType) {
  return (
    <QueryClientProvider client={testQueryClient}>
      <GameSessionProvider players={defaultPlayers}>
        <Component />
      </GameSessionProvider>
    </QueryClientProvider>
  )
}

describe('Games key path smoke', () => {
  beforeEach(() => {
    cleanup()
    vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: vi.fn() })
  })

  it('Roulette renders and spin button exists', () => {
    render(wrap(Roulette))
    const spin = screen.getByRole('button', { name: /轉動命運之輪/ })
    expect(spin).toBeInTheDocument()
    expect(spin).not.toBeDisabled()
  })

  it('Roulette shows result area after spin', async () => {
    render(wrap(Roulette))
    const spin = screen.getByRole('button', { name: /轉動命運之輪/ })
    fireEvent.click(spin)
    await waitFor(() => {
      expect(screen.getByTestId('roulette-result')).toBeInTheDocument()
    }, { timeout: 6000 })
  }, 10000)

  it('Dice shows result area after roll', async () => {
    render(wrap(Dice))
    const roll = screen.getByTestId('dice-roll')
    fireEvent.click(roll)
    await waitFor(() => {
      expect(screen.getByTestId('dice-result')).toBeInTheDocument()
    }, { timeout: 2500 })
  })

  it('TruthOrDare shows result area after pick truth', async () => {
    render(wrap(TruthOrDare))
    const pickTruth = screen.getByTestId('truth-or-dare-pick-truth')
    fireEvent.click(pickTruth)
    await waitFor(() => {
      expect(screen.getByTestId('truth-or-dare-result')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('NeverHaveIEver shows card area when round has content', () => {
    render(wrap(NeverHaveIEver))
    expect(screen.getByTestId('never-have-i-ever-card')).toBeInTheDocument()
  })

  it('Trivia shows result area after completing all questions', async () => {
    render(wrap(Trivia))
    // Trivia 預設 8 題；答題後 380ms + 1500ms 才切換下一題或結果，故每次等 2s
    for (let i = 0; i < 10; i++) {
      const firstOption = screen.queryByRole('button', { name: /選項 1：/ })
      if (!firstOption) break
      fireEvent.click(firstOption)
      await new Promise((r) => setTimeout(r, 2100))
    }
    await waitFor(() => {
      expect(screen.getByTestId('trivia-result')).toBeInTheDocument()
    }, { timeout: 6000 })
  }, 40000)

  it('LiarDice renders and roll button works', async () => {
    render(wrap(LiarDice))
    const roll = screen.getByRole('button', { name: /^擲骰$/ })
    fireEvent.click(roll)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '低' })).toBeInTheDocument()
    }, { timeout: 800 })
  })

  it('NameTrain renders and player buttons exist', () => {
    render(wrap(NameTrain))
    expect(screen.getByText(/輪到/)).toBeInTheDocument()
    defaultPlayers.forEach((name) => {
      expect(screen.getByRole('button', { name: new RegExp(`選 ${name}`) })).toBeInTheDocument()
    })
  })

  it('HotPotato renders and start button exists', () => {
    render(wrap(HotPotato))
    const start = screen.getByRole('button', { name: /開始倒數/ })
    expect(start).toBeInTheDocument()
    expect(start).not.toBeDisabled()
  })

  it('HotPotato shows result area when countdown hits zero (real timers, 3s countdown)', async () => {
    const mathRandom = vi.spyOn(Math, 'random').mockReturnValue(0)
    render(wrap(HotPotato))
    fireEvent.click(screen.getByTestId('hot-potato-start'))
    await waitFor(() => {
      expect(screen.getByTestId('hot-potato-result')).toBeInTheDocument()
    }, { timeout: 4500 })
    mathRandom.mockRestore()
  }, 10000)

  it('SevenTap renders and start button exists', () => {
    render(wrap(SevenTap))
    const start = screen.getByTestId('seven-tap-start')
    expect(start).toBeInTheDocument()
    expect(start).not.toBeDisabled()
  })

  it('SevenTap shows result area after 7 taps', async () => {
    render(wrap(SevenTap))
    fireEvent.click(screen.getByTestId('seven-tap-start'))
    const tapBtn = screen.getByTestId('seven-tap-btn')
    for (let i = 0; i < 7; i++) fireEvent.click(tapBtn)
    await waitFor(() => {
      expect(screen.getByTestId('seven-tap-result')).toBeInTheDocument()
    }, { timeout: 2000 })
  }, 8000)

  it('SpinBottle renders and spin button exists', () => {
    render(wrap(SpinBottle))
    const spin = screen.getByRole('button', { name: /轉瓶/ })
    expect(spin).toBeInTheDocument()
    expect(spin).not.toBeDisabled()
  })

  it('SpinBottle shows result area after spin', async () => {
    render(wrap(SpinBottle))
    fireEvent.click(screen.getByTestId('spin-bottle-spin'))
    await waitFor(() => {
      expect(screen.getByTestId('spin-bottle-result')).toBeInTheDocument()
    }, { timeout: 2000 })
  }, 8000)

  it('DareDice renders and roll button exists', () => {
    render(wrap(DareDice))
    const roll = screen.getByTestId('dare-dice-roll')
    expect(roll).toBeInTheDocument()
    expect(roll).not.toBeDisabled()
  })

  it('DareDice shows result area after roll', async () => {
    render(wrap(DareDice))
    fireEvent.click(screen.getByTestId('dare-dice-roll'))
    await waitFor(() => {
      expect(screen.getByTestId('dare-dice-result')).toBeInTheDocument()
    }, { timeout: 2000 })
  }, 8000)

  it('ToastRelay renders and start button exists', () => {
    render(wrap(ToastRelay))
    const start = screen.getByRole('button', { name: /開始一輪/ })
    expect(start).toBeInTheDocument()
    expect(start).not.toBeDisabled()
  })

  it('ToastRelay shows result area after guess', async () => {
    render(wrap(ToastRelay))
    fireEvent.click(screen.getByTestId('toast-master-start'))
    const input = screen.getByLabelText('接龍詞')
    fireEvent.change(input, { target: { value: '酒' } })
    fireEvent.click(screen.getByRole('button', { name: '送出' }))
    await waitFor(() => expect(screen.getByText(/接「酒」/)).toBeInTheDocument(), { timeout: 1500 })
    // 重複詞觸發「卡住」→ 顯示結果區（重新取 input 與 form，同一 act 內 change + submit）
    const input2 = screen.getByLabelText('接龍詞')
    const form = input2.closest('form')
    expect(form).toBeTruthy()
    await act(async () => {
      fireEvent.change(input2, { target: { value: '酒' } })
      fireEvent.submit(form!)
    })
    await waitFor(() => {
      expect(screen.getByTestId('toast-relay-result')).toBeInTheDocument()
      expect(screen.getByText(/喝！/)).toBeInTheDocument()
    }, { timeout: 3000 })
  }, 8000)

  it('KingsCup renders and draw button exists', () => {
    render(wrap(KingsCup))
    const draw = screen.getByTestId('kings-cup-draw')
    expect(draw).toBeInTheDocument()
    expect(draw).not.toBeDisabled()
  })

  it('KingsCup shows result area after draw', async () => {
    render(wrap(KingsCup))
    fireEvent.click(screen.getByTestId('kings-cup-draw'))
    await waitFor(() => {
      expect(screen.getByTestId('kings-cup-result')).toBeInTheDocument()
    }, { timeout: 2000 })
  }, 5000)

  it('WhoMostLikely renders and start button exists', () => {
    render(wrap(WhoMostLikely))
    const start = screen.getByTestId('who-most-likely-start')
    expect(start).toBeInTheDocument()
    expect(start).not.toBeDisabled()
  })

  it('WhoMostLikely shows result area after pointing a player', async () => {
    render(wrap(WhoMostLikely))
    fireEvent.click(screen.getByTestId('who-most-likely-start'))
    await waitFor(() => {
      expect(screen.getByText(/大家同時指向/)).toBeInTheDocument()
    }, { timeout: 1000 })
    const firstPlayer = screen.getByRole('button', { name: defaultPlayers[0] })
    fireEvent.click(firstPlayer)
    await waitFor(() => {
      expect(screen.getByTestId('who-most-likely-result')).toBeInTheDocument()
    }, { timeout: 1000 })
  }, 5000)

  it('RhythmGuess renders and start button exists', () => {
    render(wrap(RhythmGuess))
    const start = screen.getByTestId('rhythm-guess-start')
    expect(start).toBeInTheDocument()
    expect(start).not.toBeDisabled()
  })

  it('RhythmGuess BPM selector changes value', () => {
    render(wrap(RhythmGuess))
    const bpmSelect = screen.getByTestId('rhythm-guess-bpm')
    expect(bpmSelect).toHaveValue('60')
    fireEvent.change(bpmSelect, { target: { value: '90' } })
    expect(bpmSelect).toHaveValue('90')
  })

  it('RhythmGuess shows result area after beat round', async () => {
    render(wrap(RhythmGuess))
    fireEvent.click(screen.getByTestId('rhythm-guess-start'))
    const tapBtn = screen.getByTestId('rhythm-guess-tap')
    for (let i = 0; i < 4; i++) fireEvent.click(tapBtn)
    await waitFor(() => {
      expect(screen.getByTestId('rhythm-guess-result')).toBeInTheDocument()
    }, { timeout: 7000 })
  }, 10000)

  it('ToastRelay theme selection updates aria-pressed', () => {
    render(wrap(ToastRelay))
    const foodBtn = screen.getByRole('button', { name: /主題 食物/ })
    expect(foodBtn).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(foodBtn)
    expect(foodBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('ToastRelay renders and submit exists when chain started', () => {
    render(wrap(ToastRelay))
    const input = screen.getByPlaceholderText(/第一個詞/)
    expect(input).toBeInTheDocument()
    fireEvent.change(input, { target: { value: '啤酒' } })
    const submit = screen.getByTestId('toast-relay-submit')
    expect(submit).toBeInTheDocument()
    fireEvent.click(submit)
    expect(screen.getByText(/接「酒」/)).toBeInTheDocument()
  })

  it('ToastRelay shows result area when wrong char triggers loser', async () => {
    render(wrap(ToastRelay))
    const inputFirst = screen.getByPlaceholderText(/第一個詞/)
    fireEvent.change(inputFirst, { target: { value: '啤酒' } })
    fireEvent.click(screen.getByTestId('toast-relay-submit'))
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/以「酒」開頭/)).toBeInTheDocument()
    }, { timeout: 500 })
    const inputSecond = screen.getByPlaceholderText(/以「酒」開頭/)
    await act(async () => {
      fireEvent.change(inputSecond, { target: { value: '水' } })
    })
    const form = (inputSecond as HTMLInputElement).form
    expect(form).toBeTruthy()
    await act(async () => {
      fireEvent.submit(form!)
    })
    await waitFor(() => {
      expect(screen.getByTestId('toast-relay-result')).toBeInTheDocument()
    }, { timeout: 1000 })
  }, 5000)
})
