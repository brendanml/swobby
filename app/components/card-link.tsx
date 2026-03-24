import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { cn } from "~/lib/utils"

interface CardLinkProps {
    label: string
    to: string
    className?: string
}

export function CardLink({ label, to, className }: CardLinkProps) {
    return (
        <Link
            to={to}
            className={cn(
                "inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
                className,
            )}
        >
            {label}
            <ArrowUpRight className="size-3" />
        </Link>
    )
}
