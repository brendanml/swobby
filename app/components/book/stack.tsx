import { BookCover } from "~/components/book/cover"
import { useIsMobile, useIsTablet } from "~/hooks/use-mobile"

const BOOK_DIMS = {
    xs: { w: 32, h: 44 },
    sm: { w: 48, h: 64 },
    md: { w: 80, h: 112 },
    lg: { w: 128, h: 176 },
}

interface BookStackProps {
    books: { work_id: string; title: string; cover_url: string | null }[]
    size?: "xs" | "sm" | "md" | "lg"
    maxVisible?: number
}

export function BookStack({ books, size = "md", maxVisible: maxVisibleProp }: BookStackProps) {
    const isMobile = useIsMobile()
    const isTablet = useIsTablet()
    const maxVisible = maxVisibleProp ?? (isMobile ? 2 : isTablet ? 3 : 5)
    const { w: BOOK_W, h: BOOK_H } = BOOK_DIMS[size]
    const visible = books.slice(0, maxVisible)
    const extra = books.length - maxVisible

    if (visible.length === 0) {
        return <div style={{ width: BOOK_W, height: BOOK_H }} className="rounded bg-muted border border-dashed" />
    }

    const step = BOOK_W * 0.5
    const booksWidth = (visible.length - 1) * step + BOOK_W

    return (
        <div className="flex items-center gap-1.5">
            <div className="relative shrink-0" style={{ width: `${booksWidth}px`, height: `${BOOK_H}px` }}>
                {visible.map((b, i) => (
                    <div
                        key={b.work_id}
                        className={`absolute bottom-0${i < visible.length - 1 ? " filter-[drop-shadow(4px_0px_2px_rgba(0,0,0,0.5))]" : ""}`}
                        style={{ left: `${i * step}px`, zIndex: visible.length - i }}
                    >
                        <BookCover size={size} url={b.cover_url} title={b.title} />
                    </div>
                ))}
            </div>
            {extra > 0 && (
                <span className="text-xs text-muted-foreground shrink-0">
                    +{extra}
                </span>
            )}
        </div>
    )
}
