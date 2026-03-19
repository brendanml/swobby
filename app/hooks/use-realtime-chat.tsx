"use client"

import { useCallback, useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"

interface UseRealtimeChatProps {
    roomName: string
    username: string
}

export interface ChatMessage {
    id: string
    content: string
    user: {
        name: string
    }
    createdAt: string
}

const EVENT_MESSAGE_TYPE = "message"

export function useRealtimeChat({ roomName, username }: UseRealtimeChatProps) {
    const supabase = createClient()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [channel, setChannel] = useState<ReturnType<
        typeof supabase.channel
    > | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .order("created_at", { ascending: true })
            if (error) console.error(error)
            else
                setMessages(
                    data.map((row) => ({
                        id: row.id,
                        content: row.content,
                        user: { name: row.username },
                        createdAt: row.created_at,
                    })),
                )
        }
        fetchMessages()
    }, [])

    useEffect(() => {
        const newChannel = supabase.channel(roomName)

        newChannel
            .on("broadcast", { event: EVENT_MESSAGE_TYPE }, (payload) => {
                setMessages((current) => [
                    ...current,
                    payload.payload as ChatMessage,
                ])
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    setIsConnected(true)
                } else {
                    setIsConnected(false)
                }
            })

        setChannel(newChannel)

        return () => {
            supabase.removeChannel(newChannel)
        }
    }, [roomName, username, supabase])

    const sendMessage = useCallback(
        async (content: string) => {
            if (!channel || !isConnected) return

            const message: ChatMessage = {
                id: crypto.randomUUID(),
                content,
                user: {
                    name: username,
                },
                createdAt: new Date().toISOString(),
            }
            const {
                data: { session },
            } = await supabase.auth.getSession()
            const name = session?.user?.user_metadata?.full_name ?? username

            await supabase.from("messages").insert({
                room_name: roomName,
                username: name,
                content,
            })

            // Update local state immediately for the sender
            setMessages((current) => [...current, message])

            await channel.send({
                type: "broadcast",
                event: EVENT_MESSAGE_TYPE,
                payload: message,
            })
        },
        [channel, isConnected, username],
    )

    return { messages, sendMessage, isConnected }
}
