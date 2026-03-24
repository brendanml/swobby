import { cn } from "~/lib/utils"

const SIZES = {
    xs: { outer: "w-8 h-11", text: "text-[7px] gap-0.5", padding: "p-1" },
    sm: { outer: "w-12 h-16", text: "text-[8px] gap-0.5", padding: "p-1.5" },
    md: { outer: "w-20 h-28", text: "text-[10px] gap-1", padding: "p-2" },
    lg: { outer: "w-32 h-44", text: "text-xs gap-1.5", padding: "p-3" },
}

interface BookCoverProps {
    url: string | null
    title: string
    author?: string | null
    size?: keyof typeof SIZES
    className?: string
}

export function BookCover({
    url,
    title,
    author,
    size = "md",
    className,
}: BookCoverProps) {
    const { outer, text, padding } = SIZES[size]

    return (
        <div
            className={cn(
                "relative rounded overflow-hidden shrink-0",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.25)]",
                outer,
                className,
            )}
        >
            {url ? (
                <img
                    src={url}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div
                    className={cn(
                        "w-full h-full flex flex-col justify-end bg-linear-to-br from-muted to-muted-foreground/20",
                        padding,
                    )}
                >
                    <p
                        className={cn(
                            "font-semibold text-foreground leading-tight line-clamp-3",
                            text,
                        )}
                    >
                        {title}
                    </p>
                    {author && (
                        <p
                            className={cn(
                                "text-muted-foreground leading-tight line-clamp-1",
                                text,
                            )}
                        >
                            {author}
                        </p>
                    )}
                </div>
            )}

            {/* inset shadow overlay */}
            <div className="absolute inset-0 rounded pointer-events-none shadow-[inset_2px_0_6px_rgba(0,0,0,0.2),inset_-1px_0_3px_rgba(0,0,0,0.1)]" />
        </div>
    )
}
