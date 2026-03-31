import { useEffect, useState } from "react"
import { supabase } from "~/lib/supabase/client"
import { getWantsByUser, type Want } from "~/adapters/listings"
import { Page } from "~/components/page"
import { BookTable } from "~/components/book/table"
import { AddWantPanel } from "~/components/book/add-want-panel"

export default function MyWantsPage() {
    const [wants, setWants] = useState<Want[]>([])
    const [loading, setLoading] = useState(true)
    const [addOpen, setAddOpen] = useState(false)

    function fetchWants() {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return setLoading(false)
            getWantsByUser(supabase, user.id).then((data) => {
                setWants(data)
                setLoading(false)
            })
        })
    }

    useEffect(() => {
        fetchWants()
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
                    onAdd={() => setAddOpen(true)}
                    addLabel="Add want"
                    filterPlaceholder="Filter wants..."
                    deleteTo={(id) => `/wants/delete/${id}`}
                />
            )}
            <AddWantPanel
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onSuccess={fetchWants}
            />
        </Page>
    )
}
