import { createContext, useContext, useState } from "react"

type ChatUser = { id: string; name: string | null }

type ChatContextType = {
    chatUser: ChatUser | null
    openChat: (user: ChatUser) => void
    closeChat: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [chatUser, setChatUser] = useState<ChatUser | null>(null)

    return (
        <ChatContext.Provider value={{
            chatUser,
            openChat: setChatUser,
            closeChat: () => setChatUser(null),
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const ctx = useContext(ChatContext)
    if (!ctx) throw new Error("useChat must be used within ChatProvider")
    return ctx
}
