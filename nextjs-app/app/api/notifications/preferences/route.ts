import { NextRequest } from 'next/server'
import { ApiResponse, apiHandler, getPaginationParams, createPaginatedResponse } from '@/lib/api-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Notification Preferences System
 * Allows users to control what notifications they receive
 */

interface NotificationPreferences {
    userId: string
    email: {
        orderUpdates: boolean
        messages: boolean
        reviews: boolean
        marketing: boolean
        weeklyDigest: boolean
    }
    push: {
        orderUpdates: boolean
        messages: boolean
        reviews: boolean
    }
    inApp: {
        orderUpdates: boolean
        messages: boolean
        reviews: boolean
        system: boolean
    }
    updatedAt: Date
}

// Default preferences
const defaultPreferences: Omit<NotificationPreferences, 'userId' | 'updatedAt'> = {
    email: {
        orderUpdates: true,
        messages: true,
        reviews: true,
        marketing: false,
        weeklyDigest: true,
    },
    push: {
        orderUpdates: true,
        messages: true,
        reviews: true,
    },
    inApp: {
        orderUpdates: true,
        messages: true,
        reviews: true,
        system: true,
    },
}

// Store preferences (in production, use database)
const preferences: Map<string, NotificationPreferences> = new Map()

/**
 * Get notification preferences
 */
export const GET = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    let userPreferences = preferences.get(session.user.id)

    if (!userPreferences) {
        userPreferences = {
            userId: session.user.id,
            ...defaultPreferences,
            updatedAt: new Date(),
        }
        preferences.set(session.user.id, userPreferences)
    }

    return ApiResponse.success(userPreferences)
})

/**
 * Update notification preferences
 */
export const PUT = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const updates = await request.json()

    let userPreferences = preferences.get(session.user.id)

    if (!userPreferences) {
        userPreferences = {
            userId: session.user.id,
            ...defaultPreferences,
            updatedAt: new Date(),
        }
    }

    // Update preferences
    if (updates.email) {
        userPreferences.email = { ...userPreferences.email, ...updates.email }
    }
    if (updates.push) {
        userPreferences.push = { ...userPreferences.push, ...updates.push }
    }
    if (updates.inApp) {
        userPreferences.inApp = { ...userPreferences.inApp, ...updates.inApp }
    }

    userPreferences.updatedAt = new Date()
    preferences.set(session.user.id, userPreferences)

    // TODO: Save to database

    return ApiResponse.success(userPreferences)
})

/**
 * Check if user wants to receive a specific notification
 */
export async function shouldSendNotification(
    userId: string,
    type: 'email' | 'push' | 'inApp',
    category: string
): Promise<boolean> {
    const userPreferences = preferences.get(userId)

    if (!userPreferences) {
        return true // Default to sending if no preferences set
    }

    const categoryPrefs = userPreferences[type] as any
    return categoryPrefs[category] !== false
}

/**
 * Unsubscribe from all emails
 */
export const DELETE = apiHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
        return ApiResponse.error('Unsubscribe token is required')
    }

    // TODO: Verify token and get user ID
    // TODO: Update preferences to disable all email notifications

    return ApiResponse.success({
        message: 'Successfully unsubscribed from all email notifications',
    })
})
