import { useState, useEffect } from "react"
import { Link } from "react-router"
import { supabase } from "~/lib/supabase/client"
import { getExchangesByUser, type ExchangeSummary } from "~/adapters/exchanges"
import { Page } from "~/components/page"
import { bookImage } from "~/lib/book-image"

function StatusBadge({ status }: { status: string }) {
    const styles =
        status === "completed"
            ? "bg-green-100 text-green-700"
            : status === "cancelled"
              ? "bg-muted text-muted-foreground"
              : "bg-yellow-100 text-yellow-700"
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles}`}>
            {status}
        </span>
    )
}

export default function Exchanges() {
    const [exchanges, setExchanges] = useState<ExchangeSummary[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return setLoading(false)
            const results = await getExchangesByUser(supabase, user.id)
            setExchanges(results)
            setLoading(false)
        })
    }, [])

    return (
        <Page>
            {loading ? (
                <div className="flex flex-col gap-3 animate-pulse max-w-lg">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-muted rounded-xl" />
                    ))}
                </div>
            ) : exchanges.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No exchanges yet. Make an offer on a listing to get started.
                </p>
            ) : (
                <div className="flex flex-col gap-3 max-w-lg">
                    {exchanges.map((ex) => (
                        <Link
                            key={ex.id}
                            to={`/exchanges/${ex.id}`}
                            className="border rounded-xl p-4 flex flex-col gap-3 hover:bg-muted/40 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    {ex.otherUserName ?? "Unknown"}
                                </p>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={ex.status} />
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(ex.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {ex.books.length > 0 && (
                                <div className="flex gap-2">
                                    {ex.books.slice(0, 4).map((book, i) =>
                                        bookImage(book) ? (
                                            <img
                                                key={i}
                                                src={bookImage(book)!}
                                                alt={book.title}
                                                className="w-8 h-10 object-cover rounded"
                                            />
                                        ) : (
                                            <div
                                                key={i}
                                                className="w-8 h-10 bg-muted rounded flex items-center justify-center"
                                            >
                                                <span className="text-[8px] text-muted-foreground text-center leading-tight px-0.5">
                                                    {book.title.slice(0, 8)}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                    {ex.books.length > 4 && (
                                        <div className="w-8 h-10 bg-muted rounded flex items-center justify-center">
                                            <span className="text-xs text-muted-foreground">
                                                +{ex.books.length - 4}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </Page>
    )
}
