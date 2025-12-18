import { NextRequest } from 'next/server'
import { ApiResponse, apiHandler } from '@/lib/api-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Pusher from 'pusher'

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
})

/**
 * Typing Indicators for Real-time Chat
 */

interface TypingIndicator {
    conversationId: string
    userId: string
    userName: string
    isTyping: boolean
    timestamp: Date
}

// Store active typing indicators (in production, use Redis)
const typingIndicators: Map<string, TypingIndicator[]> = new Map()

/**
 * Start typing indicator
 */
export const POST = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { conversationId, isTyping } = await request.json()

    if (!conversationId) {
        return ApiResponse.error('Conversation ID is required')
    }

    const indicator: TypingIndicator = {
        conversationId,
        userId: session.user.id,
        userName: session.user.name || 'User',
        isTyping,
        timestamp: new Date(),
    }

    // Update typing indicators
    const conversationIndicators = typingIndicators.get(conversationId) || []
    const existingIndex = conversationIndicators.findIndex(
        i => i.userId === session.user.id
    )

    if (isTyping) {
        if (existingIndex >= 0) {
            conversationIndicators[existingIndex] = indicator
        } else {
            conversationIndicators.push(indicator)
        }
    } else {
        if (existingIndex >= 0) {
            conversationIndicators.splice(existingIndex, 1)
        }
    }

    typingIndicators.set(conversationId, conversationIndicators)

    // Broadcast typing indicator via Pusher
    try {
        await pusher.trigger(`conversation-${conversationId}`, 'typing', {
            userId: session.user.id,
            userName: session.user.name,
            isTyping,
        })
    } catch (error) {
        console.error('Pusher error:', error)
    }

    return ApiResponse.success({ success: true })
})

/**
 * Get typing indicators for a conversation
 */
export const GET = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
        return ApiResponse.error('Conversation ID is required')
    }

    const indicators = typingIndicators.get(conversationId) || []

    // Filter out old indicators (older than 10 seconds)
    const now = new Date()
    const activeIndicators = indicators.filter(
        i => now.getTime() - i.timestamp.getTime() < 10000 && i.userId !== session.user.id
    )

    return ApiResponse.success(activeIndicators)
})

/**
 * Clean up old typing indicators (run periodically)
 */
export function cleanupTypingIndicators(): void {
    const now = new Date()
    const timeout = 10000 // 10 seconds

    for (const [conversationId, indicators] of typingIndicators.entries()) {
        const activeIndicators = indicators.filter(
            i => now.getTime() - i.timestamp.getTime() < timeout
        )

        if (activeIndicators.length === 0) {
            typingIndicators.delete(conversationId)
        } else {
            typingIndicators.set(conversationId, activeIndicators)
        }
    }
}

// Clean up every 30 seconds
setInterval(cleanupTypingIndicators, 30000)
