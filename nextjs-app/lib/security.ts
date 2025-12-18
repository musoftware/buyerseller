import DOMPurify from 'isomorphic-dompurify'
import { z } from 'zod'

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
    })
}

/**
 * Sanitize user input (remove scripts and dangerous content)
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim()
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
    return email.toLowerCase().trim()
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string, storedToken: string): boolean {
    return token === storedToken
}

/**
 * Hash password (use bcrypt in production)
 */
export async function hashPassword(password: string): Promise<string> {
    // In production, use bcrypt
    // For now, this is a placeholder
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

/**
 * Verify password
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    const hash = await hashPassword(password)
    return hash === hashedPassword
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate file upload
 */
export function validateFileUpload(
    file: File,
    options: {
        maxSize?: number
        allowedTypes?: string[]
    } = {}
): { valid: boolean; error?: string } {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size exceeds ${maxSize / 1024 / 1024}MB`,
        }
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed`,
        }
    }

    return { valid: true }
}

/**
 * SQL injection prevention - parameterize queries
 */
export function escapeSQL(value: string): string {
    return value.replace(/'/g, "''").replace(/;/g, '')
}

/**
 * Validation schemas using Zod
 */
export const schemas = {
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    url: z.string().url('Invalid URL'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    price: z.number().positive('Price must be positive').max(1000000, 'Price too high'),
    rating: z.number().min(0).max(5),
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
    private requests: Map<string, number[]> = new Map()

    constructor(
        private maxRequests: number,
        private windowMs: number
    ) { }

    check(identifier: string): boolean {
        const now = Date.now()
        const userRequests = this.requests.get(identifier) || []

        // Remove old requests outside the window
        const validRequests = userRequests.filter(
            timestamp => now - timestamp < this.windowMs
        )

        if (validRequests.length >= this.maxRequests) {
            return false
        }

        validRequests.push(now)
        this.requests.set(identifier, validRequests)
        return true
    }

    reset(identifier: string): void {
        this.requests.delete(identifier)
    }
}

/**
 * Content Security Policy nonce generator
 */
export function generateNonce(): string {
    return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
}

/**
 * Secure headers helper
 */
export const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}
