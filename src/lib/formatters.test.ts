import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate, formatTime, formatNumber, formatCurrency, formatPercent, formatRelative } from './formatters'

// Mock messages for formatRelative
vi.mock('@/lib/i18n/messages', () => ({
    messages: {
        'zh-TW': {
            common: {
                justNow: '剛剛',
                minutesAgo: '{{n}} 分鐘前',
                hoursAgo: '{{n}} 小時前',
                daysAgo: '{{n}} 天前',
            }
        }
    }
}))

describe('formatters', () => {
    const testDate = new Date('2023-01-02T13:45:00') // 2023/01/02 13:45:00

    describe('formatDate', () => {
        it('formats date correctly', () => {
            // Note: Locale output depends on Node environment, but we verify format structure
            // For zh-TW: YYYY/MM/DD
            const result = formatDate(testDate, 'zh-TW')
            expect(result).toMatch(/\d{4}\/\d{2}\/\d{2}/)
        })
    })

    describe('formatTime', () => {
        it('formats time correctly', () => {
            const result = formatTime(testDate, 'zh-TW')
            // For 13:45, it might be "13:45" or "下午01:45" depending on locale implementation in the environment
            expect(result).toMatch(/\d{2}:\d{2}/)
        })
    })

    describe('formatNumber', () => {
        it('formats numbers with commas', () => {
            expect(formatNumber(1234, 'en-US')).toBe('1,234')
            expect(formatNumber(1234567, 'en-US')).toBe('1,234,567')
        })
    })

    describe('formatCurrency', () => {
        it('formats currency correctly', () => {
            // Allow for space or non-breaking space
            const result = formatCurrency(1234, 'TWD', 'zh-TW')
            // Match digits and TWD/NT part loosely for cross-env compatibility
            expect(result).toMatch(/1,234/)

            const usd = formatCurrency(1234, 'USD', 'en-US')
            expect(usd).toContain('1,234')
        })
    })

    describe('formatPercent', () => {
        it('formats percentage correctly', () => {
            expect(formatPercent(12.34, 1)).toBe('12.3%')
            // use a clearer rounding case
            expect(formatPercent(12.36, 1)).toBe('12.4%')
            expect(formatPercent(99, 0)).toBe('99%')
        })
    })

    describe('formatRelative', () => {
        beforeEach(() => {
            vi.useFakeTimers()
            vi.setSystemTime(new Date('2023-01-02T12:00:00'))
        })

        afterEach(() => {
            vi.useRealTimers()
        })

        it('returns just now for < 1 min', () => {
            const d = new Date('2023-01-02T11:59:30')
            expect(formatRelative(d)).toBe('剛剛')
        })

        it('returns minutes ago', () => {
            const d = new Date('2023-01-02T11:55:00') // 5 mins ago
            expect(formatRelative(d)).toBe('5 分鐘前')
        })

        it('returns hours ago', () => {
            const d = new Date('2023-01-02T10:00:00') // 2 hours ago
            expect(formatRelative(d)).toBe('2 小時前')
        })

        it('returns days ago', () => {
            const d = new Date('2022-12-31T12:00:00') // 2 days ago
            expect(formatRelative(d)).toBe('2 天前')
        })
    })
})
