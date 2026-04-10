import type { SupabaseClient } from "@supabase/supabase-js"

export type ExchangeSummary = {
    id: string
    status: string
    created_at: string
    otherUserName: string | null
    books: Array<{ title: string; open_library_image: string | null; google_image: string | null }>
}

export async function getExchangesByUser(supabase: SupabaseClient, userId: string): Promise<ExchangeSummary[]> {
    const { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)

    const convoIds = (convos ?? []).map((c) => c.id)
    if (convoIds.length === 0) return []

    const { data } = await supabase
        .from("exchanges")
        .select(`id, status, created_at, accepted_offer_id, initiator_id,
            offers!offers_exchange_id_fkey(id, proposer_id,
                proposer:profiles!offers_proposer_id_fkey(name),
                offer_items(side, listings(id, books(title, open_library_image, google_image))))`)
        .in("conversation_id", convoIds)
        .order("created_at", { ascending: false })

    return (data ?? []).map((ex: any) => {
        const offers = (ex.offers ?? []) as any[]
        const displayOffer = offers.find((o: any) => o.id === ex.accepted_offer_id) ?? offers[0]
        const books = (displayOffer?.offer_items ?? [])
            .map((item: any) => item.listings.books)
            .filter(Boolean)
        const otherUserName =
            offers.find((o: any) => o.proposer_id !== userId)?.proposer?.name ?? null
        return { id: ex.id, status: ex.status, created_at: ex.created_at, otherUserName, books }
    })
}

export type Exchange = {
    id: string
    status: string
    accepted_offer_id: string | null
    initiator_id: string
    conversation_id: string
    created_at: string
}

export type OfferItem = {
    side: "proposer" | "recipient"
    listings: {
        id: string
        books: { title: string; open_library_image: string | null; google_image: string | null; author_name: string | null } | null
    }
}

export type Offer = {
    id: string
    proposer_id: string
    created_at: string
    proposer: { name: string | null } | null
    offer_items: OfferItem[]
}

export async function getExchangeWithOffers(supabase: SupabaseClient, exchangeId: string): Promise<{ exchange: Exchange | null; offers: Offer[] }> {
    const [{ data: exchange }, { data: offersData }] = await Promise.all([
        supabase
            .from("exchanges")
            .select("id, status, accepted_offer_id, initiator_id, conversation_id, created_at")
            .eq("id", exchangeId)
            .single(),
        supabase
            .from("offers")
            .select(`id, proposer_id, created_at,
                proposer:profiles!offers_proposer_id_fkey(name),
                offer_items(side, listings(id, books(title, open_library_image, google_image, author_name)))`)
            .eq("exchange_id", exchangeId)
            .order("created_at", { ascending: true }),
    ])
    return { exchange: exchange ?? null, offers: (offersData as unknown as Offer[]) ?? [] }
}

export async function acceptExchange(supabase: SupabaseClient, exchangeId: string, offerId: string) {
    return supabase
        .from("exchanges")
        .update({ status: "completed", accepted_offer_id: offerId })
        .eq("id", exchangeId)
}

export async function declineExchange(supabase: SupabaseClient, exchangeId: string) {
    return supabase
        .from("exchanges")
        .update({ status: "cancelled" })
        .eq("id", exchangeId)
}
