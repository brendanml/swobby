import { Link } from "react-router"
import { Pencil, Trash2, Check } from "lucide-react"
import { BookCover } from "~/components/book/cover"
import { cn } from "~/lib/utils"

const STATUS_STYLES: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    sold: "bg-muted text-muted-foreground",
}

interface OwnedBookCardProps {
    coverUrl: string | null
    title: string
    authorName?: string | null
    condition?: string
    description?: string | null
    status?: string
    editTo?: string
    deleteTo: string
    className?: string
    selected?: boolean
    onToggleSelect?: () => void
}

export function OwnedBookCard({
    coverUrl,
    title,
    authorName,
    condition,
    description,
    status,
    editTo,
    deleteTo,
    className,
    selected,
    onToggleSelect,
}: OwnedBookCardProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-3 bg-muted/50 rounded-xl p-3 transition-colors",
                selected && "bg-primary/8 border border-primary",
                !selected && "border border-transparent",
                className,
            )}
            onClick={onToggleSelect}
        >
            {onToggleSelect !== undefined && (
                <div
                    className={`size-4 shrink-0 rounded-sm border flex items-center justify-center transition-colors ${selected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}
                >
                    {selected && <Check className="size-3 text-primary-foreground" strokeWidth={3} />}
                </div>
            )}
            <BookCover size="sm" url={coverUrl} title={title} />
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{title}</p>
                {authorName && (
                    <p className="text-xs text-muted-foreground truncate">{authorName}</p>
                )}
                <div className="flex items-center gap-1.5">
                    {condition && <p className="text-xs text-muted-foreground capitalize">{condition}</p>}
                    {status && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"}`}>
                            {status}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground truncate">{description}</p>
                )}
            </div>
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {editTo && (
                    <Link to={editTo} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="size-3.5" />
                    </Link>
                )}
                <Link to={deleteTo} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="size-3.5" />
                </Link>
            </div>
        </div>
    )
}
