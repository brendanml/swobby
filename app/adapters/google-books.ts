export async function getBookCover(title: string): Promise<string | null> {
    const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1`
    )

    if (!response.ok) throw new Error("Failed to fetch book cover")

    const data = await response.json()
    return data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ?? null
}
