import { useState, useEffect } from "react"
import { Link } from "react-router"
import { supabase } from "~/lib/supabase/client"
import { findSwaps, type SwapMatch } from "~/adapters/swaps"
import { useMessages } from "~/context/messages"
import { Button } from "~/components/ui/button"
import { Page } from "~/components/page"

export default function Swaps() {
    const { openMessage } = useMessages()
    const [swaps, setSwaps] = useState<SwapMatch[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return setLoading(false)
            const results = await findSwaps(user.id)
            setSwaps(results)
            setLoading(false)
        })
    }, [])

    return (
        <Page>
            {loading ? (
                <div className="flex flex-col gap-4 max-w-md animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-muted rounded" />
                    ))}
                </div>
            ) : swaps.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No swaps found. Add listings and wants to find matches.
                </p>
            ) : (
                <div className="flex flex-col gap-6 max-w-md">
                    {swaps.map(
                        ({
                            user,
                            distanceKm,
                            iHaveTheyWant,
                            theyHaveIWant,
                        }) => (
                            <div
                                key={user.id}
                                className="border rounded-md p-4 flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between">
                                    <Link
                                        to={`/users/${user.id}`}
                                        className="font-semibold hover:underline"
                                    >
                                        {user.name ?? "Unknown"}
                                    </Link>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            openMessage({
                                                id: user.id,
                                                name: user.name,
                                                distanceKm,
                                            })
                                        }
                                    >
                                        Message
                                    </Button>
                                </div>

                                {iHaveTheyWant.length > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                            You have, they want
                                        </p>
                                        {iHaveTheyWant.map((book) => (
                                            <div
                                                key={book.work_id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                {book.cover_url && (
                                                    <img
                                                        src={book.cover_url}
                                                        alt={book.title}
                                                        className="w-8 h-10 object-cover rounded"
                                                    />
                                                )}
                                                <span>{book.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {theyHaveIWant.length > 0 && (
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                            They have, you want
                                        </p>
                                        {theyHaveIWant.map((book) => (
                                            <div
                                                key={book.work_id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                {book.cover_url && (
                                                    <img
                                                        src={book.cover_url}
                                                        alt={book.title}
                                                        className="w-8 h-10 object-cover rounded"
                                                    />
                                                )}
                                                <span>{book.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ),
                    )}
                </div>
            )}
        </Page>
    )
}
