import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

interface NameAvatarProps {
    name: string | null
    avatarUrl?: string | null
    size?: "sm" | "default" | "lg"
    className?: string
}

export function NameAvatar({ name, avatarUrl, size = "default", className }: NameAvatarProps) {
    return (
        <Avatar size={size} className={className}>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? "User"} />}
            <AvatarFallback>
                {(name ?? "?").slice(0, 1).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    )
}
