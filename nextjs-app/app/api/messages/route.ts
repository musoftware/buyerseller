import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { conversationId, content, attachments } = body;

        if (!conversationId || (!content && !attachments)) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Verify participation
        const participation = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: session.user.id,
                },
            },
        });

        if (!participation) {
            return NextResponse.json({ error: "Not a participant" }, { status: 403 });
        }

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: session.user.id,
                content: content || "",
                attachments: attachments ? attachments : undefined,
            },
            include: {
                sender: { select: { id: true, fullName: true, avatar: true } },
            },
        });

        // Update conversation updatedAt
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        // ... existing pusher trigger for message ...
        try {
            await pusherServer.trigger(conversationId, 'new-message', message);
        } catch (error) {
            console.error("Pusher trigger error:", error);
        }

        // Get recipients to notify
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true }
        });

        if (conversation) {
            const recipients = conversation.participants.filter(p => p.userId !== session.user.id);

            for (const recipient of recipients) {
                // Create DB Notification
                const notification = await prisma.notification.create({
                    data: {
                        userId: recipient.userId,
                        type: "MESSAGE_RECEIVED",
                        title: `New message from ${session.user.name}`,
                        message: content ? (content.length > 50 ? content.substring(0, 50) + "..." : content) : "Sent an attachment",
                        link: `/messages?c=${conversationId}`,
                    }
                });

                // Trigger Pusher Notification
                try {
                    await pusherServer.trigger(`user-${recipient.userId}`, 'notification', notification);
                } catch (error) {
                    console.error("Pusher notification error:", error);
                }
            }
        }

        return NextResponse.json(message);

    } catch (error) {
        console.error("Message send error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
