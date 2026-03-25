export interface Book {
    key: string
    title: string
    author_name?: string
    first_publish_year?: number
    cover_i: number
    work_id: string
    cover_url?: string | null
}


export async function searchBooks(query: string, limit = 10): Promise<Book[]> {
    const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
    )

    if (!response.ok) throw new Error("Failed to fetch books")

    const data = await response.json()
    // console.log(data)
    return data.docs.map((doc: any): Book => ({
        key: doc.key,
        title: doc.title,
        cover_i: doc.cover_i,
        author_name: doc.author_name?.[0],
        first_publish_year: doc.first_publish_year,
        work_id: doc.key?.replace("/works/", "") ?? "",
        cover_url: doc.cover_i ? getBookCoverUrl(doc.cover_i) : null
    }))
}

export function getBookCoverUrl(cover_i: number, size: "S" | "M" | "L" = "M"): string {
    return `https://covers.openlibrary.org/b/id/${cover_i}-${size}.jpg`
}


