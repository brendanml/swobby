import { supabase } from "~/lib/supabase/client"
import { findOrCreateConversation } from "./messages"

export async function createOffer({
    myId,
    theirId,
    myListingIds,
    theirListingIds,
    message,
    existingExchangeId,
}: {
    myId: string
    theirId: string
    myListingIds: string[]
    theirListingIds: string[]
    message: string
    existingExchangeId?: string | null
}) {
    const conversationId = await findOrCreateConversation(myId, theirId)

    let exchangeId: string
    if (existingExchangeId) {
        exchangeId = existingExchangeId
    } else {
        const { data: exchange, error: exchangeError } = await supabase
            .from("exchanges")
            .insert({ conversation_id: conversationId, initiator_id: myId })
            .select("id")
            .single()
        if (exchangeError || !exchange) throw exchangeError
        exchangeId = exchange.id
    }
    const exchange = { id: exchangeId }

    const { data: offer, error: offerError } = await supabase
        .from("offers")
        .insert({ exchange_id: exchange.id, proposer_id: myId })
        .select("id")
        .single()

    if (offerError || !offer) throw offerError

    const items = [
        ...myListingIds.map((listing_id) => ({ offer_id: offer.id, listing_id, side: "proposer" })),
        ...theirListingIds.map((listing_id) => ({ offer_id: offer.id, listing_id, side: "recipient" })),
    ]

    const { error: itemsError } = await supabase.from("offer_items").insert(items)
    if (itemsError) throw itemsError

    // Insert message linked to this offer
    const { data: msg, error: msgError } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: myId, content: message, offer_id: offer.id })
        .select("id, created_at")
        .single()

    if (msgError || !msg) throw msgError

    // Broadcast full message with offer data for realtime recipient
    const { data: fullMsg } = await supabase
        .from("messages")
        .select(`id, content, sender_id, offer_id, created_at,
            profiles(name),
            offers(id, exchange_id, proposer_id,
                exchanges!offers_exchange_id_fkey(id, initiator_id, status, accepted_offer_id),
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

    return { conversationId, exchangeId: exchange.id, offerId: offer.id }
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
