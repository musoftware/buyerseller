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
 * Read Receipts for Messages
 */

interface ReadReceipt {
    messageId: string
    userId: string
    userName: string
    readAt: Date
}

// Store read receipts (in production, use database)
const readReceipts: Map<string, ReadReceipt[]> = new Map()

/**
 * Mark message as read
 */
export const POST = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { messageId, conversationId } = await request.json()

    if (!messageId) {
        return ApiResponse.error('Message ID is required')
    }

    const receipt: ReadReceipt = {
        messageId,
        userId: session.user.id,
        userName: session.user.name || 'User',
        readAt: new Date(),
    }

    // Store read receipt
    const messageReceipts = readReceipts.get(messageId) || []
    const existingIndex = messageReceipts.findIndex(r => r.userId === session.user.id)

    if (existingIndex >= 0) {
        messageReceipts[existingIndex] = receipt
    } else {
        messageReceipts.push(receipt)
    }

    readReceipts.set(messageId, messageReceipts)

    // TODO: Update database

    // Broadcast read receipt via Pusher
    if (conversationId) {
        try {
            await pusher.trigger(`conversation-${conversationId}`, 'message-read', {
                messageId,
                userId: session.user.id,
                userName: session.user.name,
                readAt: receipt.readAt,
            })
        } catch (error) {
            console.error('Pusher error:', error)
        }
    }

    return ApiResponse.success({ success: true })
})

/**
 * Mark multiple messages as read
 */
export const PUT = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { messageIds, conversationId } = await request.json()

    if (!messageIds || !Array.isArray(messageIds)) {
        return ApiResponse.error('Message IDs array is required')
    }

    const receipts: ReadReceipt[] = []

    for (const messageId of messageIds) {
        const receipt: ReadReceipt = {
            messageId,
            userId: session.user.id,
            userName: session.user.name || 'User',
            readAt: new Date(),
        }

        const messageReceipts = readReceipts.get(messageId) || []
        const existingIndex = messageReceipts.findIndex(r => r.userId === session.user.id)

        if (existingIndex >= 0) {
            messageReceipts[existingIndex] = receipt
        } else {
            messageReceipts.push(receipt)
        }

        readReceipts.set(messageId, messageReceipts)
        receipts.push(receipt)
    }

    // TODO: Batch update database

    // Broadcast read receipts via Pusher
    if (conversationId) {
        try {
            await pusher.trigger(`conversation-${conversationId}`, 'messages-read', {
                messageIds,
                userId: session.user.id,
                userName: session.user.name,
                readAt: new Date(),
            })
        } catch (error) {
            console.error('Pusher error:', error)
        }
    }

    return ApiResponse.success({ success: true, count: receipts.length })
})

/**
 * Get read receipts for a message
 */
export const GET = apiHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions)
    if (!session) {
        return ApiResponse.unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
        return ApiResponse.error('Message ID is required')
    }

    const receipts = readReceipts.get(messageId) || []

    return ApiResponse.success(receipts)
})

/**
 * Get unread message count for a conversation
 */
export async function getUnreadCount(
    conversationId: string,
    userId: string
): Promise<number> {
    // TODO: Implement with database query
    // This is a placeholder implementation
    return 0
}

/**
 * Mark all messages in a conversation as read
 */
export async function markConversationAsRead(
    conversationId: string,
    userId: string
): Promise<void> {
    // TODO: Implement with database update
    // Update all messages in the conversation as read by this user
}
