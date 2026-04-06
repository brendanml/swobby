import { cn } from "~/lib/utils"
import { APP_NAME } from "~/utils/config"

export function SwobbyWordmark({ className }: { className?: string }) {
    return (
        <span className={cn("font-semibold tracking-tight", className)}>
            {APP_NAME}
        </span>
    )
}
