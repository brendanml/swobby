import type { ReactNode } from "react"
import { useIsMobile } from "~/hooks/use-mobile"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet"

interface PanelProps {
    open: boolean
    onClose: () => void
    title: string
    footer: ReactNode
    children: ReactNode
}

export function Panel({ open, onClose, title, footer, children }: PanelProps) {
    const isMobile = useIsMobile()

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={`flex flex-col gap-0 p-0 md:max-h-screen max-h-[90vh] ${isMobile ? "rounded-t-2xl" : "rounded-l-2xl"}`}
                aria-describedby={undefined}
            >
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle>{title}</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                    {children}
                </div>

                <div className="px-6 py-4 border-t">{footer}</div>
            </SheetContent>
        </Sheet>
    )
}
