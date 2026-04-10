import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase/client"
import {
    getOfferById,
    updateOfferStatus,
    type OfferDetail,
} from "~/adapters/offers"
import { updateLibraryAfterOffer } from "~/adapters/listings"
import { useMessages } from "~/context/messages"
import { Page } from "~/components/page"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { BookCover } from "~/components/book/cover"
import { bookImage } from "~/lib/book-image"
import { NameAvatar } from "~/components/user/name-avatar"
import { CheckCheck, MapPin, MessageCircle } from "lucide-react"
import type { Route } from "./+types/detail"

const STATUS_BADGE: Record<string, string> = {
    pending: "bg-warning text-warning-foreground",
    accepted: "bg-success text-success-foreground",
    declined: "bg-destructive/15 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[status] ?? "bg-muted text-muted-foreground"}`}
        >
            {status}
        </span>
    )
}

function BookRow({
    book,
}: {
    book: NonNullable<OfferDetail["offer_items"][number]["books"]>
}) {
    return (
        <div className="flex items-center gap-3">
            <BookCover
                size="sm"
                url={bookImage(book)}
                title={book.title}
                author={book.author_name}
            />
            <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-sm font-medium leading-tight">
                    {book.title}
                </p>
                {book.author_name && (
                    <p className="text-xs text-muted-foreground">
                        {book.author_name}
                    </p>
                )}
            </div>
        </div>
    )
}

export default function OfferPage({ params }: Route.ComponentProps) {
    const { openMessage } = useMessages()
    const [offer, setOffer] = useState<OfferDetail | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [acting, setActing] = useState(false)
    const [libraryUpdated, setLibraryUpdated] = useState(false)

    useEffect(() => {
        Promise.all([
            getOfferById(supabase, params.id),
            supabase.auth.getUser(),
        ]).then(
            ([
                detail,
                {
                    data: { user },
                },
            ]) => {
                setOffer(detail)
                setCurrentUserId(user?.id ?? null)
                setLoading(false)
            },
        )
    }, [params.id])

    async function handleStatus(status: string) {
        if (!offer) return
        setActing(true)
        await updateOfferStatus(supabase, offer.id, status)
        setOffer({ ...offer, status })
        setActing(false)
    }

    async function handleUpdateLibrary() {
        if (!offer || !currentUserId) return
        setActing(true)
        const myListingIds = myItems
            .map((i) => i.listings?.id)
            .filter(Boolean) as string[]
        const theirWorkIds = theirItems
            .map((i) => i.work_id ?? i.books?.work_id)
            .filter(Boolean) as string[]
        await updateLibraryAfterOffer(supabase, {
            userId: currentUserId,
            currentOfferId: offer.id,
            myListingIds,
            theirWorkIds,
        })
        setLibraryUpdated(true)
        setActing(false)
    }

    const iAmProposer = currentUserId === offer?.proposer_id
    const isPending = offer?.status === "pending"
    const isAccepted = offer?.status === "accepted"
    const otherUser = iAmProposer ? offer?.recipient : offer?.proposer

    const myItems =
        offer?.offer_items.filter((i) =>
            iAmProposer ? i.side === "proposer" : i.side === "recipient",
        ) ?? []
    const theirItems =
        offer?.offer_items.filter((i) =>
            iAmProposer ? i.side === "recipient" : i.side === "proposer",
        ) ?? []

    return (
        <Page>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Spinner className="size-5 text-muted-foreground" />
                </div>
            ) : !offer ? (
                <p className="text-sm text-muted-foreground">
                    Offer not found.
                </p>
            ) : (
                <div className="flex flex-col gap-6 w-full">
                    {/* Meta row */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                            {new Date(offer.created_at).toLocaleDateString()}
                        </span>
                        <span>·</span>
                        <StatusBadge status={offer.status} />
                    </div>

                    {/* Profile header */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <NameAvatar name={otherUser?.name ?? null} size="lg" />
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold text-base leading-tight">
                                    {otherUser?.name ?? "Unknown"}
                                </p>
                                {offer.distanceKm != null && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="size-3 shrink-0" />
                                        <span>
                                            ~{Math.round(offer.distanceKm)} km away
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMessage({ id: iAmProposer ? offer.recipient_id : offer.proposer_id, name: otherUser?.name ?? null })}
                        >
                            <MessageCircle className="size-4" />
                            Message
                        </Button>
                    </div>

                    {/* Books */}
                    <div className="grid grid-cols-2 border border-border rounded-2xl overflow-hidden">
                        <div className="flex flex-col gap-3 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                You give
                            </p>
                            <div className="flex flex-col gap-3 max-h-120 overflow-y-auto">
                                {myItems.map((item, i) =>
                                    item.books ? (
                                        <BookRow
                                            key={item.work_id ?? i}
                                            book={item.books}
                                        />
                                    ) : null,
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 p-5 border-l border-border">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                You get
                            </p>
                            <div className="flex flex-col gap-3 max-h-120    overflow-y-auto">
                                {theirItems.map((item, i) =>
                                    item.books ? (
                                        <BookRow
                                            key={item.work_id ?? i}
                                            book={item.books}
                                        />
                                    ) : null,
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {isPending && (
                        <div className="flex gap-2">
                            {!iAmProposer ? (
                                <>
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleStatus("accepted")}
                                        disabled={acting}
                                    >
                                        {acting && (
                                            <Spinner data-icon="inline-start" />
                                        )}
                                        Accept
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        variant="outline"
                                        onClick={() => handleStatus("declined")}
                                        disabled={acting}
                                    >
                                        Decline
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => handleStatus("cancelled")}
                                    disabled={acting}
                                >
                                    {acting && (
                                        <Spinner data-icon="inline-start" />
                                    )}
                                    Cancel Offer
                                </Button>
                            )}
                        </div>
                    )}

                    {isAccepted && (
                        <Button
                            variant="outline"
                            onClick={handleUpdateLibrary}
                            disabled={acting || libraryUpdated}
                            className="self-start"
                        >
                            {libraryUpdated ? (
                                <>
                                    <CheckCheck className="size-4" />
                                    Library updated
                                </>
                            ) : (
                                <>
                                    {acting && (
                                        <Spinner data-icon="inline-start" />
                                    )}
                                    Update your library
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}
        </Page>
    )
}
