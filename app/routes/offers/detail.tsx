import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase/client"
import { getOfferById, updateOfferStatus, type OfferDetail } from "~/adapters/offers"
import { Page } from "~/components/page"
import { Button } from "~/components/ui/button"
import { BookCover } from "~/components/book/cover"
import { UserProfile } from "~/components/user/profile"
import type { Route } from "./+types/detail"

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-muted text-muted-foreground",
    cancelled: "bg-muted text-muted-foreground",
}

export default function OfferPage({ params }: Route.ComponentProps) {
    const [offer, setOffer] = useState<OfferDetail | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [acting, setActing] = useState(false)

    useEffect(() => {
        Promise.all([
            getOfferById(supabase, params.id),
            supabase.auth.getUser(),
        ]).then(([detail, { data: { user } }]) => {
            setOffer(detail)
            setCurrentUserId(user?.id ?? null)
            setLoading(false)
        })
    }, [params.id])

    async function handleStatus(status: string) {
        if (!offer) return
        setActing(true)
        await updateOfferStatus(supabase, offer.id, status)
        setOffer({ ...offer, status })
        setActing(false)
    }

    const iAmProposer = currentUserId === offer?.proposer_id
    const isPending = offer?.status === "pending"
    const otherUser = iAmProposer ? offer?.recipient : offer?.proposer
    const otherUserId = iAmProposer ? offer?.recipient_id : offer?.proposer_id

    const myItems = offer?.offer_items.filter((i) =>
        iAmProposer ? i.side === "proposer" : i.side === "recipient"
    ) ?? []
    const theirItems = offer?.offer_items.filter((i) =>
        iAmProposer ? i.side === "recipient" : i.side === "proposer"
    ) ?? []

    return (
        <Page>
            {loading ? (
                <div className="flex flex-col gap-6 max-w-md animate-pulse">
                    <div className="h-5 bg-muted rounded w-24" />
                    <div className="h-32 bg-muted rounded" />
                    <div className="h-32 bg-muted rounded" />
                </div>
            ) : !offer ? (
                <p className="text-sm text-muted-foreground">Offer not found.</p>
            ) : (
                <div className="flex flex-col gap-6 max-w-md">
                    <div className="flex items-center justify-between">
                        <UserProfile id={otherUserId} name={otherUser?.name ?? null} />
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[offer.status] ?? ""}`}>
                            {offer.status}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 border rounded-xl p-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">You give</p>
                            <div className="flex flex-wrap gap-2">
                                {myItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <BookCover size="sm" url={item.listings?.books?.cover_url ?? null} title={item.listings?.books?.title ?? ""} />
                                        <div>
                                            <p className="text-sm">{item.listings?.books?.title}</p>
                                            {item.listings?.books?.author_name && (
                                                <p className="text-xs text-muted-foreground">{item.listings.books.author_name}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border-t" />
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">You get</p>
                            <div className="flex flex-wrap gap-2">
                                {theirItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <BookCover size="sm" url={item.listings?.books?.cover_url ?? null} title={item.listings?.books?.title ?? ""} />
                                        <div>
                                            <p className="text-sm">{item.listings?.books?.title}</p>
                                            {item.listings?.books?.author_name && (
                                                <p className="text-xs text-muted-foreground">{item.listings.books.author_name}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isPending && (
                        <div className="flex gap-2">
                            {!iAmProposer ? (
                                <>
                                    <Button className="flex-1" onClick={() => handleStatus("accepted")} disabled={acting}>
                                        Accept
                                    </Button>
                                    <Button className="flex-1" variant="outline" onClick={() => handleStatus("declined")} disabled={acting}>
                                        Decline
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" onClick={() => handleStatus("cancelled")} disabled={acting}>
                                    Cancel Offer
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Page>
    )
}
