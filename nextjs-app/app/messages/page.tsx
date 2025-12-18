import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ChatInterface from "./ChatInterface";

export const dynamic = "force-dynamic";

export default async function MessagesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const params = await searchParams;
    const currentConversationId = params.c as string;

    // Fetch all conversations
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
                            isOnline: true,
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

    let currentMessages: any[] = [];
    let currentConversation: any = null;

    if (currentConversationId) {
        currentConversation = conversations.find((c) => c.id === currentConversationId);

        // Verify participation
        if (currentConversation) {
            currentMessages = await prisma.message.findMany({
                where: { conversationId: currentConversationId },
                include: { sender: { select: { id: true, fullName: true, avatar: true } } },
                orderBy: { createdAt: "asc" },
            });
        }
    }

    return (
        <div className="h-[calc(100vh-4rem)] bg-gray-50 flex">
            <ChatInterface
                currentUser={session.user}
                conversations={conversations}
                initialMessages={currentMessages}
                currentConversationId={currentConversationId}
            />
        </div>
    );
}
