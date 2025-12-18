import { sanitizeHTML, sanitizeText, sanitizeInput, sanitizeFilename, sanitizeURL, sanitizeEmail } from '@/lib/security/sanitize';

describe('Security - Sanitization', () => {
    describe('sanitizeHTML', () => {
        it('should allow safe HTML tags', () => {
            const html = '<p>Hello <strong>World</strong></p>';
            const sanitized = sanitizeHTML(html);
            expect(sanitized).toContain('<p>');
            expect(sanitized).toContain('<strong>');
        });

        it('should remove dangerous tags', () => {
            const html = '<script>alert("XSS")</script><p>Safe content</p>';
            const sanitized = sanitizeHTML(html);
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('Safe content');
        });

        it('should remove event handlers', () => {
            const html = '<p onclick="alert(\'XSS\')">Click me</p>';
            const sanitized = sanitizeHTML(html);
            expect(sanitized).not.toContain('onclick');
        });
    });

    describe('sanitizeText', () => {
        it('should strip all HTML', () => {
            const text = '<p>Hello <strong>World</strong></p>';
            const sanitized = sanitizeText(text);
            expect(sanitized).toBe('Hello World');
        });
    });

    describe('sanitizeInput', () => {
        it('should trim whitespace', () => {
            expect(sanitizeInput('  hello  ')).toBe('hello');
        });

        it('should remove control characters', () => {
            const input = 'hello\x00world\x1F';
            const sanitized = sanitizeInput(input);
            expect(sanitized).toBe('helloworld');
        });

        it('should limit length', () => {
            const longInput = 'a'.repeat(20000);
            const sanitized = sanitizeInput(longInput);
            expect(sanitized.length).toBe(10000);
        });
    });

    describe('sanitizeFilename', () => {
        it('should replace unsafe characters', () => {
            expect(sanitizeFilename('my file.txt')).toBe('my_file.txt');
            expect(sanitizeFilename('file/name.txt')).toBe('file_name.txt');
        });

        it('should preserve safe characters', () => {
            expect(sanitizeFilename('my-file_123.txt')).toBe('my-file_123.txt');
        });

        it('should limit length', () => {
            const longName = 'a'.repeat(300) + '.txt';
            const sanitized = sanitizeFilename(longName);
            expect(sanitized.length).toBe(255);
        });
    });

    describe('sanitizeURL', () => {
        it('should allow http and https URLs', () => {
            expect(sanitizeURL('https://example.com')).toBe('https://example.com/');
            expect(sanitizeURL('http://example.com')).toBe('http://example.com/');
        });

        it('should reject javascript URLs', () => {
            expect(sanitizeURL('javascript:alert("XSS")')).toBe('');
        });

        it('should reject data URLs', () => {
            expect(sanitizeURL('data:text/html,<script>alert("XSS")</script>')).toBe('');
        });

        it('should handle invalid URLs', () => {
            expect(sanitizeURL('not a url')).toBe('');
        });
    });

    describe('sanitizeEmail', () => {
        it('should trim and lowercase email', () => {
            expect(sanitizeEmail('  Test@Example.COM  ')).toBe('test@example.com');
        });
    });
});
