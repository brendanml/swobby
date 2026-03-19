import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"
import { Button } from "./ui/button"
import { RealtimeChat } from "./realtime-chat"

import ChatIcon from "@mui/icons-material/Chat"
import { useAuth } from "~/context/auth"

export default function ChatPopover() {
    const { session } = useAuth()
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="py-5">
                    <ChatIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-gray-50">
                <RealtimeChat
                    roomName="room_one"
                    username={
                        session?.user?.user_metadata?.full_name ?? "Anonymous"
                    }
                />
            </PopoverContent>
        </Popover>
    )
}
