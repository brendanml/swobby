import type { SupabaseClient } from "@supabase/supabase-js"
import { supabase } from "~/lib/supabase/client"
import { findOrCreateConversation } from "./messages"

export async function createOffer({
    myId,
    theirId,
    myListingIds,
    theirListingIds,
    message,
}: {
    myId: string
    theirId: string
    myListingIds: string[]
    theirListingIds: string[]
    message: string
}) {
    const conversationId = await findOrCreateConversation(myId, theirId)

    const { data: offer, error: offerError } = await supabase
        .from("offers")
        .insert({ conversation_id: conversationId, proposer_id: myId, recipient_id: theirId })
        .select("id")
        .single()

    if (offerError || !offer) throw offerError

    const items = [
        ...myListingIds.map((listing_id) => ({ offer_id: offer.id, listing_id, side: "proposer" })),
        ...theirListingIds.map((listing_id) => ({ offer_id: offer.id, listing_id, side: "recipient" })),
    ]

    const { error: itemsError } = await supabase.from("offer_items").insert(items)
    if (itemsError) throw itemsError

    const { data: msg, error: msgError } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: myId, content: message, offer_id: offer.id })
        .select("id, created_at")
        .single()

    if (msgError || !msg) throw msgError

    const { data: fullMsg } = await supabase
        .from("messages")
        .select(`id, content, sender_id, offer_id, created_at,
            profiles(name),
            offers(id, conversation_id, proposer_id, recipient_id, status,
                offer_items(side, listings(id, books(title, cover_url, author_name)))
            )`)
        .eq("id", msg.id)
        .single()

    if (fullMsg) {
        await supabase.channel(`conversation:${conversationId}`).send({
            type: "broadcast",
            event: "message",
            payload: mapMessage(fullMsg),
        })
    }

    return { conversationId, offerId: offer.id }
}

function mapMessage(row: any) {
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

export type OfferSummary = {
    id: string
    status: string
    created_at: string
    proposer_id: string
    recipient_id: string
    proposer: { name: string | null } | null
    recipient: { name: string | null } | null
    offer_items: Array<{
        side: "proposer" | "recipient"
        listings: { id: string; books: { title: string; cover_url: string | null } | null } | null
    }>
}

export async function getOffersByUser(supabase: SupabaseClient, userId: string): Promise<OfferSummary[]> {
    const { data } = await supabase
        .from("offers")
        .select(`
            id, status, created_at, proposer_id, recipient_id,
            proposer:profiles!offers_proposer_id_fkey(name),
            recipient:profiles!offers_recipient_id_fkey(name),
            offer_items(side, listings(id, books(title, cover_url)))
        `)
        .or(`proposer_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: false })

    return (data as unknown as OfferSummary[]) ?? []
}

export async function updateOfferStatus(supabase: SupabaseClient, offerId: string, status: string) {
    return supabase.from("offers").update({ status }).eq("id", offerId)
}

export type OfferDetail = {
    id: string
    status: string
    created_at: string
    proposer_id: string
    recipient_id: string
    proposer: { name: string | null } | null
    recipient: { name: string | null } | null
    offer_items: Array<{
        side: "proposer" | "recipient"
        listings: {
            id: string
            books: { title: string; cover_url: string | null; author_name: string | null } | null
        } | null
    }>
}

export async function getOfferById(supabase: SupabaseClient, offerId: string): Promise<OfferDetail | null> {
    const { data } = await supabase
        .from("offers")
        .select(`
            id, status, created_at, proposer_id, recipient_id,
            proposer:profiles!offers_proposer_id_fkey(name),
            recipient:profiles!offers_recipient_id_fkey(name),
            offer_items(side, listings(id, books(title, cover_url, author_name)))
        `)
        .eq("id", offerId)
        .maybeSingle()

    return data as unknown as OfferDetail | null
}
