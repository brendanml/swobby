import { useNavigate } from "react-router"
import { useAuth } from "~/context/auth"
import { GoogleSignInButton } from "~/components/google-sign-in-button"
import { Button } from "~/components/ui/button"
import { GeometricBackground } from "~/components/geometric-background"
import { Compass } from "lucide-react"

export default function SignInPage() {
    const { signIn } = useAuth()
    const navigate = useNavigate()

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background text-foreground overflow-hidden">
            <GeometricBackground />

            <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
                <h1 className="font-sans text-5xl font-semibold tracking-tighter">
                    swobby
                </h1>
                <div className="flex flex-col items-center gap-3 w-72">
                    <GoogleSignInButton onClick={signIn} />
                    <Button
                        variant="default"
                        size="lg"
                        className="rounded-full"
                        onClick={() => navigate("/explore")}
                    >
                        <Compass className="size-4" />
                        Explore
                    </Button>
                </div>
                <p className="text-muted-foreground text-xs mt-2">
                    Don't have an account?{" "}
                    <button
                        onClick={signIn}
                        className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors hover:cursor-pointer"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    )
}
