import { useEffect, useState } from "react"
import { gridDistance } from "h3-js"
import { MessageCircle, HandshakeIcon } from "lucide-react"
import { supabase } from "~/lib/supabase/client"
import { getListingDetail, getListingsByUser, type ListingDetail } from "~/adapters/listings"
import { Page } from "~/components/page"
import { BookCover } from "~/components/book/cover"
import { UserProfile } from "~/components/user/profile"
import { AuthProtectedButton } from "~/components/auth-protected-button"
import { useMessages } from "~/context/messages"
import { useOffer } from "~/context/offer"
import type { Route } from "./+types/detail"

type ListingViewProps = {
    listing: ListingDetail
    distanceKm: number | null
    listingCount: number | null
}

type ListingActionsProps = {
    onMessage: () => void
    onOffer: () => void
}

function MobileListing({ listing, distanceKm, onMessage, onOffer }: ListingViewProps & ListingActionsProps) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex gap-4">
                <BookCover
                    size="lg"
                    url={listing.books?.cover_url ?? null}
                    title={listing.books?.title ?? ""}
                    className="shrink-0"
                />
                <div className="flex flex-col gap-1.5 min-w-0">
                    <h1 className="text-lg font-semibold leading-tight">
                        {listing.books?.title}
                    </h1>
                    {listing.books?.author_name && (
                        <p className="text-sm text-muted-foreground">
                            {listing.books.author_name}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground capitalize">
                        {listing.condition}
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground">
                    Seller's description
                </p>
                <p className="text-sm text-muted-foreground min-h-32 bg-muted/50 rounded-lg p-3">
                    {listing.description ?? "This user has not added a description."}
                </p>
            </div>
            <div className="flex flex-col gap-4 border-t pt-4">
                <UserProfile
                    id={listing.user_id}
                    name={listing.user?.name ?? null}
                    subtitle={
                        distanceKm !== null
                            ? `${Math.max(1, Math.round(distanceKm))} km`
                            : undefined
                    }
                />
                <div className="flex gap-3">
                    <AuthProtectedButton className="flex-1" variant="outline" size="lg" onClick={onMessage}>
                        <MessageCircle className="size-4" /> Message
                    </AuthProtectedButton>
                    <AuthProtectedButton className="flex-1" size="lg" onClick={onOffer}>
                        <HandshakeIcon className="size-4" /> Make Offer
                    </AuthProtectedButton>
                </div>
            </div>
        </div>
    )
}

function DesktopListing({ listing, distanceKm, listingCount, onMessage, onOffer }: ListingViewProps & ListingActionsProps) {
    return (
        <div className="flex gap-10 w-full">
            <BookCover
                size="lg"
                url={listing.books?.cover_url ?? null}
                title={listing.books?.title ?? ""}
                className="w-80 h-full shrink-0"
            />
            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex flex-col gap-3 flex-1">
                    <h1 className="text-3xl font-semibold leading-tight">
                        {listing.books?.title}
                    </h1>
                    {listing.books?.author_name && (
                        <p className="text-xl text-muted-foreground">
                            {listing.books.author_name}
                        </p>
                    )}
                    <p className="text-base text-muted-foreground capitalize">
                        {listing.condition}
                    </p>
                    <div className="flex flex-col gap-1 mt-2 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">
                            Seller's description
                        </p>
                        <p className="text-sm text-muted-foreground flex-1 bg-muted/50 rounded-lg p-3">
                            {listing.description ?? "This user has not added a description."}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 border-t pt-6 mt-6">
                    <UserProfile
                        id={listing.user_id}
                        name={listing.user?.name ?? null}
                        size="lg"
                        subtitle={
                            distanceKm !== null
                                ? `${Math.max(1, Math.round(distanceKm))} km`
                                : undefined
                        }
                        listingCount={listingCount ?? undefined}
                    />
                    <div className="flex gap-3">
                        <AuthProtectedButton className="flex-1" variant="outline" size="lg" onClick={onMessage}>
                            <MessageCircle className="size-4" /> Message
                        </AuthProtectedButton>
                        <AuthProtectedButton className="flex-1" size="lg" onClick={onOffer}>
                            <HandshakeIcon className="size-4" /> Make Offer
                        </AuthProtectedButton>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ListingPage({ params }: Route.ComponentProps) {
    const { openMessage } = useMessages()
    const { openOffer } = useOffer()
    const [listing, setListing] = useState<ListingDetail | null>(null)
    const [distanceKm, setDistanceKm] = useState<number | null>(null)
    const [listingCount, setListingCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const [detail, { data: { user } }] = await Promise.all([
                getListingDetail(supabase, params.id),
                supabase.auth.getUser(),
            ])
            setListing(detail)
            if (detail) {
                getListingsByUser(supabase, detail.user_id).then((listings) =>
                    setListingCount(listings.length)
                )
            }
            if (detail?.user?.h3_index && user) {
                const { data: me } = await supabase
                    .from("profiles")
                    .select("h3_index")
                    .eq("id", user.id)
                    .maybeSingle()
                if (me?.h3_index) {
                    setDistanceKm(gridDistance(me.h3_index, detail.user.h3_index) * 1.22)
                }
            }
            setLoading(false)
        }
        load()
    }, [params.id])

    const handleMessage = () =>
        openMessage({ id: listing!.user_id, name: listing!.user?.name ?? null })
    const handleOffer = () =>
        openOffer(listing!.user_id, listing!.user?.name ?? null, {
            theirWorkIds: listing!.books?.work_id ? [listing!.books.work_id] : [],
        })

    return (
        <Page>
                {loading ? (
                    <div className="flex flex-col gap-6 animate-pulse">
                        <div className="flex gap-4">
                            <div className="w-20 h-28 bg-muted rounded shrink-0" />
                            <div className="flex flex-col gap-3 flex-1">
                                <div className="h-5 bg-muted rounded w-3/4" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                                <div className="h-4 bg-muted rounded w-1/3" />
                            </div>
                        </div>
                        <div className="h-12 bg-muted rounded" />
                    </div>
                ) : !listing ? (
                    <p className="text-sm text-muted-foreground">Listing not found.</p>
                ) : (
                    <>
                        <div className="md:hidden">
                            <MobileListing listing={listing} distanceKm={distanceKm} listingCount={listingCount} onMessage={handleMessage} onOffer={handleOffer} />
                        </div>
                        <div className="hidden md:block">
                            <DesktopListing listing={listing} distanceKm={distanceKm} listingCount={listingCount} onMessage={handleMessage} onOffer={handleOffer} />
                        </div>
                    </>
                )}
        </Page>
    )
}
