import { useState, useEffect, useRef } from "react"
import {
    findNearbyBooks,
    findNearbyBooksForGuest,
    type NearbyBook,
} from "~/adapters/matches"
import { findSwaps, type SwapMatch } from "~/adapters/swaps"
import { useUser } from "~/context/user"
import { Page } from "~/components/page"
import { BookCard } from "~/components/book/card"
import { SwapCard } from "~/components/swap/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useIsMobile } from "~/hooks/use-mobile"

export default function Explore() {
    const { user, blockedUserIds } = useUser()
    const [swaps, setSwaps] = useState<SwapMatch[]>([])
    const [nearbyBooks, setNearbyBooks] = useState<NearbyBook[]>([])
    const [loading, setLoading] = useState(true)
    const [swapIndex, setSwapIndex] = useState(0)
    const isMobile = useIsMobile()
    const perPage = isMobile ? 1 : 2
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        const card = el.firstElementChild as HTMLElement
        if (!card) return
        const gap = isMobile ? 0 : 24
        el.scrollTo({
            left: swapIndex * (card.offsetWidth + gap),
            behavior: "smooth",
        })
    }, [swapIndex, isMobile])

    useEffect(() => {
        if (user?.id) {
            Promise.all([
                findSwaps(user.id, blockedUserIds),
                findNearbyBooks(user.id, blockedUserIds),
            ]).then(([swapResults, nearbyResults]) => {
                setSwaps(swapResults)
                setNearbyBooks(nearbyResults)
                setLoading(false)
            })
        } else {
            setLoading(false)
            if (!navigator.geolocation) return
            navigator.geolocation.getCurrentPosition(({ coords }) => {
                findNearbyBooksForGuest(coords.latitude, coords.longitude).then(
                    setNearbyBooks,
                )
            })
        }
    }, [user?.id, blockedUserIds])

    return (
        <Page>
            {loading ? (
                <div className="flex flex-col gap-10 animate-pulse">
                    <div className="flex flex-col gap-4">
                        <div className="h-5 w-36 bg-muted rounded" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(2)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-muted/60 rounded-2xl p-5 flex flex-col gap-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-muted" />
                                        <div className="h-3 bg-muted rounded w-24" />
                                    </div>
                                    <div className="h-44 bg-muted rounded-xl" />
                                    <div className="h-10 bg-muted rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="h-5 w-28 bg-muted rounded" />
                        <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
                            {[...Array(16)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="w-full aspect-2/3 bg-muted rounded-lg" />
                                    <div className="h-3 bg-muted rounded w-3/4" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    {swaps.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <div
                                ref={scrollRef}
                                className={`flex overflow-x-hidden pb-2 -mb-2 z-10 ${!isMobile ? "gap-4" : ""}`}
                            >
                                {swaps.map((swap) => (
                                    <div
                                        key={swap.user.id}
                                        className={`shrink-0 ${isMobile ? "w-full" : "w-[calc(50%-12px)]"}`}
                                    >
                                        <SwapCard swap={swap} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {swaps.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSwapIndex(i)}
                                            className={`rounded-full transition-all ${i === swapIndex ? "w-4 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30"}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {swaps.length} Swap
                                    {swaps.length !== 1 ? "s" : ""} nearby
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="default"
                                        size="icon"
                                        onClick={() =>
                                            setSwapIndex((i) =>
                                                Math.max(0, i - 1),
                                            )
                                        }
                                        disabled={swapIndex === 0}
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="icon"
                                        onClick={() =>
                                            setSwapIndex((i) =>
                                                Math.min(
                                                    swaps.length - 1,
                                                    i + 1,
                                                ),
                                            )
                                        }
                                        disabled={
                                            swapIndex >= swaps.length - perPage
                                        }
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        {nearbyBooks.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No books nearby yet. Set your location in
                                Profile.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-1 md:gap-2">
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
