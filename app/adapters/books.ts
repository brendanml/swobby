import { searchBooks as searchOpenLibrary, type Book } from "./open-library"
import { getBookCover } from "./google-books"

export type { Book }

export async function searchBooks(query: string, offset = 0): Promise<Book[]> {
    const books = await searchOpenLibrary(query, 10, offset)

    return Promise.all(
        books.map(async (book) => {
            const google = await getBookCover(book.title, book.author_name)
            return google ? { ...book, google_image: google } : book
        }),
    )
}
