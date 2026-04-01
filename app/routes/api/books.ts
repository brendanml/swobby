import type { LoaderFunctionArgs } from "react-router"
import { searchBooks } from "~/adapters/books"

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    const query = url.searchParams.get("q") ?? ""
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10)
    const books = query ? await searchBooks(query, offset).catch((e) => { console.error("searchBooks error:", e); return [] }) : []
    return { books }
}
