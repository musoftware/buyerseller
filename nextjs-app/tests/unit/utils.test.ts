import { formatCurrency, formatDate, formatRelativeTime, truncate, slugify, debounce } from '@/lib/utils';

describe('Utils', () => {
    describe('formatCurrency', () => {
        it('should format USD currency correctly', () => {
            expect(formatCurrency(1000)).toBe('$1,000.00');
            expect(formatCurrency(99.99)).toBe('$99.99');
            expect(formatCurrency(0)).toBe('$0.00');
        });

        it('should handle different currencies', () => {
            expect(formatCurrency(1000, 'EUR')).toContain('1,000.00');
            expect(formatCurrency(1000, 'GBP')).toContain('1,000.00');
        });
    });

    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = new Date('2024-01-15T10:30:00');
            const formatted = formatDate(date);
            expect(formatted).toContain('Jan');
            expect(formatted).toContain('15');
            expect(formatted).toContain('2024');
        });
    });

    describe('formatRelativeTime', () => {
        it('should format recent times correctly', () => {
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

            expect(formatRelativeTime(fiveMinutesAgo)).toContain('minute');
        });

        it('should format hours correctly', () => {
            const now = new Date();
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

            expect(formatRelativeTime(twoHoursAgo)).toContain('hour');
        });
    });

    describe('truncate', () => {
        it('should truncate long text', () => {
            const longText = 'This is a very long text that should be truncated';
            expect(truncate(longText, 20)).toBe('This is a very long...');
        });

        it('should not truncate short text', () => {
            const shortText = 'Short text';
            expect(truncate(shortText, 20)).toBe('Short text');
        });

        it('should handle custom suffix', () => {
            const text = 'This is a long text';
            expect(truncate(text, 10, '---')).toBe('This is a---');
        });
    });

    describe('slugify', () => {
        it('should create valid slugs', () => {
            expect(slugify('Hello World')).toBe('hello-world');
            expect(slugify('Professional Logo Design')).toBe('professional-logo-design');
        });

        it('should handle special characters', () => {
            expect(slugify('Hello & World!')).toBe('hello-world');
            expect(slugify('Test@123#456')).toBe('test-123-456');
        });

        it('should handle multiple spaces', () => {
            expect(slugify('Hello    World')).toBe('hello-world');
        });
    });

    describe('debounce', () => {
        jest.useFakeTimers();

        it('should debounce function calls', () => {
            const mockFn = jest.fn();
            const debouncedFn = debounce(mockFn, 300);

            debouncedFn();
            debouncedFn();
            debouncedFn();

            expect(mockFn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(300);

            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('should pass arguments correctly', () => {
            const mockFn = jest.fn();
            const debouncedFn = debounce(mockFn, 300);

            debouncedFn('arg1', 'arg2');

            jest.advanceTimersByTime(300);

            expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
        });

        jest.useRealTimers();
    });
});
