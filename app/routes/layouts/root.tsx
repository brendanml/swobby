import { useState } from "react"
import { Outlet } from "react-router"
import { X } from "lucide-react"

export default function RootLayout() {
    const [dismissed, setDismissed] = useState(false)

    return (
        <>
            {!dismissed && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full border bg-background/90 backdrop-blur-sm shadow-lg px-4 py-2 text-sm whitespace-nowrap">
                    <span className="text-muted-foreground">
                        We're in beta — report bugs to{" "}
                        <a
                            href="mailto:support@swobby.org"
                            className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
                        >
                            support@swobby.org
                        </a>
                    </span>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
            )}
            <Outlet />
        </>
    )
}
