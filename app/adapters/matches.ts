import { latLngToCell, gridDisk, gridDistance } from "h3-js"
import { supabase } from "~/lib/supabase/client"

const H3_RESOLUTION = 7
const DEFAULT_KM = 20
const DEFAULT_K_RING = Math.ceil(DEFAULT_KM / 1.22)

export function latLngToH3(lat: number, lng: number): string {
    return latLngToCell(lat, lng, H3_RESOLUTION)
}

export type NearbyBook = {
    listingId: string
    work_id: string
    title: string
    cover_url: string | null
    author_name: string | null
    userId: string
    userName: string | null
    distanceKm: number
}

export async function findNearbyBooks(userId: string): Promise<NearbyBook[]> {
    const nearby = await findNearby(userId)
    if (!nearby.length) return []

    const distanceMap = new Map(nearby.map((u) => [u.id, u.distanceKm]))
    const nameMap = new Map(nearby.map((u) => [u.id, u.name]))
    const nearbyIds = nearby.map((u) => u.id)
    const { data } = await supabase
        .from("listings")
        .select("id, user_id, books(work_id, title, cover_url, author_name)")
        .in("user_id", nearbyIds)

    return (data ?? []).flatMap((row: any) => {
        const book = row.books
        if (!book) return []
        return [{ listingId: row.id, work_id: book.work_id, title: book.title, cover_url: book.cover_url, author_name: book.author_name, userId: row.user_id, userName: nameMap.get(row.user_id) ?? null, distanceKm: distanceMap.get(row.user_id) ?? 0 }]
    })
}

export async function findNearby(userId: string) {
    const { data: me } = await supabase
        .from("profiles")
        .select("h3_index")
        .eq("id", userId)
        .single()

    if (!me?.h3_index) return []

    const origin = me.h3_index
    const myCells = new Set(gridDisk(origin, DEFAULT_K_RING))

    const { data: candidates } = await supabase
        .from("profiles")
        .select("id, name, lat, lng, h3_index")
        .neq("id", userId)

    if (!candidates) return []

    return candidates
        .filter((c) => {
            if (!c.h3_index) return false
            if (!myCells.has(c.h3_index)) return false
            const theirCells = gridDisk(c.h3_index, DEFAULT_K_RING)
            return theirCells.includes(origin)
        })
        .map((c) => ({ ...c, distanceKm: Math.max(1, gridDistance(origin, c.h3_index!) * 1.22) }))
}
