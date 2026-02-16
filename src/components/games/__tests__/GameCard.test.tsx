import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { GameCard } from '../GameCard'
import type { GameCardData } from '../GameCard'
import { Search } from 'lucide-react'

// Mock dependencies
vi.mock('@/contexts/I18nContext', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion')
    return {
        ...actual,
        useReducedMotion: () => false,
        m: {
            div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
            button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
            span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
        },
        AnimatePresence: ({ children }: any) => <>{children}</>,
    }
})

vi.mock('@/components/ui/FeatureIcon', () => ({
    FeatureIcon: () => <div data-testid="feature-icon" />,
}))

vi.mock('@/components/ui/Badge', () => ({
    Badge: ({ children }: any) => <div data-testid="badge">{children}</div>,
}))

describe('GameCard', () => {
    const mockGame: GameCardData = {
        id: 'test-game',
        name: 'Test Game',
        description: 'A fun test game',
        icon: Search, // using any icon
        color: 'primary',
        players: '2-4 Players',
        rulesSummary: 'Test Rules',
        isNew: true,
        isPremium: false,
        onRate: vi.fn(),
        onToggleFavorite: vi.fn(),
        isFavorite: false,
    }

    const defaultProps = {
        game: mockGame,
        index: 0,
        onSelect: vi.fn(),
        onKeyDown: vi.fn(),
        buttonRef: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it('renders game information correctly', () => {
        render(<GameCard {...defaultProps} />)
        expect(screen.getByText('Test Game')).toBeDefined()
        expect(screen.getByText('A fun test game')).toBeDefined()
        expect(screen.getByText('2-4 Players')).toBeDefined()
        // New badge check
        expect(screen.getByText('games.new')).toBeDefined()
    })

    it('calls onSelect when clicked', () => {
        render(<GameCard {...defaultProps} />)
        const cards = screen.getAllByRole('listitem', { name: /進入遊戲：Test Game/i })
        fireEvent.click(cards[0])
        expect(defaultProps.onSelect).toHaveBeenCalledWith('test-game')
    })

    it('calls onToggleFavorite when heart is clicked', () => {
        render(<GameCard {...defaultProps} />)
        const heartBtns = screen.getAllByLabelText('加入收藏')
        fireEvent.click(heartBtns[0])
        expect(mockGame.onToggleFavorite).toHaveBeenCalledWith('test-game')
        // Should NOT trigger card selection
        expect(defaultProps.onSelect).not.toHaveBeenCalled()
    })

    it('calls onRate when star is clicked', () => {
        render(<GameCard {...defaultProps} />)
        const starBtns = screen.getAllByLabelText('給 5 星（強烈推薦）')
        fireEvent.click(starBtns[0])
        expect(mockGame.onRate).toHaveBeenCalledWith('test-game', 5)
        expect(defaultProps.onSelect).not.toHaveBeenCalled()
    })

    it('displays premium badge if isPremium is true', () => {
        render(<GameCard {...defaultProps} game={{ ...mockGame, isPremium: true, isNew: false }} />)
        expect(screen.getByText('Pro')).toBeDefined()
        // Should not show New badge - use queryAllByText to avoid multiple match error
        const newBadges = screen.queryAllByText('games.new')
        expect(newBadges.length).toBe(0)
    })

    it('handles keyboard navigation', () => {
        render(<GameCard {...defaultProps} />)
        const cards = screen.getAllByRole('listitem', { name: /進入遊戲：Test Game/i })
        fireEvent.keyDown(cards[0], { key: 'Enter' })
        expect(defaultProps.onSelect).toHaveBeenCalledWith('test-game')

        vi.clearAllMocks()
        fireEvent.keyDown(cards[0], { key: ' ' })
        expect(defaultProps.onSelect).toHaveBeenCalledWith('test-game')
    })
})
