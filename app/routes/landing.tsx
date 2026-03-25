import { useNavigate } from "react-router"
import { APP_NAME } from "~/utils/config"
import { GoogleSignInButton } from "~/components/google-sign-in-button"
import { Button } from "~/components/ui/button"
import { useAuth } from "~/context/auth"
import { Compass } from "lucide-react"

function GeometricBackground() {
    const W = 1200
    const H = 800
    const ROWS = 28
    const COLS = 22
    const STEPS = 120
    const AMP = 55

    // Terrain height function — sum of sine waves to create organic hills
    function h(u: number, v: number): number {
        return (
            Math.sin(u * Math.PI * 3.5 + 0.8) *
                Math.cos(v * Math.PI * 2.5) *
                0.45 +
            Math.sin(u * Math.PI * 6 - v * Math.PI * 3 + 1.2) * 0.3 +
            Math.cos(u * Math.PI * 2 + v * Math.PI * 4.5) * 0.25
        )
    }

    // Row lines — sweep u (x-axis) for each v (depth), displaced by surface height
    const rowLines = Array.from({ length: ROWS }, (_, i) => {
        const v = i / (ROWS - 1)
        const pts = Array.from({ length: STEPS }, (_, j) => {
            const u = j / (STEPS - 1)
            const x = u * W
            const y = v * H + h(u, v) * AMP
            return `${j === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
        })
        return <path key={`r${i}`} d={pts.join(" ")} fill="none" />
    })

    // Column lines — sweep v (y-axis) for each u (column), displaced by surface height
    const colLines = Array.from({ length: COLS }, (_, i) => {
        const u = i / (COLS - 1)
        const pts = Array.from({ length: STEPS }, (_, j) => {
            const v = j / (STEPS - 1)
            const x = u * W
            const y = v * H + h(u, v) * AMP
            return `${j === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
        })
        return <path key={`c${i}`} d={pts.join(" ")} fill="none" />
    })

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            aria-hidden
        >
            <defs>
                <linearGradient
                    id="diag-fade"
                    x1="100%"
                    y1="0%"
                    x2="25%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.6" />
                    <stop offset="80%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <mask id="slice-mask">
                    <rect width={W} height={H} fill="url(#diag-fade)" />
                </mask>
            </defs>
            <g
                stroke="var(--color-primary)"
                strokeWidth="0.8"
                opacity="0.9"
                mask="url(#slice-mask)"
            >
                {rowLines}
                {colLines}
            </g>
        </svg>
    )
}

export default function LandingPage() {
    const { signIn } = useAuth()
    const navigate = useNavigate()

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background text-foreground overflow-hidden">
            <GeometricBackground />

            <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
                <h1 className="font-[--font-display] text-6xl font-semibold tracking-tighter">
                    {APP_NAME}
                </h1>
                <p className="text-muted-foreground text-base max-w-sm">
                    Trade books with people near you.
                </p>
                <div className="flex flex-col items-center gap-3">
                    <Button
                        onClick={() => navigate("/explore")}
                        className="w-full h-10 text-md"
                    >
                        <Compass className="size-5" />
                        Explore
                    </Button>
                    <GoogleSignInButton onClick={signIn} />
                </div>
            </div>
        </div>
    )
}
