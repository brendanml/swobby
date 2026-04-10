export type ImageProvider = "open" | "google"

export function bookImage(
    book: { open_library_image?: string | null; google_image?: string | null } | null | undefined,
    provider: ImageProvider = "open",
): string | null {
    if (!book) return null
    if (provider === "google") return book.google_image ?? book.open_library_image ?? null
    return book.open_library_image ?? book.google_image ?? null
}
