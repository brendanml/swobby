import { searchBooks as searchOpenLibrary, type Book } from "./open-library"

export async function searchBooks(query: string): Promise<Book[]> {
    return searchOpenLibrary(query)
}
