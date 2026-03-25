import { useEffect, useState } from "react"
import { supabase } from "~/lib/supabase/client"
import { getWantsByUser, type Want } from "~/adapters/listings"
import { Page } from "~/components/page"
import { BookTable } from "~/components/book/table"

export default function MyWantsPage() {
    const [wants, setWants] = useState<Want[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return setLoading(false)
            getWantsByUser(supabase, user.id).then((data) => {
                setWants(data)
                setLoading(false)
            })
        })
    }, [])

    return (
        <Page className="md:p-0">
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted-foreground border-t-transparent" />
                </div>
            ) : (
                <BookTable
                    items={wants}
                    addTo="/wants/books/create"
                    addLabel="Add want"
                    filterPlaceholder="Filter wants..."
                    deleteTo={(id) => `/wants/delete/${id}`}
                />
            )}
        </Page>
    )
}
