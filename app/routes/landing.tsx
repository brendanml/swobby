import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { GeometricBackground } from "~/components/geometric-background"

export default function LandingPage() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden">
            <GeometricBackground />

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 text-center px-4">
                <img
                    src="/swobby-pure.svg"
                    alt="Swobby"
                    className="h-24 w-24 drop-shadow-lg"
                />
                <h1 className="text-4xl sm:text-5xl tracking-tight leading-tight text-foreground">
                    Your <span className=" italic">next</span> book is
                    <br />
                    <span
                        className="whitespace-nowrap text-5xl sm:text-7xl"
                        style={{
                            fontFamily: "cursive",
                        }}
                    >
                        next door
                    </span>
                </h1>
                <p className="text-muted-foreground text-base whitespace-nowrap">
                    Exchange books in your neighbourhood.
                </p>
                <div className="flex items-center gap-3">
                    <Button size="lg" className="rounded-full px-8" asChild>
                        <Link to="/sign-in">Get Started</Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full px-8"
                        asChild
                    >
                        <Link to="/about">Learn More</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
