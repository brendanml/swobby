import { cn } from "~/lib/utils"
import { APP_NAME } from "~/utils/config"

export function AppName({ className }: { className?: string }) {
    return (
        <span className={cn("font-[--font-display] text-2xl font-semibold tracking-tighter", className)}>
            {APP_NAME}
        </span>
    )
}
