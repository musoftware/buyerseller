import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * API Response wrapper for consistent responses
 */
export class ApiResponse {
    static success<T>(data: T, message?: string, status: number = 200) {
        return NextResponse.json(
            {
                success: true,
                data,
                message,
                timestamp: new Date().toISOString(),
            },
            { status }
        )
    }

    static error(
        message: string,
        status: number = 400,
        errors?: Record<string, string[]>
    ) {
        return NextResponse.json(
            {
                success: false,
                error: message,
                errors,
                timestamp: new Date().toISOString(),
            },
            { status }
        )
    }

    static unauthorized(message: string = 'Unauthorized') {
        return this.error(message, 401)
    }

    static forbidden(message: string = 'Forbidden') {
        return this.error(message, 403)
    }

    static notFound(message: string = 'Resource not found') {
        return this.error(message, 404)
    }

    static validationError(errors: Record<string, string[]>) {
        return this.error('Validation failed', 422, errors)
    }

    static serverError(message: string = 'Internal server error') {
        return this.error(message, 500)
    }
}

/**
 * Validate request body against Zod schema
 */
export async function validateRequest<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string[]> }> {
    try {
        const body = await request.json()
        const data = schema.parse(body)
        return { success: true, data }
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: Record<string, string[]> = {}
            error.issues.forEach(err => {
                const path = err.path.join('.')
                if (!errors[path]) {
                    errors[path] = []
                }
                errors[path].push(err.message)
            })
            return { success: false, errors }
        }
        return {
            success: false,
            errors: { _error: ['Invalid request body'] },
        }
    }
}

/**
 * API route handler wrapper with error handling
 */
export function apiHandler(
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
    return async (request: NextRequest, context?: any) => {
        try {
            return await handler(request, context)
        } catch (error) {
            console.error('API Error:', error)

            if (error instanceof z.ZodError) {
                const errors: Record<string, string[]> = {}
                error.issues.forEach(err => {
                    const path = err.path.join('.')
                    if (!errors[path]) {
                        errors[path] = []
                    }
                    errors[path].push(err.message)
                })
                return ApiResponse.validationError(errors)
            }

            return ApiResponse.serverError(
                error instanceof Error ? error.message : 'An unexpected error occurred'
            )
        }
    }
}

/**
 * Pagination helper
 */
export interface PaginationParams {
    page: number
    limit: number
    skip: number
}

export function getPaginationParams(
    searchParams: URLSearchParams,
    defaultLimit: number = 20
): PaginationParams {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit))))
    const skip = (page - 1) * limit

    return { page, limit, skip }
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams
): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / params.limit)

    return {
        data,
        pagination: {
            page: params.page,
            limit: params.limit,
            total,
            totalPages,
            hasNext: params.page < totalPages,
            hasPrev: params.page > 1,
        },
    }
}

/**
 * Query parameter helpers
 */
export function getQueryParam(
    searchParams: URLSearchParams,
    key: string,
    defaultValue?: string
): string | undefined {
    return searchParams.get(key) || defaultValue
}

export function getQueryParamArray(
    searchParams: URLSearchParams,
    key: string
): string[] {
    const value = searchParams.get(key)
    return value ? value.split(',').map(v => v.trim()) : []
}

export function getQueryParamNumber(
    searchParams: URLSearchParams,
    key: string,
    defaultValue?: number
): number | undefined {
    const value = searchParams.get(key)
    if (!value) return defaultValue
    const num = parseInt(value)
    return isNaN(num) ? defaultValue : num
}

export function getQueryParamBoolean(
    searchParams: URLSearchParams,
    key: string,
    defaultValue: boolean = false
): boolean {
    const value = searchParams.get(key)
    if (!value) return defaultValue
    return value === 'true' || value === '1'
}

/**
 * CORS helper
 */
export function corsHeaders(origin?: string) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    }
}

/**
 * Cache control helper
 */
export function cacheControl(seconds: number, options: {
    public?: boolean
    immutable?: boolean
    staleWhileRevalidate?: number
} = {}) {
    const parts = []

    if (options.public) {
        parts.push('public')
    } else {
        parts.push('private')
    }

    parts.push(`max-age=${seconds}`)

    if (options.immutable) {
        parts.push('immutable')
    }

    if (options.staleWhileRevalidate) {
        parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`)
    }

    return parts.join(', ')
}
