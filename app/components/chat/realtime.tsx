import { Send, ArrowLeft, MessageCircle, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "~/lib/utils"
import { ChatMessageItem } from "~/components/chat/message"
import { OfferCard } from "~/components/offer/card"
import { useRealtimeChat } from "~/hooks/use-realtime-chat"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { UserProfile } from "~/components/user/profile"
import { Sheet, SheetContent, SheetTitle } from "~/components/ui/sheet"
import ConversationList from "~/components/messages/conversation-list"
import { findOrCreateConversation } from "~/adapters/messages"
import { useUser } from "~/context/user"
import { useMessages } from "~/context/messages"
import { useIsMobile } from "~/hooks/use-mobile"

type ConversationInfo = {
    id: string
    otherUser: { id: string; name: string | null; distanceKm?: number }
}

// --- Shared header ---

function ChatHeader({
    title,
    onBack,
    onClose,
}: {
    title: React.ReactNode
    onBack?: () => void
    onClose?: () => void
}) {
    return (
        <div className="flex items-center gap-1 px-2 py-2 border-b border-border shrink-0">
            {onBack && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={onBack}
                >
                    <ArrowLeft className="size-4" />
                </Button>
            )}
            <div className="flex-1 min-w-0">
                {typeof title === "string" ? (
                    <p className="font-medium text-sm px-2">{title}</p>
                ) : (
                    title
                )}
            </div>
            {onClose && (
                <button
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                    onClick={onClose}
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    )
}

// --- Conversation ---

interface ConversationProps {
    conversation: ConversationInfo
    currentUserId: string
    senderName: string
    onBack: () => void
    onClose?: () => void
}

function Conversation({
    conversation,
    currentUserId,
    senderName,
    onBack,
    onClose,
}: ConversationProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const prevScrollHeight = useRef<number>(0)
    const {
        messages,
        loading,
        loadingMore,
        hasMore,
        loadMore,
        sendMessage,
        isConnected,
        updateOfferStatus: updateExchangeStatus,
    } = useRealtimeChat({
        conversationId: conversation.id,
        currentUserId,
        senderName,
    })
    const [newMessage, setNewMessage] = useState("")

    const inputRef = useCallback((node: HTMLInputElement | null) => {
        if (node) node.focus()
    }, [])

    const prevLengthRef = useRef(0)
    useEffect(() => {
        prevLengthRef.current = 0
    }, [conversation.id])
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const isInitialLoad = prevLengthRef.current === 0 && messages.length > 0
        const wasAtBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 80
        const appended =
            !isInitialLoad &&
            messages.length > prevLengthRef.current &&
            messages[messages.length - 1]?.created_at >=
                (messages[prevLengthRef.current - 1]?.created_at ?? "")
        prevLengthRef.current = messages.length
        if (isInitialLoad) {
            el.scrollTo({ top: el.scrollHeight, behavior: "instant" })
        } else if (wasAtBottom || appended) {
            el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
        }
    }, [messages])

    useEffect(() => {
        const el = containerRef.current
        if (!el || loadingMore) return
        if (prevScrollHeight.current) {
            el.scrollTop = el.scrollHeight - prevScrollHeight.current
            prevScrollHeight.current = 0
        }
    }, [loadingMore])

    function handleScroll() {
        const el = containerRef.current
        if (!el || loadingMore || !hasMore) return
        if (el.scrollTop < 60) {
            prevScrollHeight.current = el.scrollHeight
            loadMore()
        }
    }

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
            <ChatHeader
                title={
                    <UserProfile
                        id={otherUser.id}
                        name={otherUser.name}
                        subtitle={
                            otherUser.distanceKm !== undefined
                                ? `${Math.max(1, Math.round(otherUser.distanceKm))} km`
                                : undefined
                        }
                    />
                }
                onBack={onBack}
                onClose={onClose}
            />

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
            >
                {loadingMore && (
                    <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent" />
                    </div>
                )}
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
                                        <OfferCard
                                            offer={message.offer}
                                            currentUserId={currentUserId}
                                            otherUserId={otherUser.id}
                                            otherUserName={otherUser.name}
                                            isOwn={isOwn}
                                            onStatusChange={
                                                updateExchangeStatus
                                            }
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

// --- Root ---

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

    function handleClose() {
        setOpen(false)
        setActiveConversation(null)
        closeMessage()
    }

    if (variant === "floating") {
        const popupContent = activeConversation ? (
            <Conversation
                conversation={activeConversation}
                currentUserId={user.id}
                senderName={user.name ?? "Anonymous"}
                onBack={() => setActiveConversation(null)}
                onClose={handleClose}
            />
        ) : (
            <div className="flex flex-col h-full">
                <ChatHeader title="Messages" onClose={handleClose} />
                <div className="flex-1 overflow-y-auto p-2">
                    <ConversationList onSelect={handleSelect} />
                </div>
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
                            <SheetTitle className="sr-only">Messages</SheetTitle>
                            {popupContent}
                        </SheetContent>
                    </Sheet>
                </>
            )
        }

        return (
            <>
                <button
                    className="p-3 rounded-full bg-primary shadow-md hover:cursor-pointer"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    <MessageCircle
                        className="size-7 text-primary-foreground"
                        strokeWidth={1.5}
                    />
                </button>

                {open && (
                    <div className="fixed bottom-0 right-0 w-100 h-120 flex flex-col bg-background border border-border rounded-t-2xl shadow-xl overflow-hidden origin-bottom animate-in fade-in zoom-in-95 duration-200">
                        {popupContent}
                    </div>
                )}
            </>
        )
    }

    // Page variant
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
