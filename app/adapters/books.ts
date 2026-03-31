import { searchBooks as searchOpenLibrary, type Book } from "./open-library"
import { getBookCover } from "./google-books"

export type { Book }

const GOOGLE_COVERS = true

export async function searchBooks(query: string, offset = 0): Promise<Book[]> {
    const books = await searchOpenLibrary(query, 10, offset)
    if (!GOOGLE_COVERS) return books

    return Promise.all(
        books.map(async (book) => {
            const cover = await getBookCover(book.title, book.author_name)
            return cover ? { ...book, cover_url: cover } : book
        }),
    )
}
