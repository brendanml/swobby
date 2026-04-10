export async function getBookCover(
    title: string,
    author?: string,
): Promise<string | null> {
    try {
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY
        const q = author
            ? `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`
            : `intitle:${encodeURIComponent(title)}`
        const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&printType=books${apiKey ? `&key=${apiKey}` : ""}`
        const response = await fetch(url)
        if (!response.ok) return null
        const data = await response.json()
        const links = data.items?.[0]?.volumeInfo?.imageLinks
        const image = links?.large ?? links?.medium ?? links?.small ?? links?.thumbnail ?? links?.smallThumbnail ?? null
        return image ? image.replace("http://", "https://") : null
    } catch {
        return null
    }
}

export interface GoogleBook {
    title: string
    author_name?: string
    first_publish_year?: number
    google_image?: string | null
    isbn?: string
}

export async function searchBooks(
    query: string,
    limit = 10,
): Promise<GoogleBook[]> {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${limit}&printType=books${apiKey ? `&key=${apiKey}` : ""}`
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch books from Google Books")
    const data = await response.json()
    return (data.items ?? []).map((item: any): GoogleBook => {
        const info = item.volumeInfo
        const isbn =
            info.industryIdentifiers?.find(
                (id: any) => id.type === "ISBN_13",
            )?.identifier ??
            info.industryIdentifiers?.find(
                (id: any) => id.type === "ISBN_10",
            )?.identifier ??
            undefined
        return {
            title: info.title ?? "Unknown",
            author_name: info.authors?.[0],
            first_publish_year: info.publishedDate
                ? parseInt(info.publishedDate)
                : undefined,
            google_image:
                (info.imageLinks?.large ?? info.imageLinks?.medium ?? info.imageLinks?.small ?? info.imageLinks?.thumbnail)?.replace("http://", "https://") ??
                null,
            isbn,
        }
    })
}
