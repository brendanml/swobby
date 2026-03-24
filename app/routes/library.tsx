import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { Pencil, Trash2, Plus } from "lucide-react"
import { supabase } from "~/lib/supabase/client"
import { getListingsByUser, type Listing } from "~/adapters/listings"
import { Page } from "~/components/page"
import { OwnedBookCard } from "~/components/owned-book-card"
import { BookCover } from "~/components/book-cover"
import { FilterSearch } from "~/components/filter-search"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { useUser } from "~/context/user"
import { ADD_BOOK } from "~/utils/nav-links"

function MobileLibrary({ listings }: { listings: Listing[] }) {
    const [query, setQuery] = useState("")
    const filtered = listings.filter((l) => l.books?.title?.toLowerCase().includes(query.toLowerCase()))

    return (
        <div className="flex flex-col gap-3 max-w-md">
            <Link
                to={ADD_BOOK.to}
                className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-3 py-2 rounded-xl"
            >
                <Plus className="size-3.5" /> Add book
            </Link>
            <FilterSearch value={query} onChange={setQuery} placeholder="Filter books..." />
            {filtered.map((listing) => (
                <OwnedBookCard
                    key={listing.id}
                    coverUrl={listing.books?.cover_url ?? null}
                    title={listing.books?.title ?? ""}
                    authorName={listing.books?.author_name}
                    condition={listing.condition}
                    description={listing.description}
                    editTo={`/listings/books/edit/${listing.id}`}
                    deleteTo={`/listings/books/delete/${listing.id}`}
                />
            ))}
        </div>
    )
}

function DesktopLibrary({ listings }: { listings: Listing[] }) {
    const navigate = useNavigate()
    const [query, setQuery] = useState("")
    const filtered = listings.filter((l) => l.books?.title?.toLowerCase().includes(query.toLowerCase()))

    return (
        <div className="flex flex-col gap-3">
            <div className="px-4 pt-4">
                <FilterSearch value={query} onChange={setQuery} placeholder="Filter books..." className="max-w-xs" />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10" />
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="w-16" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow onClick={() => navigate(ADD_BOOK.to)} className="cursor-pointer bg-primary hover:bg-primary-bold border-none">
                        <TableCell colSpan={6} className="text-primary-foreground text-sm font-medium">
                            <span className="flex items-center gap-2">
                                <Plus className="size-3.5" /> Add book
                            </span>
                        </TableCell>
                    </TableRow>
                    {filtered.map((listing) => (
                        <TableRow key={listing.id}>
                            <TableCell>
                                <BookCover size="sm" url={listing.books?.cover_url ?? null} title={listing.books?.title ?? ""} />
                            </TableCell>
                            <TableCell className="font-medium max-w-48 truncate">{listing.books?.title}</TableCell>
                            <TableCell className="text-muted-foreground max-w-36 truncate">{listing.books?.author_name ?? "—"}</TableCell>
                            <TableCell className="text-muted-foreground capitalize">{listing.condition}</TableCell>
                            <TableCell className="text-muted-foreground max-w-48 truncate">{listing.description ?? "—"}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 justify-end">
                                    <Link to={`/listings/books/edit/${listing.id}`} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                                        <Pencil className="size-3.5" />
                                    </Link>
                                    <Link to={`/listings/books/delete/${listing.id}`} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="size-3.5" />
                                    </Link>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

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

    return (
        <Page className="md:p-0">
            {loading ? (
                <div className="flex flex-col gap-3 max-w-md animate-pulse">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}
                </div>
            ) : (
                <>
                    <div className="md:hidden">
                        <MobileLibrary listings={listings} />
                    </div>
                    <div className="hidden md:block">
                        <DesktopLibrary listings={listings} />
                    </div>
                </>
            )}
        </Page>
    )
}
