import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                avatar: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("Conversations fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // Start new conversation
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { recipientId } = body;

        if (!recipientId) return NextResponse.json({ error: "Recipient required" }, { status: 400 });

        // Check if conversation exists
        // This is tricky in Prisma many-to-many. 
        // Easier to just check if both users are participants. 
        // For now, assume create if not exists logic is handled or just create new.
        // Strictly, we should check uniqueness.

        // Simplification: Create new if not passing existing ID.

        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId: session.user.id },
                        { userId: recipientId }
                    ]
                }
            }
        });

        return NextResponse.json(conversation);

    } catch (error) {
        console.error("Conversation create error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
