import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { BookCover } from "~/components/book/cover"
import type { Book } from "~/adapters/books"

const PAGE_SIZE = 10

function useDebounce(value: string, delay = 300) {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

export function BookSearch({ onSelect }: { onSelect: (book: Book) => void }) {
    const [query, setQuery] = useState("")
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const debouncedQuery = useDebounce(query, 500)

    // Refs to avoid stale closures in scroll handler
    const queryRef = useRef(debouncedQuery)
    const booksLengthRef = useRef(0)
    const hasMoreRef = useRef(false)
    const loadingMoreRef = useRef(false)
    queryRef.current = debouncedQuery
    booksLengthRef.current = books.length
    hasMoreRef.current = hasMore

    useEffect(() => {
        if (!debouncedQuery) {
            setBooks([])
            setHasMore(false)
            return
        }
        const controller = new AbortController()
        setLoading(true)
        setBooks([])
        setHasMore(false)
        fetch(`/api/books?q=${encodeURIComponent(debouncedQuery)}&offset=0`, {
            signal: controller.signal,
        })
            .then((r) => r.json())
            .then((data) => {
                const fetched: Book[] = data.books ?? []
                setBooks(fetched)
                setHasMore(fetched.length === PAGE_SIZE)
                setLoading(false)
            })
            .catch(() => setLoading(false))
        return () => controller.abort()
    }, [debouncedQuery])

    function handleScroll(e: React.UIEvent<HTMLDivElement>) {
        const el = e.currentTarget
        if (el.scrollHeight - el.scrollTop - el.clientHeight > 80) return
        if (!hasMoreRef.current || loadingMoreRef.current) return
        loadingMoreRef.current = true
        setLoadingMore(true)
        const offset = booksLengthRef.current
        const q = queryRef.current
        fetch(`/api/books?q=${encodeURIComponent(q)}&offset=${offset}`)
            .then((r) => r.json())
            .then((data) => {
                const fetched: Book[] = data.books ?? []
                setBooks((prev) => [...prev, ...fetched])
                setHasMore(fetched.length === PAGE_SIZE)
                loadingMoreRef.current = false
                setLoadingMore(false)
            })
            .catch(() => {
                loadingMoreRef.current = false
                setLoadingMore(false)
            })
    }

    function handleSelect(book: Book) {
        setQuery("")
        onSelect(book)
    }

    const showList = loading || books.length > 0

    return (
        <div className="flex flex-col gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search books..."
                    className="pl-9 pr-9"
                />
                {loading && (
                    <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                )}
            </div>

            {showList && (
                <div
                    className="flex flex-col border rounded-xl overflow-y-auto max-h-140"
                    onScroll={handleScroll}
                >
                    {loading && books.length === 0 ? (
                        <div className="flex justify-center py-6">
                            <Spinner className="size-4 text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            {books.map((book, i) => (
                                <button
                                    key={book.work_id}
                                    type="button"
                                    onClick={() => handleSelect(book)}
                                    className={`flex items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors shrink-0 ${i !== 0 ? "border-t" : ""}`}
                                >
                                    <BookCover
                                        size="xs"
                                        url={book.cover_url ?? null}
                                        title={book.title}
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate">
                                            {book.title}
                                        </span>
                                        {book.author_name && (
                                            <span className="text-xs text-muted-foreground truncate">
                                                {book.author_name}
                                            </span>
                                        )}
                                        {book.first_publish_year && (
                                            <span className="text-xs text-muted-foreground">
                                                {book.first_publish_year}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                            {loadingMore && (
                                <div className="flex justify-center py-3 border-t shrink-0">
                                    <Spinner className="size-4 text-muted-foreground" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
