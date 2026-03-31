import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase/client"
import { getOffersByUser, type OfferSummary } from "~/adapters/offers"
import { Page } from "~/components/page"
import { OfferList } from "~/components/offer/list"

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
        <Page className="md:p-0">
            <OfferList
                offers={offers}
                userId={userId ?? ""}
                loading={loading}
            />
        </Page>
    )
}
