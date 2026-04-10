import type { SupabaseClient } from "@supabase/supabase-js"
import { gridDistance } from "h3-js"
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

    // Resolve work_id for each listing up front
    const allListingIds = [...myListingIds, ...theirListingIds]
    const { data: listingRows } = await supabase
        .from("listings")
        .select("id, books(work_id)")
        .in("id", allListingIds)

    const workIdMap: Record<string, string | null> = Object.fromEntries(
        (listingRows ?? []).map((l: any) => [l.id, l.books?.work_id ?? null]),
    )

    const items = [
        ...myListingIds.map((listing_id) => ({
            offer_id: offer.id,
            listing_id,
            side: "proposer",
            work_id: workIdMap[listing_id] ?? null,
        })),
        ...theirListingIds.map((listing_id) => ({
            offer_id: offer.id,
            listing_id,
            side: "recipient",
            work_id: workIdMap[listing_id] ?? null,
        })),
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
                offer_items(side, work_id, books:books!offer_items_work_id_fkey(title, open_library_image, google_image, author_name), listings(id))
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
        work_id: string | null
        books: { title: string; open_library_image: string | null; google_image: string | null } | null
        listings: { id: string } | null
    }>
}

export async function getOffersByUser(supabase: SupabaseClient, userId: string): Promise<OfferSummary[]> {
    const { data } = await supabase
        .from("offers")
        .select(`
            id, status, created_at, proposer_id, recipient_id,
            proposer:profiles!offers_proposer_id_fkey(name),
            recipient:profiles!offers_recipient_id_fkey(name),
            offer_items(side, work_id, books:books!offer_items_work_id_fkey(title, open_library_image, google_image), listings(id))
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
    distanceKm: number | null
    offer_items: Array<{
        side: "proposer" | "recipient"
        work_id: string | null
        books: { work_id: string; title: string; open_library_image: string | null; google_image: string | null; author_name: string | null } | null
        listings: { id: string } | null
    }>
}

export async function getOfferById(supabase: SupabaseClient, offerId: string): Promise<OfferDetail | null> {
    const { data } = await supabase
        .from("offers")
        .select(`
            id, status, created_at, proposer_id, recipient_id,
            proposer:profiles!offers_proposer_id_fkey(name, h3_index),
            recipient:profiles!offers_recipient_id_fkey(name, h3_index),
            offer_items(side, work_id, books:books!offer_items_work_id_fkey(work_id, title, open_library_image, google_image, author_name), listings(id))
        `)
        .eq("id", offerId)
        .maybeSingle()

    if (!data) return null

    const d = data as any
    let distanceKm: number | null = null
    if (d.proposer?.h3_index && d.recipient?.h3_index) {
        distanceKm = Math.max(1, gridDistance(d.proposer.h3_index, d.recipient.h3_index) * 1.22)
    }

    return {
        ...(d as any),
        proposer: d.proposer ? { name: d.proposer.name ?? null } : null,
        recipient: d.recipient ? { name: d.recipient.name ?? null } : null,
        distanceKm,
    } as OfferDetail
}
