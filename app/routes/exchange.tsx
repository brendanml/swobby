import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase/client"
import {
    getExchangeWithOffers,
    acceptExchange,
    declineExchange,
} from "~/adapters/exchanges"
import type { Exchange, Offer } from "~/adapters/exchanges"
import { Page } from "~/components/page"
import { Button } from "~/components/ui/button"
import { useAuth } from "~/context/auth"
import type { Route } from "./+types/exchange"

export default function ExchangePage({ params }: Route.ComponentProps) {
    const { session } = useAuth()
    const currentUserId = session?.user?.id ?? null
    const [exchange, setExchange] = useState<Exchange | null>(null)
    const [offers, setOffers] = useState<Offer[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    async function handleAccept(offerId: string) {
        if (!exchange) return
        setActionLoading(true)
        const { error } = await acceptExchange(supabase, exchange.id, offerId)
        if (!error)
            setExchange({
                ...exchange,
                status: "completed",
                accepted_offer_id: offerId,
            })
        setActionLoading(false)
    }

    async function handleDecline() {
        if (!exchange) return
        setActionLoading(true)
        const { error } = await declineExchange(supabase, exchange.id)
        if (!error) setExchange({ ...exchange, status: "cancelled" })
        setActionLoading(false)
    }

    useEffect(() => {
        getExchangeWithOffers(supabase, params.id).then(
            ({ exchange, offers }) => {
                setExchange(exchange)
                setOffers(offers)
                setLoading(false)
            },
        )
    }, [params.id])

    return (
        <Page>
            {loading ? (
                <div className="flex flex-col gap-4 max-w-md animate-pulse">
                    <div className="h-6 bg-muted rounded w-24" />
                    <div className="h-32 bg-muted rounded" />
                </div>
            ) : !exchange ? (
                <p className="text-sm text-muted-foreground">
                    Exchange not found.
                </p>
            ) : (
                <div className="flex flex-col gap-6 max-w-md">
                    <div className="flex items-center gap-2">
                        <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                                exchange.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : exchange.status === "cancelled"
                                      ? "bg-muted text-muted-foreground"
                                      : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                            {exchange.status}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {offers.map((offer) => {
                            const proposerItems = offer.offer_items.filter(
                                (i) => i.side === "proposer",
                            )
                            const recipientItems = offer.offer_items.filter(
                                (i) => i.side === "recipient",
                            )
                            const isAccepted =
                                exchange.accepted_offer_id === offer.id

                            return (
                                <div
                                    key={offer.id}
                                    className={`border rounded-xl p-4 flex flex-col gap-3 ${isAccepted ? "border-green-400 bg-green-50" : ""}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">
                                            {offer.proposer?.name ?? "Unknown"}
                                        </p>
                                        {isAccepted && (
                                            <span className="text-xs text-green-600 font-medium">
                                                Accepted
                                            </span>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(
                                                offer.created_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs text-muted-foreground">
                                            Offering
                                        </p>
                                        {proposerItems.map((item) => (
                                            <div
                                                key={item.listings?.id}
                                                className="flex items-center gap-2"
                                            >
                                                {item.listings?.books
                                                    ?.cover_url && (
                                                    <img
                                                        src={
                                                            item.listings.books
                                                                .cover_url
                                                        }
                                                        alt=""
                                                        className="w-8 h-10 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <p className="text-sm">
                                                        {
                                                            item.listings?.books
                                                                ?.title
                                                        }
                                                    </p>
                                                    {item.listings?.books
                                                        ?.author_name && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                item.listings
                                                                    .books
                                                                    .author_name
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs text-muted-foreground">
                                            In exchange for
                                        </p>
                                        {recipientItems.map((item) => (
                                            <div
                                                key={item.listings?.id}
                                                className="flex items-center gap-2"
                                            >
                                                {item.listings?.books
                                                    ?.cover_url && (
                                                    <img
                                                        src={
                                                            item.listings.books
                                                                .cover_url
                                                        }
                                                        alt=""
                                                        className="w-8 h-10 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <p className="text-sm">
                                                        {
                                                            item.listings?.books
                                                                ?.title
                                                        }
                                                    </p>
                                                    {item.listings?.books
                                                        ?.author_name && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                item.listings
                                                                    .books
                                                                    .author_name
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {exchange.status === "open" &&
                                        currentUserId &&
                                        currentUserId !==
                                            exchange.initiator_id && (
                                            <div className="flex gap-2 pt-1">
                                                <Button
                                                    size="sm"
                                                    disabled={actionLoading}
                                                    onClick={() =>
                                                        handleAccept(offer.id)
                                                    }
                                                >
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    disabled={actionLoading}
                                                    onClick={handleDecline}
                                                >
                                                    Decline
                                                </Button>
                                            </div>
                                        )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </Page>
    )
}
