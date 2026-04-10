import { useEffect, useState } from "react"
import { Check, Sparkles } from "lucide-react"
import { supabase } from "~/lib/supabase/client"
import { useOffer } from "~/context/offer"
import { useUser } from "~/context/user"
import { useMessages } from "~/context/messages"
import { getListingsByUser, type Listing } from "~/adapters/listings"
import { bookImage } from "~/lib/book-image"
import { createOffer } from "~/adapters/offers"
import { Panel } from "~/components/panel"
import { FilterSearch } from "~/components/filter-search"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "~/components/ui/dialog"

function ListingOption({
    listing,
    selected,
    isMatch,
    onToggle,
}: {
    listing: Listing
    selected: boolean
    isMatch?: boolean
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
            {bookImage(listing.books) && (
                <img
                    src={bookImage(listing.books)!}
                    alt={listing.books?.title ?? ""}
                    className="w-10 h-14 object-cover rounded"
                />
            )}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
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
            {isMatch && (
                <Sparkles className="size-3.5 text-warning-foreground shrink-0" />
            )}
        </div>
    )
}

export function OfferPanel() {
    const {
        open,
        theirId,
        theirName,
        closeOffer,
        preselectedMyWorkIds,
        preselectedTheirWorkIds,
    } = useOffer()
    const { user } = useUser()
    const { openMessage } = useMessages()
    const [theirListings, setTheirListings] = useState<Listing[]>([])
    const [myListings, setMyListings] = useState<Listing[]>([])
    const [selectedTheirIds, setSelectedTheirIds] = useState<Set<string>>(
        new Set(),
    )
    const [selectedMyIds, setSelectedMyIds] = useState<Set<string>>(new Set())
    const [theirQuery, setTheirQuery] = useState("")
    const [myQuery, setMyQuery] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [loadingListings, setLoadingListings] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)

    useEffect(() => {
        if (!open || !theirId || !user) return
        setSelectedTheirIds(new Set())
        setSelectedMyIds(new Set())
        setTheirQuery("")
        setMyQuery("")
        setLoadingListings(true)
        Promise.all([
            getListingsByUser(supabase, theirId),
            getListingsByUser(supabase, user.id),
        ]).then(([theirs, mine]) => {
            setTheirListings(theirs.filter((l) => l.status === "available"))
            setMyListings(mine.filter((l) => l.status === "available"))
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

    async function submitOffer() {
        if (!user || !theirId) return
        setSubmitting(true)
        setConfirmOpen(false)
        try {
            await createOffer({
                myId: user.id,
                theirId,
                myListingIds: [...selectedMyIds],
                theirListingIds: [...selectedTheirIds],
                message: "Sent you an offer",
            })
            closeOffer()
            openMessage({ id: theirId, name: theirName })
        } finally {
            setSubmitting(false)
        }
    }

    function handleSubmit() {
        if (!user || !theirId || (!selectedMyIds.size && !selectedTheirIds.size)) return
        if (Math.abs(selectedMyIds.size - selectedTheirIds.size) > 1) {
            setConfirmOpen(true)
            return
        }
        submitOffer()
    }

    return (
        <>
        <Panel
            open={open}
            onClose={closeOffer}
            title="Make an Offer"
            footer={
                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={
                        submitting ||
                        (!selectedMyIds.size && !selectedTheirIds.size)
                    }
                >
                    {submitting && <Spinner data-icon="inline-start" />}
                    {submitting ? "Sending..." : "Send Offer"}
                </Button>
            }
        >
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
                        <p className="text-sm font-medium">Their Listings</p>
                        <FilterSearch
                            value={theirQuery}
                            onChange={setTheirQuery}
                            placeholder="Filter listings..."
                        />
                        {theirListings.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                They have no available listings.
                            </p>
                        ) : (
                            theirListings
                                .filter((l) => {
                                    const q = theirQuery.toLowerCase()
                                    return !q || l.books?.title?.toLowerCase().includes(q) || l.books?.author_name?.toLowerCase().includes(q)
                                })
                                .sort((a, b) => {
                                    const aM = preselectedTheirWorkIds.includes(a.books?.work_id ?? "")
                                    const bM = preselectedTheirWorkIds.includes(b.books?.work_id ?? "")
                                    return Number(bM) - Number(aM)
                                })
                                .map((l) => (
                                    <ListingOption
                                        key={l.id}
                                        listing={l}
                                        selected={selectedTheirIds.has(l.id)}
                                        isMatch={preselectedTheirWorkIds.includes(l.books?.work_id ?? "")}
                                        onToggle={() => setSelectedTheirIds((s) => toggle(s, l.id))}
                                    />
                                ))
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium">Your Listings</p>
                        <FilterSearch
                            value={myQuery}
                            onChange={setMyQuery}
                            placeholder="Filter listings..."
                        />
                        {myListings.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                You have no available listings.
                            </p>
                        ) : (
                            myListings
                                .filter((l) => {
                                    const q = myQuery.toLowerCase()
                                    return !q || l.books?.title?.toLowerCase().includes(q) || l.books?.author_name?.toLowerCase().includes(q)
                                })
                                .sort((a, b) => {
                                    const aM = preselectedMyWorkIds.includes(a.books?.work_id ?? "")
                                    const bM = preselectedMyWorkIds.includes(b.books?.work_id ?? "")
                                    return Number(bM) - Number(aM)
                                })
                                .map((l) => (
                                    <ListingOption
                                        key={l.id}
                                        listing={l}
                                        selected={selectedMyIds.has(l.id)}
                                        isMatch={preselectedMyWorkIds.includes(l.books?.work_id ?? "")}
                                        onToggle={() => setSelectedMyIds((s) => toggle(s, l.id))}
                                    />
                                ))
                        )}
                    </div>
                </>
            )}
        </Panel>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Unbalanced trade</DialogTitle>
                    <DialogDescription>
                        You're offering {selectedMyIds.size} book{selectedMyIds.size !== 1 ? "s" : ""} for {selectedTheirIds.size}. Fair trades work best when both sides are equal — are you sure you want to send this offer?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                        Go back
                    </Button>
                    <Button onClick={submitOffer} disabled={submitting}>
                        {submitting && <Spinner data-icon="inline-start" />}
                        Send anyway
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}
