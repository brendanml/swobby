import { useState, useEffect } from "react"
import { Link } from "react-router"
import { supabase } from "~/lib/supabase/client"
import { getOffersByUser, type OfferSummary } from "~/adapters/offers"
import { BookCover } from "~/components/book/cover"
import { Page } from "~/components/page"

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-muted text-muted-foreground",
    cancelled: "bg-muted text-muted-foreground",
}

export default function Offers() {
    const [offers, setOffers] = useState<OfferSummary[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return setLoading(false)
            setUserId(user.id)
            const results = await getOffersByUser(supabase, user.id)
            setOffers(results)
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
            ) : offers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No offers yet. Make an offer on a listing to get started.
                </p>
            ) : (
                <div className="flex flex-col gap-3 max-w-lg">
                    {offers.map((offer) => {
                        const iAmProposer = offer.proposer_id === userId
                        const otherUser = iAmProposer ? offer.recipient : offer.proposer
                        const myItems = offer.offer_items.filter((i) =>
                            iAmProposer ? i.side === "proposer" : i.side === "recipient"
                        )
                        const theirItems = offer.offer_items.filter((i) =>
                            iAmProposer ? i.side === "recipient" : i.side === "proposer"
                        )

                        return (
                            <Link
                                key={offer.id}
                                to={`/offers/${offer.id}`}
                                className="border rounded-xl p-4 flex flex-col gap-3 hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm">{otherUser?.name ?? "Unknown"}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[offer.status] ?? "bg-muted text-muted-foreground"}`}>
                                            {offer.status}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(offer.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {myItems.length > 0 && (
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs text-muted-foreground">You give</p>
                                            <div className="flex gap-1">
                                                {myItems.map((item, i) => (
                                                    <BookCover key={i} size="sm" url={item.listings?.books?.cover_url ?? null} title={item.listings?.books?.title ?? ""} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {theirItems.length > 0 && (
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs text-muted-foreground">You get</p>
                                            <div className="flex gap-1">
                                                {theirItems.map((item, i) => (
                                                    <BookCover key={i} size="sm" url={item.listings?.books?.cover_url ?? null} title={item.listings?.books?.title ?? ""} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </Page>
    )
}
