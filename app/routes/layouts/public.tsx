import { Link, Outlet } from "react-router"
import { Button } from "~/components/ui/button"
import { User } from "lucide-react"
import { useEffect, useState } from "react"

export default function PublicLayout() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 0)
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="fixed top-0 left-0 right-0 z-50 bg-linear-to-b from-background via-background/70 to-transparent pb-12 pointer-events-none">
                <div className="flex items-center justify-between px-5 py-4 pointer-events-auto">
                    <Link to="/">
                        <img
                            src="/swobby.svg"
                            alt="Swobby"
                            className={`h-8 w-8 transition-all duration-300 ${scrolled ? "drop-shadow-lg" : ""}`}
                        />
                    </Link>

                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full border bg-background/80 backdrop-blur-sm px-2 py-1.5 shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            asChild
                        >
                            <Link to="/about">About</Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full"
                            asChild
                        >
                            <Link to="/contact">Contact</Link>
                        </Button>
                    </div>

                    <Button
                        variant={scrolled ? "default" : "ghost"}
                        className="rounded-full transition-colors duration-300"
                        asChild
                    >
                        <Link to="/sign-in">
                            <User className="size-4" />
                            Sign In
                        </Link>
                    </Button>
                </div>
            </div>

            <Outlet />
        </div>
    )
}
