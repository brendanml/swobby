import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { BookCover } from "~/components/book-cover"
import { Button } from "~/components/ui/button"
import { useOffer } from "~/context/offer"
import type { OfferData } from "~/hooks/use-realtime-chat"

interface ExchangeCardProps {
    offer: OfferData
    currentUserId: string
    otherUserId: string
    otherUserName: string | null
    isOwn?: boolean
    onStatusChange: (
        exchangeId: string,
        status: string,
        acceptedOfferId?: string,
    ) => void
}

export function ExchangeCard({
    offer,
    isOwn = false,
    currentUserId,
    otherUserId,
    otherUserName,
    onStatusChange,
}: ExchangeCardProps) {
    const { openOffer } = useOffer()
    const exchange = offer.exchanges
    const iAmProposer = currentUserId === offer.proposer_id
    const myItems = offer.offer_items.filter((i) =>
        iAmProposer ? i.side === "proposer" : i.side === "recipient",
    )
    const theirItems = offer.offer_items.filter((i) =>
        iAmProposer ? i.side === "recipient" : i.side === "proposer",
    )
    const mutedText = isOwn ? "text-primary-foreground/70" : "text-muted-foreground"

    return (
        <div className={`border rounded-xl text-sm w-full mt-1 overflow-hidden ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
            <div className="p-3 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-3 flex-1">
                        <div className="flex flex-col gap-1">
                            <p className={`text-xs ${mutedText}`}>You give</p>
                            <div className="flex flex-wrap gap-1">
                                {myItems.map((item) => (
                                    <BookCover key={item.listings?.id} size="xs" url={item.listings?.books?.cover_url ?? null} title={item.listings?.books?.title ?? ""} />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className={`text-xs ${mutedText}`}>You get</p>
                            <div className="flex flex-wrap gap-1">
                                {theirItems.map((item) => (
                                    <BookCover key={item.listings?.id} size="xs" url={item.listings?.books?.cover_url ?? null} title={item.listings?.books?.title ?? ""} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <Link
                        to={`/exchanges/${exchange.id}`}
                        className={`inline-flex items-center gap-0.5 text-xs shrink-0 ${isOwn ? "text-primary-foreground/60 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"} transition-colors`}
                    >
                        View <ArrowUpRight className="size-3" />
                    </Link>
                </div>
            </div>
            {!iAmProposer && (
                <div className={`flex border-t ${isOwn ? "border-primary-foreground/20" : "border-border"}`}>
                    <button
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${isOwn ? "hover:bg-primary-foreground/10 text-primary-foreground" : "hover:bg-muted-foreground/10 text-foreground"}`}
                        onClick={() => onStatusChange(exchange.id, "completed", offer.id)}
                    >
                        Accept
                    </button>
                    <div className={`w-px ${isOwn ? "bg-primary-foreground/20" : "bg-border"}`} />
                    <button
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${isOwn ? "hover:bg-primary-foreground/10 text-primary-foreground" : "hover:bg-muted-foreground/10 text-foreground"}`}
                        onClick={() => openOffer(otherUserId, otherUserName, { existingExchangeId: exchange.id })}
                    >
                        Counter
                    </button>
                </div>
            )}
        </div>
    )
}
