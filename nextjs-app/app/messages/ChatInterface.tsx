"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Image as ImageIcon, Search, Phone, Video, MoreVertical, ChevronLeft } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { pusherClient } from "@/lib/pusher";

interface ChatInterfaceProps {
    currentUser: any;
    conversations: any[];
    initialMessages: any[];
    currentConversationId?: string;
}

export default function ChatInterface({
    currentUser,
    conversations,
    initialMessages,
    currentConversationId
}: ChatInterfaceProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ... existing effects

    const handleSendMessage = async (e?: React.FormEvent, attachmentUrl?: string) => {
        if (e) e.preventDefault();

        if ((!newMessage.trim() && !attachmentUrl) || !currentConversationId) return;

        const tempId = Date.now().toString();
        const optimisticMessage = {
            id: tempId,
            content: attachmentUrl ? "Sent an attachment" : newMessage,
            attachments: attachmentUrl ? JSON.stringify([attachmentUrl]) : null,
            senderId: currentUser.id,
            sender: currentUser,
            createdAt: new Date(),
            status: "SENDING"
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage("");
        setIsSending(true);

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: currentConversationId,
                    content: attachmentUrl ? "" : optimisticMessage.content, // content can be empty if attached. But UI shows fallback text.
                    attachments: attachmentUrl ? [attachmentUrl] : undefined
                })
            });

            if (!res.ok) throw new Error("Failed");

            const realMessage = await res.json();
            setMessages(prev => prev.map(m => m.id === tempId ? realMessage : m));
            router.refresh();
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            alert("Failed to send message");
        } finally {
            setIsSending(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.url) {
                await handleSendMessage(undefined, data.url);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex w-full h-full bg-white overflow-hidden shadow-sm border-t border-gray-200 lg:rounded-t-xl max-w-7xl mx-auto">
            {/* ... Sidebar ... */}
            <div className={cn(
                "w-full lg:w-80 border-r border-gray-200 flex flex-col h-full bg-white",
                currentConversationId ? "hidden lg:flex" : "flex"
            )}>
                {/* ... existing sidebar code ... */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Messages</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search conversations"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No conversations yet.
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const otherParticipant = conv.participants.find((p: any) => p.user.id !== currentUser.id)?.user;
                            const isActive = conv.id === currentConversationId;
                            if (!otherParticipant) return null;

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => router.push(`/messages?c=${conv.id}`)}
                                    className={cn(
                                        "p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3",
                                        isActive && "bg-emerald-50 hover:bg-emerald-100 border-l-4 border-l-emerald-500"
                                    )}
                                >
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                        <Image
                                            src={otherParticipant.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant.fullName}`}
                                            alt={otherParticipant.fullName}
                                            fill
                                            className="rounded-full object-cover border border-gray-200"
                                        />
                                        {otherParticipant.isOnline && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-semibold text-gray-900 truncate">{otherParticipant.fullName}</h4>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {conv.messages[0] ? formatDistanceToNow(new Date(conv.messages[0].createdAt), { addSuffix: true }).replace("about ", "") : ""}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-sm truncate",
                                            isActive ? "text-emerald-700" : "text-gray-500"
                                        )}>
                                            {conv.messages[0]?.content || (conv.messages[0]?.attachments ? "📎 Attachment" : "Start a conversation")}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Windows */}
            <div className={cn(
                "flex-1 flex flex-col h-full bg-gray-50",
                !currentConversationId ? "hidden lg:flex" : "flex"
            )}>
                {currentConversationId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                            {/* ... existing header ... */}
                            <div className="flex items-center gap-3">
                                <button
                                    className="lg:hidden p-2 -ml-2 text-gray-600"
                                    onClick={() => router.push("/messages")}
                                >
                                    <ChevronLeft />
                                </button>
                                {(() => {
                                    const conv = conversations.find(c => c.id === currentConversationId);
                                    const other = conv?.participants.find((p: any) => p.user.id !== currentUser.id)?.user;
                                    if (!other) return null;
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10">
                                                <Image
                                                    src={other.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${other.fullName}`}
                                                    alt={other.fullName}
                                                    fill
                                                    className="rounded-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{other.fullName}</h3>
                                                <span className="text-xs text-green-600 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                    Online
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="flex gap-2 text-gray-400">
                                <button className="p-2 hover:bg-gray-100 rounded-full"><Phone size={20} /></button>
                                <button className="p-2 hover:bg-gray-100 rounded-full"><Video size={20} /></button>
                                <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser.id;
                                const hasAttachments = msg.attachments && Array.isArray(JSON.parse(JSON.stringify(msg.attachments))) && JSON.parse(JSON.stringify(msg.attachments)).length > 0;
                                // Need to handle parsing carefully as Prisma returns Json type, might be stringified already or object.
                                // In JS, it's usually object.
                                let attachments: string[] = [];
                                if (msg.attachments) {
                                    try {
                                        attachments = typeof msg.attachments === 'string' ? JSON.parse(msg.attachments) : msg.attachments;
                                    } catch (e) { }
                                }

                                return (
                                    <div key={msg.id || idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[75%] lg:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm",
                                            isMe
                                                ? "bg-emerald-600 text-white rounded-tr-none"
                                                : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                                        )}>
                                            {attachments.length > 0 && (
                                                <div className="mb-2">
                                                    {attachments.map((url, i) => (
                                                        <div key={i} className="relative w-48 h-32 rounded-lg overflow-hidden bg-gray-100">
                                                            <Image src={url} alt="Attachment" fill className="object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.content && <p>{msg.content}</p>}
                                            <p className={cn(
                                                "text-[10px] mt-1 text-right",
                                                isMe ? "text-emerald-100" : "text-gray-400"
                                            )}>
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={(e) => handleSendMessage(e)} className="flex items-end gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="p-3 text-gray-400 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                                >
                                    <ImageIcon size={20} />
                                </button>
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all">
                                    <input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 max-h-32 resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !isUploading) || isSending}
                                    className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <Image src="https://illustrations.popsy.co/gray/work-from-home.svg" alt="Select conversation" width={64} height={64} className="opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Select a conversation</h3>
                        <p className="mt-2 text-center max-w-sm">Choose a chat from the sidebar to start messaging with sellers or buyers.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
