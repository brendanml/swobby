import { Link } from "react-router"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"

interface UserProfileProps {
    id?: string
    name: string | null
    subtitle?: string
}

export function UserProfile({ id, name, subtitle }: UserProfileProps) {
    const content = (
        <div className="flex items-center gap-2 min-w-0">
            <Avatar size="sm">
                <AvatarFallback>
                    {(name ?? "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex items-center gap-1.5">
                <p className="text-sm font-medium truncate">{name ?? "Unknown"}</p>
                {subtitle && (
                    <>
                        <span className="text-muted-foreground text-xs shrink-0">·</span>
                        <p className="text-xs text-muted-foreground shrink-0">{subtitle}</p>
                    </>
                )}
            </div>
        </div>
    )

    if (id) {
        return (
            <Link to={`/users/${id}`} className="hover:opacity-80 transition-opacity">
                {content}
            </Link>
        )
    }

    return content
}
