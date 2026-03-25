import { useNavigate } from "react-router"
import { UserRound, LogOut } from "lucide-react"
import { NameAvatar } from "~/components/user/name-avatar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"
import { useAuth } from "~/context/auth"
import { PROFILE } from "~/utils/nav-links"

interface UserAvatarProps {
    name: string | null
    avatarUrl?: string | null
}

export function UserAvatar({ name, avatarUrl }: UserAvatarProps) {
    const { signOut } = useAuth()
    const navigate = useNavigate()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <NameAvatar name={name} avatarUrl={avatarUrl} />
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
                    onClick={async () => {
                        await signOut()
                        navigate("/")
                    }}
                >
                    <LogOut className="size-4" />
                    Sign out
                </button>
            </PopoverContent>
        </Popover>
    )
}
