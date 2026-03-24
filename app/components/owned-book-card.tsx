import { Link } from "react-router"
import { Pencil, Trash2 } from "lucide-react"
import { BookCover } from "~/components/book-cover"
import { cn } from "~/lib/utils"

interface OwnedBookCardProps {
    coverUrl: string | null
    title: string
    authorName?: string | null
    condition: string
    description?: string | null
    editTo: string
    deleteTo: string
    className?: string
}

export function OwnedBookCard({
    coverUrl,
    title,
    authorName,
    condition,
    description,
    editTo,
    deleteTo,
    className,
}: OwnedBookCardProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-3 bg-muted/50 rounded-xl p-3",
                className,
            )}
        >
            <BookCover size="sm" url={coverUrl} title={title} />
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{title}</p>
                {authorName && (
                    <p className="text-xs text-muted-foreground truncate">
                        {authorName}
                    </p>
                )}
                <p className="text-xs text-muted-foreground capitalize">
                    {condition}
                </p>
                {description && (
                    <p className="text-xs text-muted-foreground truncate">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <Link to={editTo} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="size-3.5" />
                </Link>
                <Link to={deleteTo} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="size-3.5" />
                </Link>
            </div>
        </div>
    )
}
