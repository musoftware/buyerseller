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
        const { conversationId, content } = body;

        if (!conversationId || !content) {
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
                content,
                // attachments...
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

        // Trigger Pusher event
        try {
            await pusherServer.trigger(conversationId, 'new-message', message);
        } catch (error) {
            console.error("Pusher trigger error:", error);
            // Don't fail the request if real-time update fails
        }

        return NextResponse.json(message);

    } catch (error) {
        console.error("Message send error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
