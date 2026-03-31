import { cn } from "~/lib/utils"

export function Card({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn("bg-muted/50 rounded-2xl shadow-md", className)}
            {...props}
        />
    )
}
