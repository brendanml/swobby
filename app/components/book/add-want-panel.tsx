import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase/client"
import { useUser } from "~/context/user"
import { upsertBook, createWant } from "~/adapters/listings"
import { Panel } from "~/components/panel"
import { BookSearch } from "~/components/book/search"
import { BookCover } from "~/components/book/cover"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import type { Book } from "~/adapters/books"

interface AddWantPanelProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export function AddWantPanel({ open, onClose, onSuccess }: AddWantPanelProps) {
    const { user } = useUser()
    const [selectedBook, setSelectedBook] = useState<Book | null>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!open) return
        setSelectedBook(null)
    }, [open])

    async function handleSubmit() {
        if (!selectedBook || !user) return
        setSubmitting(true)
        try {
            await upsertBook(supabase, {
                work_id: selectedBook.work_id,
                title: selectedBook.title,
                cover_url: selectedBook.cover_url,
                author_name: selectedBook.author_name,
                first_publish_year: selectedBook.first_publish_year,
            })
            await createWant(supabase, { userId: user.id, workId: selectedBook.work_id })
            onSuccess()
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Panel
            open={open}
            onClose={onClose}
            title="Add Want"
            footer={
                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={submitting || !selectedBook}
                >
                    {submitting && <Spinner data-icon="inline-start" />}
                    {submitting ? "Adding..." : "Add to Wants"}
                </Button>
            }
        >
            <BookSearch onSelect={setSelectedBook} />

            {selectedBook && (
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <BookCover size="sm" url={selectedBook.cover_url ?? null} title={selectedBook.title} />
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <p className="text-sm font-medium leading-tight">{selectedBook.title}</p>
                        {selectedBook.author_name && (
                            <p className="text-xs text-muted-foreground truncate">{selectedBook.author_name}</p>
                        )}
                    </div>
                </div>
            )}
        </Panel>
    )
}
