import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { pusherServer } from '@/lib/pusher';

const readReceiptSchema = z.object({
    messageIds: z.array(z.string()),
    conversationId: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { messageIds, conversationId } = readReceiptSchema.parse(body);

        // Update messages as read
        await prisma.message.updateMany({
            where: {
                id: { in: messageIds },
                conversationId,
                senderId: { not: session.user.id },
                status: { not: 'READ' },
            },
            data: {
                status: 'READ',
            },
        });

        // Broadcast read receipt event
        await pusherServer.trigger(
            `conversation-${conversationId}`,
            'messages-read',
            {
                messageIds,
                readBy: session.user.id,
                readAt: new Date().toISOString(),
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Read receipt error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get('conversationId');

        if (!conversationId) {
            return NextResponse.json(
                { error: 'Conversation ID required' },
                { status: 400 }
            );
        }

        // Get unread message count
        const unreadCount = await prisma.message.count({
            where: {
                conversationId,
                senderId: { not: session.user.id },
                status: { not: 'READ' },
            },
        });

        return NextResponse.json({ unreadCount });
    } catch (error) {
        console.error('Get unread count error:', error);
        return NextResponse.json(
            { error: 'Failed to get unread count' },
            { status: 500 }
        );
    }
}
