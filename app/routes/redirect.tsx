import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useUser } from "~/context/user"
import { useAuth } from "~/context/auth"

export default function RedirectPage() {
    const { loading: authLoading } = useAuth()
    const { user, loading: userLoading } = useUser()
    const navigate = useNavigate()

    useEffect(() => {
        console.log("[redirect] authLoading:", authLoading, "userLoading:", userLoading, "user:", user?.email)
        if (authLoading || userLoading) return
        if (!user) {
            navigate("/sign-in", { replace: true })
        } else if (!user.onboarding_complete) {
            navigate("/setup", { replace: true })
        } else {
            navigate("/explore", { replace: true })
        }
    }, [authLoading, userLoading, user])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted-foreground border-t-transparent" />
        </div>
    )
}
