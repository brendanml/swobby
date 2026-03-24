import { useState, useEffect } from "react"
import { useFetcher } from "react-router"
import { Input } from "~/components/ui/input"
import { BookCover } from "~/components/book-cover"
import type { Book } from "~/adapters/open-library"

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
    const [selectedBook, setSelectedBook] = useState<Book | null>(null)
    const fetcher = useFetcher()
    const debouncedQuery = useDebounce(query, 500)

    useEffect(() => {
        if (!debouncedQuery) return
        fetcher.load(`/listings/books/create?q=${encodeURIComponent(debouncedQuery)}`)
    }, [debouncedQuery])

    const books: Book[] = query ? (fetcher.data?.books ?? []) : []

    function handleSelect(book: Book) {
        setSelectedBook(book)
        setQuery("")
        onSelect(book)
    }

    return (
        <div className="flex flex-col gap-3 max-w-md">
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books..."
            />
            {books.length > 0 && (
                <div className="flex flex-col gap-1 border rounded-xl overflow-hidden">
                    {books.map((book, i) => (
                        <button
                            key={book.work_id}
                            type="button"
                            onClick={() => handleSelect(book)}
                            className={`flex items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors ${
                                selectedBook?.work_id === book.work_id ? "bg-muted" : ""
                            } ${i !== 0 ? "border-t" : ""}`}
                        >
                            <BookCover size="xs" url={book.cover_url ?? null} title={book.title} />
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">{book.title}</span>
                                {book.author_name && <span className="text-xs text-muted-foreground truncate">{book.author_name}</span>}
                                {book.first_publish_year && <span className="text-xs text-muted-foreground">{book.first_publish_year}</span>}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
