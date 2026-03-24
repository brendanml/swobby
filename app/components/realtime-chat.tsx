import { Send, ArrowLeft, MessageCircle } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "~/lib/utils"
import { ChatMessageItem } from "~/components/chat-message"
import { ExchangeCard } from "~/components/exchange-card"
import { useRealtimeChat } from "~/hooks/use-realtime-chat"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { UserProfile } from "~/components/user-profile"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"
import { Sheet, SheetContent } from "~/components/ui/sheet"
import ConversationList from "~/components/messages/conversation-list"
import { findOrCreateConversation } from "~/adapters/messages"
import { useUser } from "~/context/user"
import { useMessages } from "~/context/messages"
import { useIsMobile } from "~/hooks/use-mobile"

type ConversationInfo = {
    id: string
    otherUser: { id: string; name: string | null; distanceKm?: number }
}

// --- Conversation ---

interface ConversationProps {
    conversation: ConversationInfo
    currentUserId: string
    senderName: string
    onBack: () => void
}

function Conversation({
    conversation,
    currentUserId,
    senderName,
    onBack,
}: ConversationProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const {
        messages,
        loading,
        sendMessage,
        isConnected,
        updateExchangeStatus,
    } = useRealtimeChat({
        conversationId: conversation.id,
        currentUserId,
        senderName,
    })
    const [newMessage, setNewMessage] = useState("")

    const inputRef = useCallback((node: HTMLInputElement | null) => {
        if (node) node.focus()
    }, [])

    useEffect(() => {
        if (!containerRef.current) return
        containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: "smooth",
        })
    }, [messages])

    const handleSend = useCallback(
        (e: React.SyntheticEvent) => {
            e.preventDefault()
            if (!newMessage.trim() || !isConnected) return
            sendMessage(newMessage)
            setNewMessage("")
        },
        [newMessage, isConnected, sendMessage],
    )

    const { otherUser } = conversation

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-1 px-2 py-2 border-b border-border shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={onBack}
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <UserProfile
                    id={otherUser.id}
                    name={otherUser.name}
                    subtitle={
                        otherUser.distanceKm !== undefined
                            ? `${Math.max(1, Math.round(otherUser.distanceKm))} km`
                            : undefined
                    }
                />
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted-foreground border-t-transparent" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground">
                        No messages yet. Start the conversation!
                    </div>
                ) : null}

                {messages.map((message, index) => {
                    const prev = index > 0 ? messages[index - 1] : null
                    const showHeader =
                        !prev || prev.sender_id !== message.sender_id
                    const isOwn = message.sender_id === currentUserId
                    return (
                        <div
                            key={message.id}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                        >
                            <ChatMessageItem
                                message={message}
                                isOwnMessage={isOwn}
                                showHeader={showHeader}
                            />
                            {message.offer && (
                                <div
                                    className={`flex mt-1 ${isOwn ? "justify-end" : "justify-start"}`}
                                >
                                    <div className="max-w-[85%] w-full">
                                        <ExchangeCard
                                            offer={message.offer}
                                            currentUserId={currentUserId}
                                            otherUserId={otherUser.id}
                                            otherUserName={otherUser.name}
                                            isOwn={isOwn}
                                            onStatusChange={updateExchangeStatus}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <form
                onSubmit={handleSend}
                className="flex w-full gap-2 border-t border-border p-3 shrink-0"
            >
                <Input
                    ref={inputRef}
                    className={cn(
                        "rounded-full bg-background text-sm transition-all duration-300",
                        isConnected && newMessage.trim()
                            ? "w-[calc(100%-36px)]"
                            : "w-full",
                    )}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                {isConnected && newMessage.trim() && (
                    <Button
                        className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300 border-2 border-primary-bold"
                        type="submit"
                    >
                        <Send className="size-4" />
                    </Button>
                )}
            </form>
        </div>
    )
}

interface RealtimeChatProps {
    variant: "floating" | "page"
}

export function RealtimeChat({ variant }: RealtimeChatProps) {
    const { user } = useUser()
    const { messageUser, closeMessage } = useMessages()
    const isMobile = useIsMobile()
    const [activeConversation, setActiveConversation] =
        useState<ConversationInfo | null>(null)
    const [open, setOpen] = useState(false)

    // Open a conversation when messageUser is set externally (e.g. "Message" button on profile)
    useEffect(() => {
        if (!messageUser || !user?.id || variant !== "floating") return
        findOrCreateConversation(user.id, messageUser.id).then(
            (conversationId) => {
                setActiveConversation({
                    id: conversationId,
                    otherUser: {
                        id: messageUser.id,
                        name: messageUser.name,
                        distanceKm: messageUser.distanceKm,
                    },
                })
                setOpen(true)
            },
        )
    }, [messageUser, user?.id, variant])

    if (!user?.id) return null

    const handleSelect = ({
        conversationId,
        otherUserId,
        name,
    }: {
        conversationId: string
        otherUserId: string
        name: string
    }) =>
        setActiveConversation({
            id: conversationId,
            otherUser: { id: otherUserId, name },
        })

    if (variant === "floating") {
        const sheetContent = activeConversation ? (
            <Conversation
                conversation={activeConversation}
                currentUserId={user.id}
                senderName={user.name ?? "Anonymous"}
                onBack={() => setActiveConversation(null)}
            />
        ) : (
            <div className="p-2">
                <ConversationList
                    onSelect={handleSelect}
                />
            </div>
        )

        if (isMobile) {
            return (
                <>
                    <button
                        className="p-3 rounded-full bg-primary shadow-md hover:cursor-pointer"
                        onClick={() => setOpen(true)}
                    >
                        <MessageCircle
                            className="size-7 text-primary-foreground"
                            strokeWidth={1.5}
                        />
                    </button>
                    <Sheet
                        open={open}
                        onOpenChange={(next) => {
                            setOpen(next)
                            if (!next) {
                                setActiveConversation(null)
                                closeMessage()
                            }
                        }}
                    >
                        <SheetContent
                            side="bottom"
                            className="h-[80vh]! p-0 rounded-xl"
                            showCloseButton={false}
                        >
                            {sheetContent}
                        </SheetContent>
                    </Sheet>
                </>
            )
        }

        return (
            <Popover
                open={open}
                onOpenChange={(next) => {
                    setOpen(next)
                    if (!next) {
                        setActiveConversation(null)
                        closeMessage()
                    }
                }}
            >
                <PopoverTrigger className="p-3 rounded-full bg-primary shadow-md hover:cursor-pointer">
                    <MessageCircle
                        className="size-7 text-primary-foreground"
                        strokeWidth={1.5}
                    />
                </PopoverTrigger>
                <PopoverContent className="h-150 w-100 p-0">
                    {sheetContent}
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <div className="flex h-full w-full overflow-hidden">
            <div className="w-64 shrink-0 border-r border-border overflow-y-auto p-2">
                <ConversationList
                    onSelect={handleSelect}
                    activeConversationId={activeConversation?.id ?? undefined}
                />
            </div>
            <div className="flex-1 min-w-0">
                {activeConversation ? (
                    <Conversation
                        conversation={activeConversation}
                        currentUserId={user.id}
                        senderName={user.name ?? "Anonymous"}
                        onBack={() => setActiveConversation(null)}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        Select a conversation
                    </div>
                )}
            </div>
        </div>
    )
}
