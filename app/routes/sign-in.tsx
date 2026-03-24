import { useAuth } from "~/context/auth"
import { APP_NAME } from "~/utils/config"
import { GoogleSignInButton } from "~/components/google-sign-in-button"

export default function SignInPage() {
    const { signIn } = useAuth()

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6 text-center">
                <h1 className="font-[--font-display] text-4xl font-semibold tracking-tighter">
                    {APP_NAME}
                </h1>
                <p className="text-muted-foreground text-sm max-w-xs">
                    Sign in to swap books with people near you.
                </p>
                <GoogleSignInButton onClick={signIn} className="w-full max-w-xs" />
            </div>
        </div>
    )
}
