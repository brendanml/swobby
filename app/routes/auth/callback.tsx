import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "~/context/auth"

export default function AuthCallback() {
    const { loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (loading) return
        navigate("/redirect", { replace: true })
    }, [loading])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted-foreground border-t-transparent" />
        </div>
    )
}
