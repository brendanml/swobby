import { useState, useEffect } from "react"
import { gridDistance } from "h3-js"
import { MessageCircle, HandshakeIcon } from "lucide-react"
import { supabase } from "~/lib/supabase/client"
import { getListingsByUser } from "~/adapters/listings"
import { useMessages } from "~/context/messages"
import { useOffer } from "~/context/offer"
import { Page } from "~/components/page"
import { BookCard } from "~/components/book/card"
import { UserProfile } from "~/components/user/profile"
import { AuthProtectedButton } from "~/components/auth-protected-button"
import type { Route } from "./+types/user"

export default function UserProfilePage({ params }: Route.ComponentProps) {
    const { openMessage } = useMessages()
    const { openOffer } = useOffer()
    const [name, setName] = useState<string | null>(null)
    const [distanceKm, setDistanceKm] = useState<number | null>(null)
    const [listings, setListings] = useState<
        Awaited<ReturnType<typeof getListingsByUser>>
    >([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const [
                { data: profile },
                listingsData,
                {
                    data: { user },
                },
            ] = await Promise.all([
                supabase
                    .from("profiles")
                    .select("name, h3_index")
                    .eq("id", params.id)
                    .maybeSingle(),
                getListingsByUser(supabase, params.id),
                supabase.auth.getUser(),
            ])
            setName(profile?.name ?? null)
            setListings(listingsData)

            if (profile?.h3_index && user) {
                const { data: me } = await supabase
                    .from("profiles")
                    .select("h3_index")
                    .eq("id", user.id)
                    .maybeSingle()
                if (me?.h3_index) {
                    setDistanceKm(
                        gridDistance(me.h3_index, profile.h3_index) * 1.22,
                    )
                }
            }
            setLoading(false)
        }
        load()
    }, [params.id])

    const handleMessage = () => openMessage({ id: params.id, name })
    const handleOffer = () => openOffer(params.id, name)

    return (
        <Page>
            {loading ? (
                <div className="flex flex-col gap-6 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-muted" />
                        <div className="h-5 bg-muted rounded w-40" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="w-full aspect-2/3 bg-muted rounded-lg" />
                                <div className="h-3 bg-muted rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 mt-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <UserProfile
                                id={params.id}
                                name={name}
                                size="lg"
                                subtitle={
                                    distanceKm !== null
                                        ? `${Math.max(1, Math.round(distanceKm))} km away`
                                        : undefined
                                }
                                listingCount={listings.length}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <AuthProtectedButton
                            variant="outline"
                            onClick={handleMessage}
                        >
                            <MessageCircle className="size-4" />
                            Message
                        </AuthProtectedButton>
                        <AuthProtectedButton onClick={handleOffer}>
                            <HandshakeIcon className="size-4" />
                            Make Offer
                        </AuthProtectedButton>
                    </div>

                    {listings.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No listings yet.
                        </p>
                    ) : (
                        <div>
                            <p className="text-lg font-semibold mt-4 mb-3">
                                {name ? `${name}'s Listings` : "Listings"}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-1 md:gap-2">
                                {listings.map((listing) => (
                                    <BookCard
                                        key={listing.id}
                                        title={listing.books?.title ?? ""}
                                        coverUrl={listing.books?.cover_url}
                                        href={`/listings/${listing.id}`}
                                        owner={listing.books?.author_name ?? undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Page>
    )
}
