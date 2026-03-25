import { RealtimeChat } from "~/components/chat/realtime"

export default function MessagesPage() {
    return (
        <div className="h-full w-full overflow-hidden">
            <RealtimeChat variant="page" />
        </div>
    )
}
