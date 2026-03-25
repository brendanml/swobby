import { useEffect, useState } from "react"
import { supabase } from "~/lib/supabase/client"
import { getListingsByUser, updateListingStatuses, type Listing } from "~/adapters/listings"
import { Page } from "~/components/page"
import { BookTable } from "~/components/book/table"
import { useUser } from "~/context/user"

export default function LibraryPage() {
    const { user } = useUser()
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.id) return
        getListingsByUser(supabase, user.id).then((data) => {
            setListings(data)
            setLoading(false)
        })
    }, [user?.id])

    async function handleStatusChange(ids: string[], status: string) {
        await updateListingStatuses(supabase, ids, status)
        setListings((prev) => prev.map((l) => ids.includes(l.id) ? { ...l, status } : l))
    }

    return (
        <Page className="md:p-0">
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-muted-foreground border-t-transparent" />
                </div>
            ) : (
                <BookTable
                    items={listings}
                    addTo="/listings/books/create"
                    addLabel="Add book"
                    filterPlaceholder="Filter books..."
                    editTo={(id) => `/listings/books/edit/${id}`}
                    deleteTo={(id) => `/listings/books/delete/${id}`}
                    showDescription
                    showStatus
                    onStatusChange={handleStatusChange}
                />
            )}
        </Page>
    )
}
