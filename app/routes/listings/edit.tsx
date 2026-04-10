import { useState } from "react"
import { Form, redirect } from "react-router"
import { createClient } from "~/lib/supabase/server"
import { Page } from "~/components/page"
import { MY_LIBRARY } from "~/utils/nav-links"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { BookCover } from "~/components/book/cover"
import { getListingById, updateListing } from "~/adapters/listings"
import { bookImage } from "~/lib/book-image"
import type { Route } from "./+types/edit"

export async function loader({ request, params }: Route.LoaderArgs) {
    const { supabase } = createClient(request)
    const listing = await getListingById(supabase, params.id)
    if (!listing) throw new Response("Not found", { status: 404 })
    return { listing }
}

export async function action({ request, params }: Route.ActionArgs) {
    const { supabase } = createClient(request)
    const formData = await request.formData()

    await updateListing(supabase, params.id, {
        condition: formData.get("condition") as string,
        description: formData.get("description") as string || null,
    })

    return redirect(MY_LIBRARY.to)
}

const CONDITIONS = ["new", "good", "poor"] as const

export default function EditListing({ loaderData }: Route.ComponentProps) {
    const { listing } = loaderData
    const [condition, setCondition] = useState(listing.condition)

    return (
        <Page>
            <Form method="post" className="flex flex-col gap-4 max-w-md">
                <input type="hidden" name="condition" value={condition} />

                <div className="flex items-center gap-3 border rounded-xl p-3">
                    <BookCover size="sm" url={bookImage(listing.books)} title={listing.books?.title ?? ""} />
                    <div>
                        <p className="font-medium text-sm">{listing.books?.title}</p>
                        {listing.books?.author_name && (
                            <p className="text-xs text-muted-foreground">{listing.books.author_name}</p>
                        )}
                    </div>
                </div>

                <Textarea
                    name="description"
                    placeholder="Description (optional)"
                    rows={3}
                    defaultValue={listing.description ?? ""}
                />

                <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger>
                        <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                        {CONDITIONS.map((c) => (
                            <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button type="submit">Save Changes</Button>
            </Form>
        </Page>
    )
}
