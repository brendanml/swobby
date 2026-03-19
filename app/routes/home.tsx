import type { Route } from "./+types/home"
import { Button } from "~/components/ui/button"
import { useAuth } from "~/context/auth"
import ChatPopover from "~/components/chat-popover"

export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ]
}

export default function Home() {
    const { session, signIn } = useAuth()
    return (
        <div className="h-screen flex flex-col justify-between">
            <nav className="flex-row w-full flex items-center justify-end">
                <div>{session?.user?.email}</div>
                <Button onClick={signIn}>Auth</Button>
            </nav>
            <div className="w-full fixed bottom-0 left-0 p-4 flex justify-end">
                <ChatPopover />
            </div>
        </div>
    )
}
