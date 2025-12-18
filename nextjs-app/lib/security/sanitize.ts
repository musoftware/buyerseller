/**
 * Input Sanitization Utilities
 * Protects against XSS and other injection attacks
 */

/**
 * Sanitize HTML content to prevent XSS
 * Removes dangerous tags and attributes
 */
export function sanitizeHTML(html: string): string {
    // Remove script tags
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data: protocol (can be used for XSS)
    sanitized = sanitized.replace(/data:text\/html/gi, '');

    // Remove iframe tags
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    // Remove object and embed tags
    sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

    return sanitized;
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeInput(input: string): string {
    // Trim whitespace
    let sanitized = input.trim();

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Normalize unicode
    sanitized = sanitized.normalize('NFC');

    return sanitized;
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
    // Remove path separators
    let sanitized = filename.replace(/[\/\\]/g, '');

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove leading dots
    sanitized = sanitized.replace(/^\.+/, '');

    // Limit length
    if (sanitized.length > 255) {
        const ext = sanitized.split('.').pop();
        const name = sanitized.substring(0, 255 - (ext?.length || 0) - 1);
        sanitized = ext ? `${name}.${ext}` : name;
    }

    return sanitized || 'unnamed';
}

/**
 * Sanitize URL to prevent open redirect vulnerabilities
 */
export function sanitizeURL(url: string): string {
    try {
        const parsed = new URL(url, 'https://example.com');

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '/';
        }

        return url;
    } catch {
        // If URL parsing fails, return safe default
        return '/';
    }
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
    const sanitized = email.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
        throw new Error('Invalid email format');
    }

    return sanitized;
}

/**
 * Strip all HTML tags from text
 */
export function stripHTMLTags(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
    // Remove special regex characters
    let sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Trim and limit length
    sanitized = sanitized.trim().substring(0, 200);

    return sanitized;
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(input: string | number, options?: {
    min?: number;
    max?: number;
    integer?: boolean;
}): number {
    const num = typeof input === 'string' ? parseFloat(input) : input;

    if (isNaN(num) || !isFinite(num)) {
        throw new Error('Invalid number');
    }

    if (options?.integer && !Number.isInteger(num)) {
        throw new Error('Must be an integer');
    }

    if (options?.min !== undefined && num < options.min) {
        throw new Error(`Must be at least ${options.min}`);
    }

    if (options?.max !== undefined && num > options.max) {
        throw new Error(`Must be at most ${options.max}`);
    }

    return num;
}
