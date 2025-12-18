import { generateCSRFToken, verifyCSRFToken } from '@/lib/security/csrf';

describe('CSRF Protection', () => {
    describe('generateCSRFToken', () => {
        it('should generate a valid token', () => {
            const token = generateCSRFToken();
            expect(token).toBeTruthy();
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3);
        });

        it('should generate unique tokens', () => {
            const token1 = generateCSRFToken();
            const token2 = generateCSRFToken();
            expect(token1).not.toBe(token2);
        });
    });

    describe('verifyCSRFToken', () => {
        it('should verify a valid token', () => {
            const token = generateCSRFToken();
            expect(verifyCSRFToken(token)).toBe(true);
        });

        it('should reject invalid token format', () => {
            expect(verifyCSRFToken('invalid')).toBe(false);
            expect(verifyCSRFToken('invalid.token')).toBe(false);
        });

        it('should reject tampered tokens', () => {
            const token = generateCSRFToken();
            const [tokenValue, timestamp] = token.split('.');
            const tamperedToken = `${tokenValue}.${timestamp}.wrongsignature`;
            expect(verifyCSRFToken(tamperedToken)).toBe(false);
        });

        it('should reject expired tokens', () => {
            // Create a token with old timestamp
            const oldTimestamp = (Date.now() - 4000000).toString(); // > 1 hour ago
            const token = `abc123.${oldTimestamp}.signature`;
            expect(verifyCSRFToken(token)).toBe(false);
        });

        it('should reject empty tokens', () => {
            expect(verifyCSRFToken('')).toBe(false);
        });
    });
});
