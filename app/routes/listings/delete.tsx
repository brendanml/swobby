import { Form, redirect } from "react-router"
import { createClient } from "~/lib/supabase/server"
import { Page } from "~/components/page"
import { MY_LIBRARY } from "~/utils/nav-links"
import { Button } from "~/components/ui/button"
import { BookCover } from "~/components/book/cover"
import { getListingById, deleteListing } from "~/adapters/listings"
import { bookImage } from "~/lib/book-image"
import type { Route } from "./+types/delete"

export async function loader({ request, params }: Route.LoaderArgs) {
    const { supabase } = createClient(request)
    const listing = await getListingById(supabase, params.id)
    if (!listing) throw new Response("Not found", { status: 404 })
    return { listing }
}

export async function action({ request, params }: Route.ActionArgs) {
    const { supabase } = createClient(request)
    await deleteListing(supabase, params.id)
    return redirect(MY_LIBRARY.to)
}

export default function DeleteListing({ loaderData }: Route.ComponentProps) {
    const { listing } = loaderData

    return (
        <Page>
            <div className="flex flex-col gap-6 max-w-md">
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                    <BookCover size="sm" url={bookImage(listing.books)} title={listing.books?.title ?? ""} />
                    <div>
                        <p className="font-medium text-sm">{listing.books?.title}</p>
                        {listing.books?.author_name && (
                            <p className="text-xs text-muted-foreground">{listing.books.author_name}</p>
                        )}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">Are you sure you want to remove this listing? This cannot be undone.</p>
                <Form method="post">
                    <Button type="submit" variant="destructive">Delete listing</Button>
                </Form>
            </div>
        </Page>
    )
}
