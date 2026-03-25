import { Link } from "react-router"
import { NameAvatar } from "~/components/user/name-avatar"

interface UserProfileProps {
    id?: string
    name: string | null
    subtitle?: string
    listingCount?: number
    size?: "sm" | "md" | "lg"
}

export function UserProfile({
    id,
    name,
    subtitle,
    listingCount,
    size = "sm",
}: UserProfileProps) {
    const avatarSize = size === "lg" ? "lg" : size === "md" ? "default" : "sm"
    const nameClass =
        size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm"
    const subtitleClass =
        size === "lg" ? "text-base" : size === "md" ? "text-sm" : "text-xs"

    const content =
        size === "lg" ? (
            <div className="flex items-center gap-3 min-w-0">
                <NameAvatar name={name} size={avatarSize} />
                <div className="min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <p className={`${nameClass} truncate`}>
                            {name ?? "Unknown"}
                        </p>
                        {subtitle && (
                            <>
                                <span
                                    className={`text-muted-foreground shrink-0 ${subtitleClass}`}
                                >
                                    ·
                                </span>
                                <p
                                    className={`${subtitleClass} text-muted-foreground shrink-0`}
                                >
                                    {subtitle}
                                </p>
                            </>
                        )}
                    </div>
                    {listingCount !== undefined && (
                        <p className="text-sm text-muted-foreground">
                            {listingCount}{" "}
                            {listingCount === 1 ? "listing" : "listings"}
                        </p>
                    )}
                </div>
            </div>
        ) : (
            <div className="flex items-center gap-2 min-w-0">
                <NameAvatar name={name} size={avatarSize} />
                <div className="min-w-0 flex items-center gap-1.5">
                    <p className={`${nameClass} truncate`}>
                        {name ?? "Unknown"}
                    </p>
                    {subtitle && (
                        <>
                            <span
                                className={`text-muted-foreground shrink-0 ${subtitleClass}`}
                            >
                                ·
                            </span>
                            <p
                                className={`${subtitleClass} text-muted-foreground shrink-0`}
                            >
                                {subtitle}
                            </p>
                        </>
                    )}
                </div>
            </div>
        )

    if (id) {
        return (
            <Link
                to={`/users/${id}`}
                className="hover:opacity-80 transition-opacity"
            >
                {content}
            </Link>
        )
    }

    return content
}
