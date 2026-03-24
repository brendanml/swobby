import { useState, useEffect, createContext, useContext } from "react"
import { supabase } from "~/lib/supabase/client"
import { useAuth } from "~/context/auth"

export type UserProfile = {
    id: string
    email: string | null
    name: string | null
    lat: number | null
    lng: number | null
    distance_preference: number | null
}

type UserContextType = {
    user: UserProfile | null
    loading: boolean
    refresh: () => void
}

const UserContext = createContext<UserContextType>(null!)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    async function fetchProfile(userId: string, email: string | null) {
        const { data } = await supabase
            .from("profiles")
            .select("name, lat, lng, distance_preference")
            .eq("id", userId)
            .maybeSingle()

        setUser({
            id: userId,
            email,
            name: data?.name ?? null,
            lat: data?.lat ?? null,
            lng: data?.lng ?? null,
            distance_preference: data?.distance_preference ?? null,
        })
        setLoading(false)
    }

    useEffect(() => {
        if (!session?.user) {
            setUser(null)
            setLoading(false)
            return
        }
        fetchProfile(session.user.id, session.user.email ?? null)
    }, [session?.user?.id])

    function refresh() {
        if (session?.user) {
            fetchProfile(session.user.id, session.user.email ?? null)
        }
    }

    return (
        <UserContext.Provider value={{ user, loading, refresh }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) throw new Error("useUser must be used within UserProvider")
    return context
}
