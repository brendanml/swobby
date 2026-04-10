/**
 * Migrates existing books to the new open_library_image / google_image columns.
 *
 * Run with:
 *   node --env-file=.env scripts/migrate-book-images.mjs
 *
 * If RLS blocks updates, add a SUPABASE_SERVICE_ROLE_KEY to .env and it will
 * be used automatically.
 */

import { createClient } from "@supabase/supabase-js"

// SUPABASE_URL (no VITE_ prefix) can be set in .env to override
const rawUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ""
// Strip any path — Supabase client needs the bare origin
const SUPABASE_URL = rawUrl ? new URL(rawUrl).origin : ""
const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_KEY
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY in .env")
    process.exit(1)
}

console.log(`Supabase URL: ${SUPABASE_URL}`)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const BATCH_SIZE = 100
const GOOGLE_DELAY_MS = 250 // stay under Google Books rate limit

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Upgrade a stored Open Library cover URL from M/S size to L size. */
function deriveOpenLibraryImage(coverUrl) {
    if (!coverUrl?.includes("covers.openlibrary.org")) return null
    return coverUrl.replace(/-[MS]\.jpg$/, "-L.jpg")
}

async function fetchGoogleImage(title, authorName) {
    try {
        const q = authorName
            ? `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(authorName)}`
            : `intitle:${encodeURIComponent(title)}`
        const key = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : ""
        const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&printType=books${key}`
        const res = await fetch(url)
        if (!res.ok) return null
        const data = await res.json()
        const links = data.items?.[0]?.volumeInfo?.imageLinks
        const image =
            links?.large ??
            links?.medium ??
            links?.small ??
            links?.thumbnail ??
            links?.smallThumbnail ??
            null
        return image ? image.replace("http://", "https://") : null
    } catch {
        return null
    }
}

async function main() {
    let offset = 0
    let total = 0
    let updated = 0
    let skipped = 0

    console.log("Starting book image migration...\n")

    while (true) {
        const { data: books, error } = await supabase
            .from("books")
            .select("work_id, title, author_name, cover_url, open_library_image, google_image")
            .range(offset, offset + BATCH_SIZE - 1)

        if (error) {
            console.error("Fetch error:", error.message)
            break
        }
        if (!books || books.length === 0) break

        for (const book of books) {
            total++

            // Skip if both columns are already filled
            if (book.open_library_image && book.google_image) {
                skipped++
                continue
            }

            const open_library_image =
                book.open_library_image ?? deriveOpenLibraryImage(book.cover_url)

            let google_image = book.google_image
            if (!google_image) {
                google_image = await fetchGoogleImage(book.title, book.author_name)
                await sleep(GOOGLE_DELAY_MS)
            }

            const { error: updateError } = await supabase
                .from("books")
                .update({ open_library_image, google_image })
                .eq("work_id", book.work_id)

            if (updateError) {
                console.error(`  ✗ [${book.work_id}] ${book.title}: ${updateError.message}`)
            } else {
                updated++
                const olStatus = open_library_image ? "✓ OL" : "✗ OL"
                const gStatus = google_image ? "✓ G" : "✗ G"
                console.log(`  ${olStatus}  ${gStatus}  ${book.title}`)
            }
        }

        offset += books.length
        if (books.length < BATCH_SIZE) break
    }

    console.log(`\nDone. ${updated} updated, ${skipped} already complete, ${total} total.`)
}

main()
