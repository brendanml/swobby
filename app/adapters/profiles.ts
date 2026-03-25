import type { SupabaseClient } from "@supabase/supabase-js"

export type Profile = {
    name: string | null
    lat: number | null
    lng: number | null
    distance_preference: number | null
    onboarding_complete: boolean
    genres: string[]
}

export async function getProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
    const { data } = await supabase
        .from("profiles")
        .select("name, lat, lng, distance_preference, onboarding_complete, genres")
        .eq("id", userId)
        .maybeSingle()
    return data
}

export async function getProfileName(supabase: SupabaseClient, userId: string): Promise<string | null> {
    const { data } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .single()
    return data?.name ?? null
}

export async function updateProfile(supabase: SupabaseClient, userId: string, data: {
    name?: string | null
    lat?: number | null
    lng?: number | null
    h3_index?: string | null
    distance_preference?: number | null
    genres?: string[]
    onboarding_complete?: boolean
}) {
    return supabase.from("profiles").update(data).eq("id", userId)
}
