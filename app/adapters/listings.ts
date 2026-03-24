import type { SupabaseClient } from "@supabase/supabase-js"

type BookData = {
    work_id: string
    title: string
    cover_url?: string | null
    author_name?: string | null
    first_publish_year?: number | string | null
}

export async function upsertBook(supabase: SupabaseClient, book: BookData) {
    return supabase.from("books").upsert({
        work_id: book.work_id,
        title: book.title,
        cover_url: book.cover_url ?? null,
        author_name: book.author_name ?? null,
        first_publish_year: book.first_publish_year ?? null,
    }, { onConflict: "work_id" })
}

export async function createListing(supabase: SupabaseClient, { userId, workId, condition, description }: {
    userId: string
    workId: string
    condition: string
    description?: string | null
}) {
    return supabase.from("listings").insert({ work_id: workId, user_id: userId, condition, description })
}

export async function createWant(supabase: SupabaseClient, { userId, workId, condition }: {
    userId: string
    workId: string
    condition: string
}) {
    return supabase.from("wants").insert({ user_id: userId, work_id: workId, condition })
}

export type Listing = {
    id: string
    condition: string
    description: string | null
    books: {
        work_id: string
        title: string
        author_name: string | null
        cover_url: string | null
    } | null
}

export async function getListingsByUser(supabase: SupabaseClient, userId: string): Promise<Listing[]> {
    const { data } = await supabase
        .from("listings")
        .select("id, condition, description, books(work_id, title, author_name, cover_url)")
        .eq("user_id", userId)
    return (data as unknown as Listing[]) ?? []
}

export type Want = {
    id: string
    condition: string
    books: {
        title: string
        author_name: string | null
        cover_url: string | null
    } | null
}

export async function getWantsByUser(supabase: SupabaseClient, userId: string): Promise<Want[]> {
    const { data } = await supabase
        .from("wants")
        .select("id, condition, books(title, author_name, cover_url)")
        .eq("user_id", userId)
    return (data as unknown as Want[]) ?? []
}

export type ListingDetail = {
    id: string
    condition: string
    description: string | null
    user_id: string
    user: { name: string | null; h3_index: string | null } | null
    books: { work_id: string; title: string; author_name: string | null; cover_url: string | null } | null
}

export async function getListingDetail(supabase: SupabaseClient, id: string): Promise<ListingDetail | null> {
    const { data } = await supabase
        .from("listings")
        .select("id, condition, description, user_id, books(work_id, title, author_name, cover_url), profiles!user_id(name, h3_index)")
        .eq("id", id)
        .single()
    if (!data) return null
    const raw = data as any
    const p = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles
    return { ...raw, user: p ?? null }
}

export async function getListingById(supabase: SupabaseClient, id: string): Promise<Listing | null> {
    const { data } = await supabase
        .from("listings")
        .select("id, condition, description, books(work_id, title, author_name, cover_url)")
        .eq("id", id)
        .single()
    return (data as unknown as Listing) ?? null
}

export async function updateListing(supabase: SupabaseClient, id: string, { condition, description }: {
    condition: string
    description?: string | null
}) {
    return supabase.from("listings").update({ condition, description }).eq("id", id)
}

export async function getWantById(supabase: SupabaseClient, id: string): Promise<Want | null> {
    const { data } = await supabase
        .from("wants")
        .select("id, condition, books(title, author_name, cover_url)")
        .eq("id", id)
        .single()
    return (data as unknown as Want) ?? null
}

export async function updateWant(supabase: SupabaseClient, id: string, { condition }: { condition: string }) {
    return supabase.from("wants").update({ condition }).eq("id", id)
}

export async function deleteListing(supabase: SupabaseClient, id: string) {
    return supabase.from("listings").delete().eq("id", id)
}

export async function deleteWant(supabase: SupabaseClient, id: string) {
    return supabase.from("wants").delete().eq("id", id)
}
