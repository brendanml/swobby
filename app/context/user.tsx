import { useState, useEffect, createContext, useContext } from "react"
import { supabase } from "~/lib/supabase/client"
import { useAuth } from "~/context/auth"
import { getUserSettings, getBlockedUserIds, type UserSettings } from "~/adapters/user-settings"

export type UserProfile = {
    id: string
    email: string | null
    name: string | null
    lat: number | null
    lng: number | null
    distance_preference: number | null
    onboarding_complete: boolean
    genres: string[]
}

type UserContextType = {
    user: UserProfile | null
    settings: UserSettings | null
    blockedUserIds: string[]
    loading: boolean
    refresh: () => void
}

const UserContext = createContext<UserContextType>(null!)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { session, loading: authLoading } = useAuth()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [settings, setSettings] = useState<UserSettings | null>(null)
    const [blockedUserIds, setBlockedUserIds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchAll(userId: string, email: string | null) {
        const [profileResult, settingsResult, blockedResult] = await Promise.all([
            supabase.from("profiles").select("name, lat, lng, distance_preference, onboarding_complete, genres").eq("id", userId).maybeSingle(),
            getUserSettings(supabase, userId),
            getBlockedUserIds(supabase, userId),
        ])

        setUser({
            id: userId,
            email,
            name: profileResult.data?.name ?? null,
            lat: profileResult.data?.lat ?? null,
            lng: profileResult.data?.lng ?? null,
            distance_preference: profileResult.data?.distance_preference ?? null,
            onboarding_complete: profileResult.data?.onboarding_complete ?? false,
            genres: profileResult.data?.genres ?? [],
        })
        setSettings(settingsResult)
        setBlockedUserIds(blockedResult)
        setLoading(false)
    }

    useEffect(() => {
        if (authLoading) return
        if (!session?.user) {
            setUser(null)
            setSettings(null)
            setBlockedUserIds([])
            setLoading(false)
            return
        }
        fetchAll(session.user.id, session.user.email ?? null)
    }, [session?.user?.id, authLoading])

    function refresh() {
        if (session?.user) {
            return fetchAll(session.user.id, session.user.email ?? null)
        }
    }

    return (
        <UserContext.Provider value={{ user, settings, blockedUserIds, loading, refresh }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) throw new Error("useUser must be used within UserProvider")
    return context
}
