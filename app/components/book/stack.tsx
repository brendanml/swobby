import { BookCover } from "~/components/book/cover"

const MAX_VISIBLE = 5

const BOOK_DIMS = {
    md: { w: 80, h: 112 },
    lg: { w: 128, h: 176 },
}

interface BookStackProps {
    books: { work_id: string; title: string; cover_url: string | null }[]
    size?: "md" | "lg"
}

export function BookStack({ books, size = "md" }: BookStackProps) {
    const { w: BOOK_W, h: BOOK_H } = BOOK_DIMS[size]
    const visible = books.slice(0, MAX_VISIBLE)
    const extra = books.length - MAX_VISIBLE

    if (visible.length === 0) {
        return <div className="w-20 h-28 rounded bg-muted border border-dashed" />
    }

    const step = visible.length >= 4 ? BOOK_W * 0.5 : BOOK_W * 0.8
    const totalSlots = visible.length + (extra > 0 ? 1 : 0)
    const containerWidth = (totalSlots - 1) * step + BOOK_W

    return (
        <div className="relative" style={{ width: `${containerWidth}px`, height: `${BOOK_H}px` }}>
            {visible.map((b, i) => (
                <div
                    key={b.work_id}
                    className={`absolute bottom-0${i < visible.length - 1 ? " filter-[drop-shadow(4px_0px_2px_rgba(0,0,0,0.5))]" : ""}`}
                    style={{ left: `${i * step}px`, zIndex: visible.length - i }}
                >
                    <BookCover size={size} url={b.cover_url} title={b.title} />
                </div>
            ))}
            {extra > 0 && (
                <div
                    className="absolute bottom-0 flex items-center justify-center rounded bg-muted"
                    style={{ left: `${visible.length * step}px`, zIndex: visible.length, width: BOOK_W, height: BOOK_H }}
                >
                    <span
                        className="text-xs font-medium text-muted-foreground leading-snug text-center"
                        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    >
                        +{extra} more items
                    </span>
                </div>
            )}
        </div>
    )
}
