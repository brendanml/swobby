import { gridDisk, gridDistance } from "h3-js"
import { supabase } from "~/lib/supabase/client"

const DEFAULT_KM = 20

function kmToKRing(km: number) {
    return Math.ceil(km / 3.23)
}

type Book = {
    work_id: string
    title: string
    open_library_image: string | null
    google_image: string | null
    author_name: string | null
}

export type SwapMatch = {
    user: { id: string; name: string | null }
    distanceKm: number
    iHaveTheyWant: Book[]
    theyHaveIWant: Book[]
}

export async function findSwaps(userId: string, blockedUserIds: string[] = []): Promise<SwapMatch[]> {
    // Round 1: get my profile, listings, and wants in parallel
    const [
        { data: me },
        { data: myListings },
        { data: myWants },
    ] = await Promise.all([
        supabase.from("profiles").select("h3_r6, distance_preference").eq("id", userId).single(),
        supabase.from("listings").select("work_id, books(work_id, title, open_library_image, google_image, author_name)").eq("user_id", userId).eq("status", "available"),
        supabase.from("wants").select("work_id").eq("user_id", userId),
    ])

    if (!me?.h3_r6) return []

    const myListingIds = (myListings ?? []).map((l) => l.work_id)
    const myWantIds = new Set((myWants ?? []).map((w) => w.work_id))

    if (!myListingIds.length && !myWantIds.size) return []

    const origin = me.h3_r6
    const myCells = Array.from(gridDisk(origin, kmToKRing(me.distance_preference ?? DEFAULT_KM)))

    // Round 2: fetch nearby profiles
    const { data: nearbyProfiles } = await supabase
        .from("profiles")
        .select("id, name, h3_r6, distance_preference")
        .in("h3_r6", myCells)
        .neq("id", userId)

    if (!nearbyProfiles?.length) return []

    const blockedSet = new Set(blockedUserIds)

    // Mutual distance filter: they're in my radius AND I'm within their preference
    const candidateMap = new Map<string, { id: string; name: string | null; h3_r6: string; distance_preference: number | null }>()
    for (const p of nearbyProfiles) {
        if (!p.h3_r6 || blockedSet.has(p.id)) continue
        const distanceKm = gridDistance(origin, p.h3_r6) * 3.23
        if (distanceKm <= (p.distance_preference ?? DEFAULT_KM)) {
            candidateMap.set(p.id, p as any)
        }
    }

    if (!candidateMap.size) return []

    const nearbyIds = [...candidateMap.keys()]

    // Round 3: book overlap among nearby users only
    const [{ data: theyWantMine }, { data: theyHaveMine }] = await Promise.all([
        myListingIds.length
            ? supabase.from("wants").select("user_id, work_id").in("work_id", myListingIds).in("user_id", nearbyIds)
            : Promise.resolve({ data: [] }),
        myWantIds.size
            ? supabase.from("listings").select("user_id, work_id, books(work_id, title, open_library_image, google_image, author_name)").in("work_id", [...myWantIds]).in("user_id", nearbyIds).eq("status", "available")
            : Promise.resolve({ data: [] }),
    ])

    // Build swap results for users with at least one book match
    const myListingBooks = new Map((myListings ?? []).map((l) => [l.work_id, l.books as unknown as Book]))

    const swapMap = new Map<string, SwapMatch>()

    for (const row of (theyWantMine ?? [])) {
        const c = candidateMap.get(row.user_id)
        if (!c) continue
        if (!swapMap.has(row.user_id)) {
            swapMap.set(row.user_id, { user: { id: c.id, name: c.name }, distanceKm: gridDistance(origin, c.h3_r6) * 3.23, iHaveTheyWant: [], theyHaveIWant: [] })
        }
        const book = myListingBooks.get(row.work_id)
        if (book) swapMap.get(row.user_id)!.iHaveTheyWant.push(book)
    }

    for (const row of (theyHaveMine ?? [])) {
        if (!myWantIds.has(row.work_id)) continue
        const c = candidateMap.get(row.user_id)
        if (!c) continue
        if (!swapMap.has(row.user_id)) {
            swapMap.set(row.user_id, { user: { id: c.id, name: c.name }, distanceKm: gridDistance(origin, c.h3_r6) * 3.23, iHaveTheyWant: [], theyHaveIWant: [] })
        }
        const book = row.books as unknown as Book
        if (book) swapMap.get(row.user_id)!.theyHaveIWant.push(book)
    }

    return [...swapMap.values()]
        .filter((s) => s.iHaveTheyWant.length || s.theyHaveIWant.length)
        .sort((a, b) => (b.iHaveTheyWant.length + b.theyHaveIWant.length) - (a.iHaveTheyWant.length + a.theyHaveIWant.length))
}
