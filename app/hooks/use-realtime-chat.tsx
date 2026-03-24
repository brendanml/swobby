import { useCallback, useEffect, useState } from "react"
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
        books: { title: string; cover_url: string | null; author_name: string | null } | null
    } | null
}

export type OfferData = {
    id: string
    exchange_id: string
    proposer_id: string
    exchanges: { id: string; initiator_id: string; status: string; accepted_offer_id: string | null }
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

const MESSAGE_SELECT = `
    id, content, sender_id, offer_id, created_at,
    profiles(name),
    offers(id, exchange_id, proposer_id,
        exchanges!offers_exchange_id_fkey(id, initiator_id, status, accepted_offer_id),
        offer_items(side, listings(id, books(title, cover_url, author_name)))
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
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        supabase
            .from("messages")
            .select(MESSAGE_SELECT)
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true })
            .then(({ data, error }) => {
                if (error) console.error("messages fetch error:", error)
                setMessages((data ?? []).map(mapMessage))
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

    function updateExchangeStatus(exchangeId: string, status: string, acceptedOfferId?: string) {
        setMessages((prev) => prev.map((m) => {
            if (m.offer?.exchange_id !== exchangeId) return m
            return {
                ...m,
                offer: {
                    ...m.offer!,
                    exchanges: { ...m.offer!.exchanges, status, accepted_offer_id: acceptedOfferId ?? null },
                },
            }
        }))
    }

    return { messages, loading, sendMessage, isConnected, updateExchangeStatus }
}
