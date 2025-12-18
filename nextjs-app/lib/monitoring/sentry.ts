/**
 * Sentry Error Tracking Configuration
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

export function initSentry() {
    if (!SENTRY_DSN) {
        console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: ENVIRONMENT,

        // Performance Monitoring
        tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        // Error filtering
        beforeSend(event, hint) {
            // Don't send errors in development
            if (ENVIRONMENT === 'development') {
                console.error('Sentry Event:', event);
                console.error('Original Error:', hint.originalException);
                return null;
            }

            // Filter out specific errors
            const error = hint.originalException;
            if (error && typeof error === 'object' && 'message' in error) {
                const message = String(error.message);

                // Ignore common non-critical errors
                if (
                    message.includes('ResizeObserver loop') ||
                    message.includes('Non-Error promise rejection') ||
                    message.includes('cancelled')
                ) {
                    return null;
                }
            }

            return event;
        },

        // Integrations
        integrations: [
            new Sentry.BrowserTracing({
                tracePropagationTargets: ['localhost', /^https:\/\/yourapp\.com/],
            }),
            new Sentry.Replay({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],
    });
}

/**
 * Capture exception with context
 */
export function captureException(
    error: Error,
    context?: {
        tags?: Record<string, string>;
        extra?: Record<string, any>;
        user?: { id: string; email?: string; username?: string };
        level?: Sentry.SeverityLevel;
    }
) {
    if (context?.tags) {
        Sentry.setTags(context.tags);
    }

    if (context?.extra) {
        Sentry.setExtras(context.extra);
    }

    if (context?.user) {
        Sentry.setUser(context.user);
    }

    Sentry.captureException(error, {
        level: context?.level || 'error',
    });
}

/**
 * Capture message
 */
export function captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, any>
) {
    if (context) {
        Sentry.setExtras(context);
    }

    Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: {
    id: string;
    email?: string;
    username?: string;
}) {
    Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
    Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(
    message: string,
    category?: string,
    data?: Record<string, any>
) {
    Sentry.addBreadcrumb({
        message,
        category: category || 'custom',
        data,
        level: 'info',
    });
}

/**
 * Start transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
    return Sentry.startTransaction({
        name,
        op,
    });
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: { name: string; tags?: Record<string, string> }
): T {
    return (async (...args: Parameters<T>) => {
        try {
            return await fn(...args);
        } catch (error) {
            captureException(error as Error, {
                tags: {
                    function: context?.name || fn.name,
                    ...context?.tags,
                },
            });
            throw error;
        }
    }) as T;
}
