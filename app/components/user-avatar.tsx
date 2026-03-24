import { useNavigate } from "react-router"
import { UserRound, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { useAuth } from "~/context/auth"
import { PROFILE } from "~/utils/nav-links"

interface UserAvatarProps {
    name: string | null
    avatarUrl?: string | null
}

function initials(name: string | null): string {
    if (!name) return "?"
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
}

export function UserAvatar({ name, avatarUrl }: UserAvatarProps) {
    const { signOut } = useAuth()
    const navigate = useNavigate()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar>
                        {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? "User"} />}
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                    </Avatar>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1" align="end">
                <button
                    className="w-full text-left text-sm px-3 py-2 rounded-sm hover:bg-muted transition-colors flex items-center gap-2"
                    onClick={() => navigate(PROFILE.to)}
                >
                    <UserRound className="size-4 text-muted-foreground" />
                    View profile
                </button>
                <button
                    className="w-full text-left text-sm px-3 py-2 rounded-sm hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                    onClick={async () => { await signOut(); navigate("/sign-in") }}
                >
                    <LogOut className="size-4" />
                    Sign out
                </button>
            </PopoverContent>
        </Popover>
    )
}
