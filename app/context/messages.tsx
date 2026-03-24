import { createContext, useContext, useState } from "react"

type MessageUser = { id: string; name: string | null; distanceKm?: number }

type MessagesContextType = {
    messageUser: MessageUser | null
    openMessage: (user: MessageUser) => void
    closeMessage: () => void
}

const MessagesContext = createContext<MessagesContextType | null>(null)

export function MessagesProvider({ children }: { children: React.ReactNode }) {
    const [messageUser, setMessageUser] = useState<MessageUser | null>(null)

    return (
        <MessagesContext.Provider value={{
            messageUser,
            openMessage: setMessageUser,
            closeMessage: () => setMessageUser(null),
        }}>
            {children}
        </MessagesContext.Provider>
    )
}

export function useMessages() {
    const ctx = useContext(MessagesContext)
    if (!ctx) throw new Error("useMessages must be used within MessagesProvider")
    return ctx
}
