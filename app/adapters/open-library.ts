export interface Book {
    key: string
    title: string
    author_name?: string
    first_publish_year?: number
    cover_i: number
    work_id: string
    open_library_image?: string | null
    google_image?: string | null
}

function olHeaders(): HeadersInit {
    const app = process.env.APP_NAME ?? "BookSwapApp"
    const contact = process.env.CONTACT_EMAIL ?? ""
    return {
        "User-Agent": `${app}${contact ? ` (${contact})` : ""}`,
    }
}

export async function searchBooks(query: string, limit = 10, offset = 0): Promise<Book[]> {
    const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
        { headers: olHeaders() },
    )

    if (!response.ok) throw new Error("Failed to fetch books")

    const data = await response.json()
    return data.docs.map((doc: any): Book => ({
        key: doc.key,
        title: doc.title,
        cover_i: doc.cover_i,
        author_name: doc.author_name?.[0],
        first_publish_year: doc.first_publish_year,
        work_id: doc.key?.replace("/works/", "") ?? "",
        open_library_image: doc.cover_i ? getBookCoverUrl(doc.cover_i, "L") : null,
        google_image: null,
    }))
}

export function getBookCoverUrl(
    cover_i: number,
    size: "S" | "M" | "L" = "M",
): string {
    return `https://covers.openlibrary.org/b/id/${cover_i}-${size}.jpg`
}

export async function getWorkIdByIsbn(isbn: string): Promise<string | null> {
    try {
        const response = await fetch(
            `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`,
            { headers: olHeaders() },
        )
        if (!response.ok) return null
        const data = await response.json()
        const workKey = data.works?.[0]?.key as string | undefined
        return workKey ? workKey.replace("/works/", "") : null
    } catch {
        return null
    }
}
