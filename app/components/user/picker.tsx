"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "~/context/auth"
import { Skeleton } from "~/components/ui/skeleton"

interface Profile {
    id: string
    name: string
}

interface UserPickerProps {
    onSelect: (profile: Profile) => void
}

export default function UserPicker({ onSelect }: UserPickerProps) {
    const { session } = useAuth()
    const supabase = createClient()
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfiles = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, name")
                .neq("id", session?.user?.id)

            if (error) console.error(error)
            else setProfiles(data)
            setLoading(false)
        }

        fetchProfiles()
    }, [session])

    if (loading) return (
        <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
    )

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">Start a chat with</p>
            {profiles.length === 0 && (
                <p className="text-sm text-muted-foreground">No other users yet</p>
            )}
            {profiles.map((profile) => (
                <button
                    key={profile.id}
                    onClick={() => onSelect(profile)}
                    className="text-left px-3 py-2 rounded-md hover:bg-accent text-sm"
                >
                    {profile.name}
                </button>
            ))}
        </div>
    )
}
