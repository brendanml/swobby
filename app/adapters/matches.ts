import { latLngToCell, gridDisk, gridDistance } from "h3-js"
import { supabase } from "~/lib/supabase/client"

const H3_RESOLUTION = 6
const DEFAULT_KM = 20

function kmToKRing(km: number) {
    return Math.ceil(km / 3.23)
}

export function latLngToH3(lat: number, lng: number): string {
    return latLngToCell(lat, lng, H3_RESOLUTION)
}

export type NearbyBook = {
    listingId: string
    work_id: string
    title: string
    open_library_image: string | null
    google_image: string | null
    author_name: string | null
    userId: string
    userName: string | null
    distanceKm: number
}

export async function findNearbyBooks(userId: string, blockedUserIds: string[] = []): Promise<NearbyBook[]> {
    const nearby = await findNearby(userId)
    if (!nearby.length) return []

    const blockedSet = new Set(blockedUserIds)
    const filtered = nearby.filter((u) => !blockedSet.has(u.id))
    const distanceMap = new Map(filtered.map((u) => [u.id, u.distanceKm]))
    const nameMap = new Map(filtered.map((u) => [u.id, u.name]))
    const nearbyIds = filtered.map((u) => u.id)
    const { data } = await supabase
        .from("listings")
        .select("id, user_id, books(work_id, title, open_library_image, google_image, author_name)")
        .in("user_id", nearbyIds)
        .neq("status", "sold")

    return (data ?? []).flatMap((row: any) => {
        const book = row.books
        if (!book) return []
        return [{ listingId: row.id, work_id: book.work_id, title: book.title, open_library_image: book.open_library_image, google_image: book.google_image, author_name: book.author_name, userId: row.user_id, userName: nameMap.get(row.user_id) ?? null, distanceKm: distanceMap.get(row.user_id) ?? 0 }]
    })
}

export async function findNearbyBooksForGuest(lat: number, lng: number, blockedUserIds: string[] = []): Promise<NearbyBook[]> {
    const origin = latLngToH3(lat, lng)
    const myCells = Array.from(gridDisk(origin, kmToKRing(DEFAULT_KM)))
    const blockedSet = new Set(blockedUserIds)

    const { data: candidates } = await supabase
        .from("profiles")
        .select("id, name, lat, lng, h3_r6, distance_preference")
        .in("h3_r6", myCells)

    if (!candidates) return []

    const nearby = candidates
        .filter((c) => {
            if (!c.h3_r6 || blockedSet.has(c.id)) return false
            const distanceKm = gridDistance(origin, c.h3_r6) * 3.23
            return distanceKm <= (c.distance_preference ?? DEFAULT_KM)
        })
        .map((c) => ({ ...c, distanceKm: Math.max(1, gridDistance(origin, c.h3_r6!) * 3.23) }))

    if (!nearby.length) return []

    const distanceMap = new Map(nearby.map((u) => [u.id, u.distanceKm]))
    const nameMap = new Map(nearby.map((u) => [u.id, u.name]))
    const nearbyIds = nearby.map((u) => u.id)

    const { data } = await supabase
        .from("listings")
        .select("id, user_id, books(work_id, title, open_library_image, google_image, author_name)")
        .in("user_id", nearbyIds)
        .neq("status", "sold")

    return (data ?? []).flatMap((row: any) => {
        const book = row.books
        if (!book) return []
        return [{ listingId: row.id, work_id: book.work_id, title: book.title, open_library_image: book.open_library_image, google_image: book.google_image, author_name: book.author_name, userId: row.user_id, userName: nameMap.get(row.user_id) ?? null, distanceKm: distanceMap.get(row.user_id) ?? 0 }]
    })
}

export async function findNearby(userId: string) {
    const { data: me } = await supabase
        .from("profiles")
        .select("h3_r6, distance_preference")
        .eq("id", userId)
        .single()

    if (!me?.h3_r6) return []

    const origin = me.h3_r6
    const myKRing = kmToKRing(me.distance_preference ?? DEFAULT_KM)
    const myCells = Array.from(gridDisk(origin, myKRing))

    const { data: candidates } = await supabase
        .from("profiles")
        .select("id, name, lat, lng, h3_r6, distance_preference")
        .in("h3_r6", myCells)
        .neq("id", userId)

    if (!candidates) return []

    return candidates
        .filter((c) => {
            if (!c.h3_r6) return false
            const distanceKm = gridDistance(origin, c.h3_r6) * 3.23
            return distanceKm <= (c.distance_preference ?? DEFAULT_KM)
        })
        .map((c) => ({ ...c, distanceKm: Math.max(1, gridDistance(origin, c.h3_r6!) * 3.23) }))
}
