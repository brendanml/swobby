import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { Pencil, Trash2, Plus } from "lucide-react"
import { supabase } from "~/lib/supabase/client"
import { getWantsByUser, type Want } from "~/adapters/listings"
import { Page } from "~/components/page"
import { OwnedBookCard } from "~/components/owned-book-card"
import { BookCover } from "~/components/book-cover"
import { FilterSearch } from "~/components/filter-search"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { ADD_WANT } from "~/utils/nav-links"

function MobileWants({ wants }: { wants: Want[] }) {
    const [query, setQuery] = useState("")
    const filtered = wants.filter((w) => w.books?.title?.toLowerCase().includes(query.toLowerCase()))

    return (
        <div className="flex flex-col gap-3 max-w-md">
            <Link
                to={ADD_WANT.to}
                className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-3 py-2 rounded-xl"
            >
                <Plus className="size-3.5" /> Add want
            </Link>
            <FilterSearch value={query} onChange={setQuery} placeholder="Filter wants..." />
            {filtered.map((want) => (
                <OwnedBookCard
                    key={want.id}
                    coverUrl={want.books?.cover_url ?? null}
                    title={want.books?.title ?? ""}
                    authorName={want.books?.author_name}
                    condition={want.condition}
                    editTo={`/wants/edit/${want.id}`}
                    deleteTo={`/wants/delete/${want.id}`}
                />
            ))}
        </div>
    )
}

function DesktopWants({ wants }: { wants: Want[] }) {
    const navigate = useNavigate()
    const [query, setQuery] = useState("")
    const filtered = wants.filter((w) => w.books?.title?.toLowerCase().includes(query.toLowerCase()))

    return (
        <div className="flex flex-col gap-3">
            <div className="px-4 pt-4">
                <FilterSearch value={query} onChange={setQuery} placeholder="Filter wants..." className="max-w-xs" />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10" />
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead className="w-16" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow onClick={() => navigate(ADD_WANT.to)} className="cursor-pointer bg-primary hover:bg-primary-bold border-none">
                        <TableCell colSpan={5} className="text-primary-foreground text-sm font-medium">
                            <span className="flex items-center gap-2">
                                <Plus className="size-3.5" /> Add want
                            </span>
                        </TableCell>
                    </TableRow>
                    {filtered.map((want) => (
                        <TableRow key={want.id}>
                            <TableCell>
                                <BookCover size="sm" url={want.books?.cover_url ?? null} title={want.books?.title ?? ""} />
                            </TableCell>
                            <TableCell className="font-medium max-w-48 truncate">{want.books?.title}</TableCell>
                            <TableCell className="text-muted-foreground max-w-36 truncate">{want.books?.author_name ?? "—"}</TableCell>
                            <TableCell className="text-muted-foreground capitalize">{want.condition}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 justify-end">
                                    <Link to={`/wants/edit/${want.id}`} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                                        <Pencil className="size-3.5" />
                                    </Link>
                                    <Link to={`/wants/delete/${want.id}`} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
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
                <div className="flex flex-col gap-3 max-w-md animate-pulse">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl" />)}
                </div>
            ) : (
                <>
                    <div className="md:hidden">
                        <MobileWants wants={wants} />
                    </div>
                    <div className="hidden md:block">
                        <DesktopWants wants={wants} />
                    </div>
                </>
            )}
        </Page>
    )
}
