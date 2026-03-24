import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase/client"
import { findNearbyBooks, type NearbyBook } from "~/adapters/matches"
import { findSwaps, type SwapMatch } from "~/adapters/swaps"
import { Page } from "~/components/page"
import { BookCard } from "~/components/book-card"
import { SwapCard } from "~/components/swap-card"

export default function Explore() {
    const [swaps, setSwaps] = useState<SwapMatch[]>([])
    const [nearbyBooks, setNearbyBooks] = useState<NearbyBook[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return setLoading(false)
            const [swapResults, nearbyResults] = await Promise.all([
                findSwaps(user.id),
                findNearbyBooks(user.id),
            ])
            setSwaps(swapResults)
            setNearbyBooks(nearbyResults)
            setLoading(false)
        })
    }, [])

    return (
        <Page>
            {loading ? (
                <div className="flex flex-col gap-8 animate-pulse">
                    <div className="flex flex-col gap-3">
                        <div className="h-4 w-36 bg-muted rounded" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-muted/60 rounded-xl p-4 flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-full bg-muted" />
                                        <div className="h-3 bg-muted rounded w-24" />
                                    </div>
                                    <div className="h-16 bg-muted rounded" />
                                    <div className="h-8 bg-muted rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="w-full aspect-2/3 bg-muted rounded-xl" />
                                    <div className="h-3 bg-muted rounded w-3/4" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {swaps.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap gap-3 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] p-2">
                                {swaps.map((swap) => (
                                    <SwapCard key={swap.user.id} swap={swap} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {nearbyBooks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No books nearby yet. Set your location in
                                Profile.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {nearbyBooks.map((book) => (
                                    <BookCard
                                        key={`${book.work_id}-${book.userId}`}
                                        title={book.title}
                                        coverUrl={book.cover_url}
                                        href={`/listings/${book.listingId}`}
                                        owner={book.userName ?? "Unknown"}
                                        distance={`${Math.round(book.distanceKm)} km away`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Page>
    )
}
