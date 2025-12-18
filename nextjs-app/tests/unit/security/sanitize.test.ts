import {
    sanitizeHTML,
    escapeHTML,
    sanitizeInput,
    sanitizeFilename,
    sanitizeURL,
    sanitizeEmail,
    stripHTMLTags,
    sanitizeSearchQuery,
    sanitizeNumber,
} from '@/lib/security/sanitize';

describe('Security Sanitization', () => {
    describe('sanitizeHTML', () => {
        it('should remove script tags', () => {
            const input = '<p>Hello</p><script>alert("xss")</script>';
            const result = sanitizeHTML(input);
            expect(result).not.toContain('<script>');
            expect(result).toContain('<p>Hello</p>');
        });

        it('should remove event handlers', () => {
            const input = '<div onclick="alert(\'xss\')">Click me</div>';
            const result = sanitizeHTML(input);
            expect(result).not.toContain('onclick');
        });

        it('should remove javascript: protocol', () => {
            const input = '<a href="javascript:alert(\'xss\')">Link</a>';
            const result = sanitizeHTML(input);
            expect(result).not.toContain('javascript:');
        });

        it('should remove iframe tags', () => {
            const input = '<iframe src="evil.com"></iframe>';
            const result = sanitizeHTML(input);
            expect(result).not.toContain('<iframe');
        });
    });

    describe('escapeHTML', () => {
        it('should escape special characters', () => {
            const input = '<script>alert("xss")</script>';
            const result = escapeHTML(input);
            expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
        });

        it('should escape ampersands', () => {
            const input = 'Tom & Jerry';
            const result = escapeHTML(input);
            expect(result).toBe('Tom &amp; Jerry');
        });
    });

    describe('sanitizeInput', () => {
        it('should trim whitespace', () => {
            const input = '  hello world  ';
            const result = sanitizeInput(input);
            expect(result).toBe('hello world');
        });

        it('should remove null bytes', () => {
            const input = 'hello\0world';
            const result = sanitizeInput(input);
            expect(result).toBe('helloworld');
        });
    });

    describe('sanitizeFilename', () => {
        it('should remove path separators', () => {
            const input = '../../../etc/passwd';
            const result = sanitizeFilename(input);
            expect(result).not.toContain('/');
            expect(result).not.toContain('\\');
        });

        it('should remove leading dots', () => {
            const input = '...hidden.txt';
            const result = sanitizeFilename(input);
            expect(result).toBe('hidden.txt');
        });

        it('should limit filename length', () => {
            const input = 'a'.repeat(300) + '.txt';
            const result = sanitizeFilename(input);
            expect(result.length).toBeLessThanOrEqual(255);
        });

        it('should return default for empty filename', () => {
            const input = '';
            const result = sanitizeFilename(input);
            expect(result).toBe('unnamed');
        });
    });

    describe('sanitizeURL', () => {
        it('should allow http and https protocols', () => {
            expect(sanitizeURL('https://example.com')).toBe('https://example.com');
            expect(sanitizeURL('http://example.com')).toBe('http://example.com');
        });

        it('should reject javascript protocol', () => {
            const input = 'javascript:alert("xss")';
            const result = sanitizeURL(input);
            expect(result).toBe('/');
        });

        it('should reject data protocol', () => {
            const input = 'data:text/html,<script>alert("xss")</script>';
            const result = sanitizeURL(input);
            expect(result).toBe('/');
        });

        it('should return safe default for invalid URLs', () => {
            const input = 'not a url';
            const result = sanitizeURL(input);
            expect(result).toBe('/');
        });
    });

    describe('sanitizeEmail', () => {
        it('should trim and lowercase email', () => {
            const input = '  USER@EXAMPLE.COM  ';
            const result = sanitizeEmail(input);
            expect(result).toBe('user@example.com');
        });

        it('should throw error for invalid email', () => {
            expect(() => sanitizeEmail('invalid-email')).toThrow('Invalid email format');
            expect(() => sanitizeEmail('missing@domain')).toThrow('Invalid email format');
        });

        it('should accept valid emails', () => {
            expect(sanitizeEmail('user@example.com')).toBe('user@example.com');
            expect(sanitizeEmail('user.name+tag@example.co.uk')).toBe('user.name+tag@example.co.uk');
        });
    });

    describe('stripHTMLTags', () => {
        it('should remove all HTML tags', () => {
            const input = '<p>Hello <strong>world</strong></p>';
            const result = stripHTMLTags(input);
            expect(result).toBe('Hello world');
        });

        it('should handle self-closing tags', () => {
            const input = 'Line 1<br/>Line 2';
            const result = stripHTMLTags(input);
            expect(result).toBe('Line 1Line 2');
        });
    });

    describe('sanitizeSearchQuery', () => {
        it('should escape regex special characters', () => {
            const input = 'test.*+?^${}()|[]\\';
            const result = sanitizeSearchQuery(input);
            expect(result).toContain('\\.');
            expect(result).toContain('\\*');
        });

        it('should limit length', () => {
            const input = 'a'.repeat(300);
            const result = sanitizeSearchQuery(input);
            expect(result.length).toBe(200);
        });

        it('should trim whitespace', () => {
            const input = '  search query  ';
            const result = sanitizeSearchQuery(input);
            expect(result).toBe('search query');
        });
    });

    describe('sanitizeNumber', () => {
        it('should parse string numbers', () => {
            expect(sanitizeNumber('42')).toBe(42);
            expect(sanitizeNumber('3.14')).toBe(3.14);
        });

        it('should accept number inputs', () => {
            expect(sanitizeNumber(42)).toBe(42);
            expect(sanitizeNumber(3.14)).toBe(3.14);
        });

        it('should throw error for invalid numbers', () => {
            expect(() => sanitizeNumber('not a number')).toThrow('Invalid number');
            expect(() => sanitizeNumber(NaN)).toThrow('Invalid number');
            expect(() => sanitizeNumber(Infinity)).toThrow('Invalid number');
        });

        it('should enforce minimum value', () => {
            expect(() => sanitizeNumber(5, { min: 10 })).toThrow('Must be at least 10');
            expect(sanitizeNumber(15, { min: 10 })).toBe(15);
        });

        it('should enforce maximum value', () => {
            expect(() => sanitizeNumber(15, { max: 10 })).toThrow('Must be at most 10');
            expect(sanitizeNumber(5, { max: 10 })).toBe(5);
        });

        it('should enforce integer constraint', () => {
            expect(() => sanitizeNumber(3.14, { integer: true })).toThrow('Must be an integer');
            expect(sanitizeNumber(42, { integer: true })).toBe(42);
        });
    });
});
