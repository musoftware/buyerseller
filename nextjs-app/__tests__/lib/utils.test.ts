import { formatCurrency, formatDate, formatRelativeTime, truncateText, slugify, debounce } from '@/lib/utils'

describe('Utils', () => {
    describe('formatCurrency', () => {
        it('formats USD correctly', () => {
            expect(formatCurrency(100)).toBe('$100.00')
            expect(formatCurrency(1234.56)).toBe('$1,234.56')
        })

        it('handles zero and negative values', () => {
            expect(formatCurrency(0)).toBe('$0.00')
            expect(formatCurrency(-50)).toBe('-$50.00')
        })
    })

    describe('formatDate', () => {
        it('formats date correctly', () => {
            const date = new Date('2024-01-15')
            expect(formatDate(date)).toMatch(/Jan 15, 2024/)
        })
    })

    describe('formatRelativeTime', () => {
        it('formats relative time correctly', () => {
            const now = new Date()
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

            expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
        })
    })

    describe('truncateText', () => {
        it('truncates long text', () => {
            const longText = 'This is a very long text that should be truncated'
            expect(truncateText(longText, 20)).toBe('This is a very long...')
        })

        it('does not truncate short text', () => {
            const shortText = 'Short text'
            expect(truncateText(shortText, 20)).toBe('Short text')
        })
    })

    describe('slugify', () => {
        it('creates valid slugs', () => {
            expect(slugify('Hello World')).toBe('hello-world')
            expect(slugify('Test & Example')).toBe('test-example')
            expect(slugify('Multiple   Spaces')).toBe('multiple-spaces')
        })
    })

    describe('debounce', () => {
        jest.useFakeTimers()

        it('debounces function calls', () => {
            const mockFn = jest.fn()
            const debouncedFn = debounce(mockFn, 500)

            debouncedFn()
            debouncedFn()
            debouncedFn()

            expect(mockFn).not.toHaveBeenCalled()

            jest.advanceTimersByTime(500)

            expect(mockFn).toHaveBeenCalledTimes(1)
        })

        jest.useRealTimers()
    })
})
