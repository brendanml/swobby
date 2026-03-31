import { Link } from "react-router"
import { BookCover } from "~/components/book/cover"

interface BookCardProps {
    title: string
    coverUrl?: string | null
    href?: string
    owner?: string
    distance?: string
}

export function BookCard({
    title,
    coverUrl,
    href,
    owner,
    distance,
}: BookCardProps) {
    const content = (
        <div className="flex flex-col gap-2 w-full">
            <BookCover
                size="md"
                url={coverUrl ?? null}
                title={title}
                className="w-full h-auto aspect-2/3"
            />
            <div>
                <p className="text-sm line-clamp-2">{title}</p>
                {owner && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {owner}
                    </p>
                )}
                {distance && (
                    <p className="text-xs text-muted-foreground">{distance}</p>
                )}
            </div>
        </div>
    )

    if (href) {
        return (
            <Link to={href} className="hover:opacity-80 transition-opacity">
                {content}
            </Link>
        )
    }

    return content
}
