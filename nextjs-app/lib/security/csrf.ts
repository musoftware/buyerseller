import { headers } from 'next/headers';
import crypto from 'crypto';

/**
 * CSRF Protection Utilities
 * Implements token-based CSRF protection for forms and API routes
 */

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-change-in-production';
const TOKEN_LENGTH = 32;

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
    const token = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
    const timestamp = Date.now().toString();
    const signature = crypto
        .createHmac('sha256', CSRF_SECRET)
        .update(token + timestamp)
        .digest('hex');

    return `${token}.${timestamp}.${signature}`;
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string): boolean {
    try {
        const [tokenValue, timestamp, signature] = token.split('.');

        if (!tokenValue || !timestamp || !signature) {
            return false;
        }

        // Check if token is expired (1 hour)
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge > 3600000) {
            return false;
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', CSRF_SECRET)
            .update(tokenValue + timestamp)
            .digest('hex');

        return signature === expectedSignature;
    } catch (error) {
        return false;
    }
}

/**
 * Middleware to verify CSRF token from request headers
 */
export async function verifyCSRFFromRequest(): Promise<boolean> {
    const headersList = await headers();
    const csrfToken = headersList.get('x-csrf-token');

    if (!csrfToken) {
        return false;
    }

    return verifyCSRFToken(csrfToken);
}

/**
 * Get CSRF token from cookies or generate new one
 */
export function getOrCreateCSRFToken(existingToken?: string): string {
    if (existingToken && verifyCSRFToken(existingToken)) {
        return existingToken;
    }
    return generateCSRFToken();
}
