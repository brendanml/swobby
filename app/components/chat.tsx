import { useEffect, useState } from "react"
import { useAuth } from "~/context/auth"
import { supabase } from "~/lib/supabase/client"

export default function Chat() {
    const { session } = useAuth()
    const [usersOnline, setUsersOnline] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])

    useEffect(() => {
        if (!session?.user) {
            setUsersOnline([])
        }
        const roomOne = supabase.channel("room_one", {
            config: {
                presence: {
                    key: session?.user?.id,
                },
            },
        })
        roomOne.on("broadcast", { event: "message" }, (p) => {
            setMessages((prev) => [...prev, p.payload])
        })

        roomOne.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await roomOne.track({ id: session?.user?.id })
            }
        })

        roomOne.on("presence", { event: "sync" }, () => {
            const state = roomOne.presenceState()
            setUsersOnline(Object.keys(state))
        })
        return () => {
            roomOne.unsubscribe()
        }
    }, [session])

    return (
        <div className="h-120 w-100">
            <h1>Chatbox</h1>
            <div></div>
        </div>
    )
}
