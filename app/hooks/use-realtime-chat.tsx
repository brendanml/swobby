import { useCallback, useEffect, useRef, useState } from "react"
import { supabase } from "~/lib/supabase/client"

interface UseRealtimeChatProps {
    conversationId: string
    currentUserId: string
    senderName: string
}

type OfferItem = {
    side: "proposer" | "recipient"
    listings: {
        id: string
        books: { title: string; open_library_image: string | null; google_image: string | null; author_name: string | null } | null
    }
}

export type OfferData = {
    id: string
    conversation_id: string
    proposer_id: string
    recipient_id: string
    status: string
    offer_items: OfferItem[]
}

export interface ChatMessage {
    id: string
    content: string | null
    sender_id: string
    sender_name: string
    created_at: string
    offer_id: string | null
    offer?: OfferData | null
}

const PAGE_SIZE = 20

const MESSAGE_SELECT = `
    id, content, sender_id, offer_id, created_at,
    profiles(name),
    offers(id, conversation_id, proposer_id, recipient_id, status,
        offer_items(side, listings(id, books(title, open_library_image, google_image, author_name)))
    )`

function mapMessage(row: any): ChatMessage {
    return {
        id: row.id,
        content: row.content,
        sender_id: row.sender_id,
        sender_name: row.profiles?.name ?? "Unknown",
        created_at: row.created_at,
        offer_id: row.offer_id ?? null,
        offer: row.offers ?? null,
    }
}

export function useRealtimeChat({ conversationId, currentUserId, senderName }: UseRealtimeChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const oldestTimestamp = useRef<string | null>(null)

    useEffect(() => {
        setMessages([])
        setLoading(true)
        setHasMore(false)
        oldestTimestamp.current = null

        supabase
            .from("messages")
            .select(MESSAGE_SELECT)
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .limit(PAGE_SIZE)
            .then(({ data, error }) => {
                if (error) console.error("messages fetch error:", error)
                const page = (data ?? []).map(mapMessage).reverse()
                setMessages(page)
                setHasMore((data ?? []).length === PAGE_SIZE)
                oldestTimestamp.current = page[0]?.created_at ?? null
                setLoading(false)
            })
    }, [conversationId])

    useEffect(() => {
        const channel = supabase.channel(`conversation:${conversationId}`)
        channel
            .on("broadcast", { event: "message" }, (payload) => {
                setMessages((current) => [...current, payload.payload as ChatMessage])
            })
            .subscribe((status) => setIsConnected(status === "SUBSCRIBED"))

        return () => { supabase.removeChannel(channel) }
    }, [conversationId])

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || !oldestTimestamp.current) return
        setLoadingMore(true)
        const { data, error } = await supabase
            .from("messages")
            .select(MESSAGE_SELECT)
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .lt("created_at", oldestTimestamp.current)
            .limit(PAGE_SIZE)
        if (error) console.error("loadMore error:", error)
        const page = (data ?? []).map(mapMessage).reverse()
        if (page.length > 0) {
            oldestTimestamp.current = page[0].created_at
            setMessages((current) => [...page, ...current])
        }
        setHasMore((data ?? []).length === PAGE_SIZE)
        setLoadingMore(false)
    }, [conversationId, hasMore, loadingMore])

    const sendMessage = useCallback(async (content: string) => {
        const { data } = await supabase
            .from("messages")
            .insert({ conversation_id: conversationId, sender_id: currentUserId, content })
            .select("id, created_at")
            .single()

        if (!data) return

        const message: ChatMessage = {
            id: data.id,
            content,
            sender_id: currentUserId,
            sender_name: senderName,
            created_at: data.created_at,
            offer_id: null,
        }

        setMessages((current) => [...current, message])

        await supabase.channel(`conversation:${conversationId}`).send({
            type: "broadcast",
            event: "message",
            payload: message,
        })
    }, [conversationId, currentUserId, senderName])

    function updateOfferStatus(offerId: string, status: string) {
        setMessages((prev) => prev.map((m) => {
            if (m.offer?.id !== offerId) return m
            return { ...m, offer: { ...m.offer!, status } }
        }))
    }

    return { messages, loading, loadingMore, hasMore, loadMore, sendMessage, isConnected, updateOfferStatus }
}
