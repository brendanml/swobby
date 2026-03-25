import { createContext, useContext, useState } from "react"
import { SignInModal } from "~/components/sign-in-modal"
import { useAuth } from "~/context/auth"

type SignInModalContext = {
    requireAuth: (callback: () => void) => void
}

const SignInModalContext = createContext<SignInModalContext>(null!)

export function SignInModalProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth()
    const [open, setOpen] = useState(false)

    function requireAuth(callback: () => void) {
        if (!session) {
            setOpen(true)
            return
        }
        callback()
    }

    return (
        <SignInModalContext.Provider value={{ requireAuth }}>
            {children}
            <SignInModal open={open} onClose={() => setOpen(false)} />
        </SignInModalContext.Provider>
    )
}

export const useSignInModal = () => {
    const context = useContext(SignInModalContext)
    if (!context) throw new Error("useSignInModal must be used within SignInModalProvider")
    return context
}
