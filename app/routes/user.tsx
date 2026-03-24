import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase/client"
import { getListingsByUser } from "~/adapters/listings"
import { getProfileName } from "~/adapters/profiles"
import { useMessages } from "~/context/messages"
import { useOffer } from "~/context/offer"
import { Button } from "~/components/ui/button"
import { Page } from "~/components/page"
import type { Route } from "./+types/user"

export default function UserProfile({ params }: Route.ComponentProps) {
    const { openMessage } = useMessages()
    const { openOffer } = useOffer()
    const [name, setName] = useState<string | null>(null)
    const [listings, setListings] = useState<
        Awaited<ReturnType<typeof getListingsByUser>>
    >([])

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            getProfileName(supabase, params.id),
            getListingsByUser(supabase, params.id),
        ]).then(([profileName, listingsData]) => {
            setName(profileName)
            setListings(listingsData)
            setLoading(false)
        })
    }, [params.id])

    return (
        <Page>
            {loading ? (
                <div className="flex flex-col gap-4 max-w-md animate-pulse">
                    <div className="h-6 bg-muted rounded w-32" />
                    <div className="h-16 bg-muted rounded" />
                    <div className="h-16 bg-muted rounded" />
                </div>
            ) : (
                <div className="flex flex-col gap-6 max-w-md">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            {name ?? "Unknown"}
                        </h2>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => openOffer(params.id, name)}
                            >
                                Make Offer
                            </Button>
                            <Button
                                size="sm"
                                onClick={() =>
                                    openMessage({ id: params.id, name })
                                }
                            >
                                Message
                            </Button>
                        </div>
                    </div>

                    {listings.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No listings yet.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {listings.map((listing) => (
                                <div
                                    key={listing.id}
                                    className="flex gap-3 p-3 border rounded-md"
                                >
                                    {listing.books?.cover_url && (
                                        <img
                                            src={listing.books.cover_url}
                                            alt={listing.books.title ?? ""}
                                            className="w-12 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <p className="font-medium">
                                            {listing.books?.title}
                                        </p>
                                        {listing.books?.author_name && (
                                            <p className="text-sm text-muted-foreground">
                                                {listing.books.author_name}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {listing.condition}
                                        </p>
                                        {listing.description && (
                                            <p className="text-sm">
                                                {listing.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Page>
    )
}
