import type { ReactNode } from "react"
import { cn } from "~/lib/utils"

export function Page({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div
            className={cn(
                "grid grid-cols-12 gap-6 overflow-y-auto scrollbar-none h-full p-4",
                className,
            )}
        >
            <div className="col-span-12 md:col-span-12 flex flex-col gap-6">
                {children}
            </div>
        </div>
    )
}
