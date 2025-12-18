/**
 * Typing Events for Real-time Messaging
 * Handles typing indicators using Pusher
 */

import { pusherServer } from '../pusher';

interface TypingEvent {
    conversationId: string;
    userId: string;
    username: string;
    isTyping: boolean;
}

/**
 * Broadcast typing event to conversation
 */
export async function broadcastTyping(event: TypingEvent): Promise<void> {
    try {
        await pusherServer.trigger(
            `conversation-${event.conversationId}`,
            'typing',
            {
                userId: event.userId,
                username: event.username,
                isTyping: event.isTyping,
            }
        );
    } catch (error) {
        console.error('Error broadcasting typing event:', error);
    }
}

/**
 * Debounced typing handler for client-side
 */
export function createTypingHandler(
    conversationId: string,
    userId: string,
    username: string,
    delay: number = 3000
) {
    let typingTimeout: NodeJS.Timeout | null = null;
    let isCurrentlyTyping = false;

    return {
        /**
         * Call this when user starts typing
         */
        onTyping: async () => {
            // Send typing started event if not already typing
            if (!isCurrentlyTyping) {
                isCurrentlyTyping = true;
                await fetch('/api/messages/typing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversationId,
                        userId,
                        username,
                        isTyping: true,
                    }),
                });
            }

            // Clear existing timeout
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }

            // Set new timeout to stop typing
            typingTimeout = setTimeout(async () => {
                isCurrentlyTyping = false;
                await fetch('/api/messages/typing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversationId,
                        userId,
                        username,
                        isTyping: false,
                    }),
                });
            }, delay);
        },

        /**
         * Call this when user stops typing (e.g., sends message)
         */
        onStopTyping: async () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
                typingTimeout = null;
            }

            if (isCurrentlyTyping) {
                isCurrentlyTyping = false;
                await fetch('/api/messages/typing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversationId,
                        userId,
                        username,
                        isTyping: false,
                    }),
                });
            }
        },

        /**
         * Cleanup on unmount
         */
        cleanup: () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        },
    };
}
