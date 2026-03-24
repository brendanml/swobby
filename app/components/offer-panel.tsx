import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { supabase } from "~/lib/supabase/client"
import { useOffer } from "~/context/offer"
import { useUser } from "~/context/user"
import { useMessages } from "~/context/messages"
import { getListingsByUser, type Listing } from "~/adapters/listings"
import { createOffer } from "~/adapters/offers"
import { Button } from "~/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet"
import { useIsMobile } from "~/hooks/use-mobile"

function ListingOption({
    listing,
    selected,
    onToggle,
}: {
    listing: Listing
    selected: boolean
    onToggle: () => void
}) {
    return (
        <div
            onClick={onToggle}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                selected
                    ? "border-primary bg-primary/8"
                    : "border-border hover:bg-muted/50"
            }`}
        >
            <div
                className={`size-4 shrink-0 rounded-sm border flex items-center justify-center transition-colors ${selected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}
            >
                {selected && (
                    <Check
                        className="size-3 text-primary-foreground"
                        strokeWidth={3}
                    />
                )}
            </div>
            {listing.books?.cover_url && (
                <img
                    src={listing.books.cover_url}
                    alt={listing.books.title ?? ""}
                    className="w-10 h-14 object-cover rounded"
                />
            )}
            <div className="flex flex-col gap-0.5">
                <p className="font-medium text-sm">{listing.books?.title}</p>
                {listing.books?.author_name && (
                    <p className="text-xs text-muted-foreground">
                        {listing.books.author_name}
                    </p>
                )}
                <p className="text-xs text-muted-foreground capitalize">
                    {listing.condition}
                </p>
            </div>
        </div>
    )
}

export function OfferPanel() {
    const {
        open,
        theirId,
        theirName,
        existingExchangeId,
        closeOffer,
        preselectedMyWorkIds,
        preselectedTheirWorkIds,
    } = useOffer()
    const isMobile = useIsMobile()
    const { user } = useUser()
    const { openMessage } = useMessages()
    const [theirListings, setTheirListings] = useState<Listing[]>([])
    const [myListings, setMyListings] = useState<Listing[]>([])
    const [selectedTheirIds, setSelectedTheirIds] = useState<Set<string>>(
        new Set(),
    )
    const [selectedMyIds, setSelectedMyIds] = useState<Set<string>>(new Set())
    const [submitting, setSubmitting] = useState(false)
    const [loadingListings, setLoadingListings] = useState(false)

    useEffect(() => {
        if (!open || !theirId || !user) return
        setSelectedTheirIds(new Set())
        setSelectedMyIds(new Set())
        setLoadingListings(true)
        Promise.all([
            getListingsByUser(supabase, theirId),
            getListingsByUser(supabase, user.id),
        ]).then(([theirs, mine]) => {
            setTheirListings(theirs)
            setMyListings(mine)
            if (preselectedTheirWorkIds.length)
                setSelectedTheirIds(
                    new Set(
                        theirs
                            .filter(
                                (l) =>
                                    l.books &&
                                    preselectedTheirWorkIds.includes(
                                        l.books.work_id ?? "",
                                    ),
                            )
                            .map((l) => l.id),
                    ),
                )
            if (preselectedMyWorkIds.length)
                setSelectedMyIds(
                    new Set(
                        mine
                            .filter(
                                (l) =>
                                    l.books &&
                                    preselectedMyWorkIds.includes(
                                        l.books.work_id ?? "",
                                    ),
                            )
                            .map((l) => l.id),
                    ),
                )
            setLoadingListings(false)
        })
    }, [open, theirId, user])

    function toggle(set: Set<string>, id: string): Set<string> {
        const next = new Set(set)
        next.has(id) ? next.delete(id) : next.add(id)
        return next
    }

    async function handleSubmit() {
        if (!user || !theirId || !selectedMyIds.size || !selectedTheirIds.size)
            return
        setSubmitting(true)
        try {
            await createOffer({
                myId: user.id,
                theirId,
                myListingIds: [...selectedMyIds],
                theirListingIds: [...selectedTheirIds],
                message: existingExchangeId ? "Sent you a counter offer" : "Sent you an offer",
                existingExchangeId,
            })
            closeOffer()
            openMessage({ id: theirId, name: theirName })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={(v) => !v && closeOffer()}>
            <SheetContent
                side={isMobile ? "bottom" : "right"}
                className="flex flex-col gap-0 p-0 md:max-h-screen max-h-[85vh]"
                aria-describedby={undefined}
            >
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle>Make an Offer</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
                    {loadingListings ? (
                        <div className="flex flex-col gap-6 animate-pulse">
                            {[...Array(2)].map((_, s) => (
                                <div key={s} className="flex flex-col gap-2">
                                    <div className="h-3 w-32 bg-muted rounded" />
                                    {[...Array(2)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 p-3 rounded-lg border"
                                        >
                                            <div className="size-4 rounded-sm bg-muted shrink-0" />
                                            <div className="w-10 h-14 rounded bg-muted shrink-0" />
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <div className="h-3 bg-muted rounded w-3/4" />
                                                <div className="h-3 bg-muted rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">
                                    Their listings you want
                                </p>
                                {theirListings.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        They have no listings.
                                    </p>
                                ) : (
                                    theirListings.map((l) => (
                                        <ListingOption
                                            key={l.id}
                                            listing={l}
                                            selected={selectedTheirIds.has(
                                                l.id,
                                            )}
                                            onToggle={() =>
                                                setSelectedTheirIds((s) =>
                                                    toggle(s, l.id),
                                                )
                                            }
                                        />
                                    ))
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">
                                    Your listings to offer
                                </p>
                                {myListings.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        You have no listings.
                                    </p>
                                ) : (
                                    myListings.map((l) => (
                                        <ListingOption
                                            key={l.id}
                                            listing={l}
                                            selected={selectedMyIds.has(l.id)}
                                            onToggle={() =>
                                                setSelectedMyIds((s) =>
                                                    toggle(s, l.id),
                                                )
                                            }
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="px-6 py-4 border-t">
                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={
                            submitting ||
                            !selectedMyIds.size ||
                            !selectedTheirIds.size
                        }
                    >
                        {submitting ? "Sending..." : "Send Offer"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
