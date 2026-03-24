import { supabase } from "~/lib/supabase/client"

export async function findOrCreateConversation(myId: string, theirId: string): Promise<string> {
    const [user_id_1, user_id_2] = [myId, theirId].sort()

    const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id_1", user_id_1)
        .eq("user_id_2", user_id_2)
        .maybeSingle()

    if (existing) return existing.id

    const { data: created } = await supabase
        .from("conversations")
        .insert({ user_id_1, user_id_2 })
        .select("id")
        .single()

    return created!.id
}
