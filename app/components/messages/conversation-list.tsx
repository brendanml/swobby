import { useEffect, useState } from "react"
import { supabase } from "~/lib/supabase/client"
import { useUser } from "~/context/user"
import { Skeleton } from "~/components/ui/skeleton"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"

function initials(name: string | null): string {
    if (!name) return "?"
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

function formatTime(iso: string): string {
    const date = new Date(iso)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" })
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

interface Conversation {
    id: string
    otherUserId: string
    otherUserName: string
    lastMessage: string | null
    lastMessageAt: string | null
}

interface ConversationListProps {
    onSelect: (conversation: { conversationId: string; otherUserId: string; name: string }) => void
    activeConversationId?: string
}

export default function ConversationList({ onSelect, activeConversationId }: ConversationListProps) {
    const { user } = useUser()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.id) return

        function getName(profile: any): string | null {
            if (!profile) return null
            const p = Array.isArray(profile) ? profile[0] : profile
            return p?.name ?? null
        }

        async function load() {
            const { data: convos } = await supabase
                .from("conversations")
                .select("id, user_id_1, user_id_2, p1:profiles!user_id_1(name), p2:profiles!user_id_2(name)")
                .or(`user_id_1.eq.${user!.id},user_id_2.eq.${user!.id}`)
                .order("created_at", { ascending: false })

            if (!convos?.length) return setLoading(false)

            const convoIds = convos.map((c) => c.id)

            const { data: messages } = await supabase
                .from("messages")
                .select("conversation_id, content, created_at")
                .in("conversation_id", convoIds)
                .order("created_at", { ascending: false })

            const lastMessageMap = new Map<string, { content: string; created_at: string }>()
            for (const msg of messages ?? []) {
                if (!lastMessageMap.has(msg.conversation_id)) {
                    lastMessageMap.set(msg.conversation_id, msg)
                }
            }

            const result: Conversation[] = (convos as any[]).map((c) => {
                const isUser1 = c.user_id_1 === user!.id
                const otherUserId = isUser1 ? c.user_id_2 : c.user_id_1
                const last = lastMessageMap.get(c.id)
                return {
                    id: c.id,
                    otherUserId,
                    otherUserName: getName(isUser1 ? c.p2 : c.p1) ?? "Unknown",
                    lastMessage: last?.content ?? null,
                    lastMessageAt: last?.created_at ?? null,
                }
            }).sort((a, b) => {
                if (!a.lastMessageAt) return 1
                if (!b.lastMessageAt) return -1
                return b.lastMessageAt.localeCompare(a.lastMessageAt)
            })

            setConversations(result)
            setLoading(false)
        }

        load()
    }, [user?.id])

    if (loading) return (
        <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )

    return (
        <div className="flex flex-col gap-1">
            {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
                conversations.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => onSelect({ conversationId: c.id, otherUserId: c.otherUserId, name: c.otherUserName })}
                        className={cn("flex items-center gap-3 text-left px-3 py-2 rounded-md hover:bg-accent w-full", activeConversationId === c.id && "bg-primary text-primary-foreground hover:bg-primary")}
                    >
                        <Avatar className="size-9 shrink-0">
                            <AvatarFallback className="text-xs">{initials(c.otherUserName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium truncate">{c.otherUserName}</span>
                                {c.lastMessageAt && (
                                    <span className={cn("text-xs shrink-0", activeConversationId === c.id ? "text-primary-foreground/60" : "text-muted-foreground")}>{formatTime(c.lastMessageAt)}</span>
                                )}
                            </div>
                            {c.lastMessage && (
                                <span className={cn("text-xs truncate block", activeConversationId === c.id ? "text-primary-foreground/60" : "text-muted-foreground")}>{c.lastMessage}</span>
                            )}
                        </div>
                    </button>
                ))
            )}
        </div>
    )
}
