import { useCallback, useEffect, useRef, useState } from "react"
import { supabase } from "~/lib/supabase/client"
import { useUser } from "~/context/user"
import { Spinner } from "~/components/ui/spinner"
import { NameAvatar } from "~/components/user/name-avatar"
import { cn } from "~/lib/utils"

const PAGE_SIZE = 15

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
    const { user, blockedUserIds } = useUser()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const cursorRef = useRef<string | null>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)

    function getName(profile: any): string | null {
        if (!profile) return null
        const p = Array.isArray(profile) ? profile[0] : profile
        return p?.name ?? null
    }

    function mapConvos(data: any[], userId: string): Conversation[] {
        return data.map((c) => {
            const isUser1 = c.user_id_1 === userId
            return {
                id: c.id,
                otherUserId: isUser1 ? c.user_id_2 : c.user_id_1,
                otherUserName: getName(isUser1 ? c.p2 : c.p1) ?? "Unknown",
                lastMessage: c.last_message ?? null,
                lastMessageAt: c.last_message_at ?? null,
            }
        })
    }

    const fetchPage = useCallback(async (cursor: string | null, userId: string, blockedSet: Set<string>) => {
        let query = supabase
            .from("conversations")
            .select("id, user_id_1, user_id_2, last_message_at, last_message, p1:profiles!user_id_1(name), p2:profiles!user_id_2(name)")
            .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
            .order("last_message_at", { ascending: false, nullsFirst: false })
            .limit(PAGE_SIZE)

        if (cursor) query = query.lt("last_message_at", cursor)

        const { data } = await query
        const rows = (data ?? []) as any[]
        const mapped = mapConvos(rows, userId).filter((c) => !blockedSet.has(c.otherUserId))
        const last = rows[rows.length - 1]
        cursorRef.current = last?.last_message_at ?? null
        return { mapped, hasMore: rows.length === PAGE_SIZE }
    }, [])

    useEffect(() => {
        if (!user?.id) return
        const blockedSet = new Set(blockedUserIds)
        fetchPage(null, user.id, blockedSet).then(({ mapped, hasMore }) => {
            setConversations(mapped)
            setHasMore(hasMore)
            setLoading(false)
        })
    }, [user?.id])

    useEffect(() => {
        if (!sentinelRef.current || !hasMore) return
        const observer = new IntersectionObserver(async (entries) => {
            if (!entries[0].isIntersecting || loadingMore || !hasMore || !user?.id) return
            setLoadingMore(true)
            const blockedSet = new Set(blockedUserIds)
            const { mapped, hasMore: more } = await fetchPage(cursorRef.current, user.id, blockedSet)
            setConversations((prev) => [...prev, ...mapped])
            setHasMore(more)
            setLoadingMore(false)
        }, { threshold: 0.1 })
        observer.observe(sentinelRef.current)
        return () => observer.disconnect()
    }, [hasMore, loadingMore, user?.id, fetchPage])

    if (loading) return (
        <div className="flex justify-center py-8">
            <Spinner className="size-5 text-muted-foreground" />
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
                        <NameAvatar name={c.otherUserName} />
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
            {hasMore && <div ref={sentinelRef} className="h-4" />}
            {loadingMore && (
                <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent" />
                </div>
            )}
        </div>
    )
}
