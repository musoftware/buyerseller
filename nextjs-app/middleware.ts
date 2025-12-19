import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting store (in production, use Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // 100 requests per minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const userLimit = rateLimit.get(ip)

    if (!userLimit || now > userLimit.resetTime) {
        rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
        return true
    }

    if (userLimit.count >= MAX_REQUESTS) {
        return false
    }

    userLimit.count++
    return true
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Rate limiting for API routes
    if (pathname.startsWith('/api/')) {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            )
        }
    }

    // Protected routes
    const protectedRoutes = [
        '/dashboard',
        '/messages',
        '/create-gig',
        '/settings',
        '/checkout',
        '/favorites',
    ]

    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    )

    if (isProtectedRoute) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        })

        if (!token) {
            const url = new URL('/login', request.url)
            url.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(url)
        }
    }

    // Admin routes
    const adminRoutes = ['/admin']
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (isAdminRoute) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        })

        if (!token || token.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Security headers (additional to next.config.js)
    const response = NextResponse.next()

    // CSRF protection
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
        const origin = request.headers.get('origin')
        const host = request.headers.get('host')

        if (origin && !origin.includes(host || '')) {
            return NextResponse.json(
                { error: 'CSRF validation failed' },
                { status: 403 }
            )
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
