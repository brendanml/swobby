import { Page } from "~/components/page"
import { RealtimeChat } from "~/components/realtime-chat"

export default function MessagesPage() {
    return (
        <Page className="p-0 overflow-hidden">
            <div className="h-[calc(100vh-var(--nav-height))] w-full max-w-4xl">
                <RealtimeChat variant="page" />
            </div>
        </Page>
    )
}
