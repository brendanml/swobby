import { gridDisk, gridDistance } from "h3-js"
import { supabase } from "~/lib/supabase/client"

const DEFAULT_K_RING = Math.ceil(20 / 1.22)

type Book = {
    work_id: string
    title: string
    cover_url: string | null
    author_name: string | null
}

export type SwapMatch = {
    user: { id: string; name: string | null }
    distanceKm: number
    iHaveTheyWant: Book[]
    theyHaveIWant: Book[]
}

export async function findSwaps(userId: string): Promise<SwapMatch[]> {
    // Round 1: get my profile, listings, and wants in parallel
    const [
        { data: me },
        { data: myListings },
        { data: myWants },
    ] = await Promise.all([
        supabase.from("profiles").select("lat, lng, h3_index").eq("id", userId).single(),
        supabase.from("listings").select("work_id, books(work_id, title, cover_url, author_name)").eq("user_id", userId),
        supabase.from("wants").select("work_id").eq("user_id", userId),
    ])

    if (!me?.h3_index) return []

    const myListingIds = (myListings ?? []).map((l) => l.work_id)
    const myWantIds = new Set((myWants ?? []).map((w) => w.work_id))

    if (!myListingIds.length && !myWantIds.size) return []

    // Round 2: find users with book overlap, include their location info
    const [{ data: theyWantMine }, { data: theyHaveMine }] = await Promise.all([
        myListingIds.length
            ? supabase.from("wants").select("user_id, work_id, profiles(id, name, h3_index)").in("work_id", myListingIds).neq("user_id", userId)
            : Promise.resolve({ data: [] }),
        myWantIds.size
            ? supabase.from("listings").select("user_id, work_id, books(work_id, title, cover_url, author_name), profiles(id, name, h3_index)").in("work_id", [...myWantIds]).neq("user_id", userId)
            : Promise.resolve({ data: [] }),
    ])

    // Collect all candidate users with their profile
    const candidateMap = new Map<string, { id: string; name: string | null; h3_index: string }>()
    for (const row of [...(theyWantMine ?? []), ...(theyHaveMine ?? [])]) {
        const p = row.profiles as any
        if (p?.h3_index && !candidateMap.has(p.id)) {
            candidateMap.set(p.id, p)
        }
    }

    // Mutual distance filter
    const origin = me.h3_index
    const myCells = new Set(gridDisk(origin, DEFAULT_K_RING))

    const mutualIds = new Set(
        [...candidateMap.values()].filter((c) => {
            if (!myCells.has(c.h3_index)) return false
            const theirCells = gridDisk(c.h3_index, DEFAULT_K_RING)
            return theirCells.includes(origin)
        }).map((c) => c.id)
    )

    if (!mutualIds.size) return []

    // Build swap results
    const myListingBooks = new Map((myListings ?? []).map((l) => [l.work_id, l.books as unknown as Book]))

    const swapMap = new Map<string, SwapMatch>()
    for (const id of mutualIds) {
        const c = candidateMap.get(id)!
        swapMap.set(id, { user: { id, name: c.name }, distanceKm: gridDistance(origin, c.h3_index) * 1.22, iHaveTheyWant: [], theyHaveIWant: [] })
    }

    for (const row of (theyWantMine ?? [])) {
        if (!mutualIds.has(row.user_id)) continue
        const book = myListingBooks.get(row.work_id)
        if (book) swapMap.get(row.user_id)!.iHaveTheyWant.push(book)
    }

    for (const row of (theyHaveMine ?? [])) {
        if (!mutualIds.has(row.user_id)) continue
        if (!myWantIds.has(row.work_id)) continue
        const book = row.books as unknown as Book
        if (book) swapMap.get(row.user_id)!.theyHaveIWant.push(book)
    }

    return [...swapMap.values()]
        .filter((s) => s.iHaveTheyWant.length || s.theyHaveIWant.length)
        .sort((a, b) => (b.iHaveTheyWant.length + b.theyHaveIWant.length) - (a.iHaveTheyWant.length + a.theyHaveIWant.length))
}
