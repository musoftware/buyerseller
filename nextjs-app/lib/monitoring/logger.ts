/**
 * Structured Logger
 * Provides consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, any>;
    error?: Error;
    userId?: string;
    requestId?: string;
}

class Logger {
    private minLevel: LogLevel;
    private levels: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        fatal: 4,
    };

    constructor(minLevel: LogLevel = 'info') {
        this.minLevel = minLevel;
    }

    private shouldLog(level: LogLevel): boolean {
        return this.levels[level] >= this.levels[this.minLevel];
    }

    private formatLog(entry: LogEntry): string {
        const { level, message, timestamp, context, error, userId, requestId } = entry;

        const logObject: any = {
            level,
            message,
            timestamp,
        };

        if (userId) logObject.userId = userId;
        if (requestId) logObject.requestId = requestId;
        if (context) logObject.context = context;
        if (error) {
            logObject.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }

        return JSON.stringify(logObject);
    }

    private log(level: LogLevel, message: string, meta?: {
        context?: Record<string, any>;
        error?: Error;
        userId?: string;
        requestId?: string;
    }) {
        if (!this.shouldLog(level)) return;

        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            ...meta,
        };

        const formatted = this.formatLog(entry);

        // In development, use console with colors
        if (process.env.NODE_ENV === 'development') {
            const colors: Record<LogLevel, string> = {
                debug: '\x1b[36m', // Cyan
                info: '\x1b[32m',  // Green
                warn: '\x1b[33m',  // Yellow
                error: '\x1b[31m', // Red
                fatal: '\x1b[35m', // Magenta
            };
            const reset = '\x1b[0m';

            console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${message}`, meta?.context || '');
            if (meta?.error) {
                console.error(meta.error);
            }
        } else {
            // In production, output JSON
            console.log(formatted);
        }

        // TODO: Send to log aggregation service (e.g., Datadog, CloudWatch, Logtail)
        // this.sendToLogService(entry);
    }

    debug(message: string, context?: Record<string, any>) {
        this.log('debug', message, { context });
    }

    info(message: string, context?: Record<string, any>) {
        this.log('info', message, { context });
    }

    warn(message: string, context?: Record<string, any>) {
        this.log('warn', message, { context });
    }

    error(message: string, error?: Error, context?: Record<string, any>) {
        this.log('error', message, { error, context });
    }

    fatal(message: string, error?: Error, context?: Record<string, any>) {
        this.log('fatal', message, { error, context });
    }

    // Request-specific logging
    request(requestId: string, method: string, path: string, context?: Record<string, any>) {
        this.log('info', `${method} ${path}`, {
            requestId,
            context: { ...context, type: 'request' },
        });
    }

    response(requestId: string, statusCode: number, duration: number, context?: Record<string, any>) {
        this.log('info', `Response ${statusCode}`, {
            requestId,
            context: { ...context, duration, type: 'response' },
        });
    }

    // Database query logging
    query(query: string, duration: number, context?: Record<string, any>) {
        this.log('debug', 'Database query', {
            context: { ...context, query, duration, type: 'database' },
        });
    }

    // Cache logging
    cache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, context?: Record<string, any>) {
        this.log('debug', `Cache ${operation}`, {
            context: { ...context, key, type: 'cache' },
        });
    }

    // Payment logging
    payment(event: string, amount: number, currency: string, context?: Record<string, any>) {
        this.log('info', `Payment ${event}`, {
            context: { ...context, amount, currency, type: 'payment' },
        });
    }

    // Security logging
    security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, any>) {
        const level: LogLevel = severity === 'critical' ? 'fatal' : severity === 'high' ? 'error' : 'warn';
        this.log(level, `Security: ${event}`, {
            context: { ...context, severity, type: 'security' },
        });
    }
}

// Export singleton instance
const logger = new Logger(
    (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
);

export default logger;

// Export class for testing
export { Logger };
