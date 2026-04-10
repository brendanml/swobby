import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase/client"
import { useUser } from "~/context/user"
import { upsertBook, createListing, getListingWorkIdsByUser } from "~/adapters/listings"
import { Panel } from "~/components/panel"
import { BookSearch } from "~/components/book/search"
import { BookCover } from "~/components/book/cover"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { Textarea } from "~/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "~/components/ui/dialog"
import type { Book } from "~/adapters/books"
import { bookImage } from "~/lib/book-image"

const CONDITIONS = ["new", "good", "poor"] as const

interface AddListingPanelProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export function AddListingPanel({ open, onClose, onSuccess }: AddListingPanelProps) {
    const { user } = useUser()
    const [selectedBook, setSelectedBook] = useState<Book | null>(null)
    const [condition, setCondition] = useState<string>(CONDITIONS[1])
    const [description, setDescription] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [existingWorkIds, setExistingWorkIds] = useState<string[]>([])
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingBook, setPendingBook] = useState<Book | null>(null)

    useEffect(() => {
        if (!open || !user) return
        setSelectedBook(null)
        setCondition(CONDITIONS[1])
        setDescription("")
        getListingWorkIdsByUser(supabase, user.id).then(setExistingWorkIds)
    }, [open, user])

    function handleBookSelect(book: Book) {
        if (existingWorkIds.includes(book.work_id)) {
            setPendingBook(book)
            setConfirmOpen(true)
        } else {
            setSelectedBook(book)
        }
    }

    async function handleSubmit() {
        if (!selectedBook || !user) return
        setSubmitting(true)
        try {
            await upsertBook(supabase, {
                work_id: selectedBook.work_id,
                title: selectedBook.title,
                open_library_image: selectedBook.open_library_image,
                google_image: selectedBook.google_image,
                author_name: selectedBook.author_name,
                first_publish_year: selectedBook.first_publish_year,
            })
            await createListing(supabase, {
                userId: user.id,
                workId: selectedBook.work_id,
                condition,
                description: description || null,
            })
            onSuccess()
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Panel
                open={open}
                onClose={onClose}
                title="Add Book"
                footer={
                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={submitting || !selectedBook}
                    >
                        {submitting && <Spinner data-icon="inline-start" />}
                        {submitting ? "Adding..." : "Create Listing"}
                    </Button>
                }
            >
                <BookSearch onSelect={handleBookSelect} />

                {selectedBook && (
                    <>
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                            <BookCover size="sm" url={bookImage(selectedBook)} title={selectedBook.title} />
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <p className="text-sm font-medium leading-tight">{selectedBook.title}</p>
                                {selectedBook.author_name && (
                                    <p className="text-xs text-muted-foreground truncate">{selectedBook.author_name}</p>
                                )}
                            </div>
                        </div>

                        <Select value={condition} onValueChange={setCondition}>
                            <SelectTrigger>
                                <SelectValue placeholder="Condition" />
                            </SelectTrigger>
                            <SelectContent>
                                {CONDITIONS.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c.charAt(0).toUpperCase() + c.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                            rows={3}
                        />
                    </>
                )}
            </Panel>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>You already have a listing for this book</DialogTitle>
                        <DialogDescription>
                            You already have an existing listing for{" "}
                            <strong>{pendingBook?.title}</strong>. Do you want to create another?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={() => { setSelectedBook(pendingBook); setConfirmOpen(false) }}>
                            List Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
