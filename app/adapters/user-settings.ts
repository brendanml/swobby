import type { SupabaseClient } from "@supabase/supabase-js"

export type UserSettings = {
    formatted_address: string | null
}

export async function getUserSettings(supabase: SupabaseClient, userId: string): Promise<UserSettings | null> {
    const { data } = await supabase
        .from("user_settings")
        .select("formatted_address")
        .eq("user_id", userId)
        .maybeSingle()
    return data
}

export async function upsertUserSettings(supabase: SupabaseClient, userId: string, settings: Partial<UserSettings>) {
    return supabase
        .from("user_settings")
        .upsert({ user_id: userId, ...settings }, { onConflict: "user_id" })
}

export async function getBlockedUserIds(supabase: SupabaseClient, userId: string): Promise<string[]> {
    const { data } = await supabase
        .from("blocked_users")
        .select("blocked_user_id")
        .eq("user_id", userId)
    return (data ?? []).map((r) => r.blocked_user_id)
}

export async function blockUser(supabase: SupabaseClient, userId: string, blockedUserId: string) {
    return supabase
        .from("blocked_users")
        .insert({ user_id: userId, blocked_user_id: blockedUserId })
}

export async function unblockUser(supabase: SupabaseClient, userId: string, blockedUserId: string) {
    return supabase
        .from("blocked_users")
        .delete()
        .eq("user_id", userId)
        .eq("blocked_user_id", blockedUserId)
}
