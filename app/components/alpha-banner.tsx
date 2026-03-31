import { useState } from "react"
import { X, FlaskConical } from "lucide-react"
import { BANNER_MESSAGE } from "~/config/banner"

export function AlphaBanner() {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    return (
        <div className="h-10 flex items-center px-4 shrink-0 bg-warning text-warning-foreground text-sm font-medium z-100">
            <div className="flex-1" />
            <span className="flex items-center gap-2 text-center">
                <FlaskConical className="size-4 shrink-0" />
                {BANNER_MESSAGE}
            </span>
            <div className="flex-1 flex justify-end">
                <button
                    onClick={() => setDismissed(true)}
                    className="shrink-0 opacity-70 hover:opacity-100 transition-opacity hover:cursor-pointer"
                    aria-label="Dismiss"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    )
}
