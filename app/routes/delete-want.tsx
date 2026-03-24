import { Form, redirect } from "react-router"
import { createClient } from "~/lib/supabase/server"
import { Page } from "~/components/page"
import { MY_WANTS } from "~/utils/nav-links"
import { Button } from "~/components/ui/button"
import { BookCover } from "~/components/book-cover"
import { getWantById, deleteWant } from "~/adapters/listings"
import type { Route } from "./+types/delete-want"

export async function loader({ request, params }: Route.LoaderArgs) {
    const { supabase } = createClient(request)
    const want = await getWantById(supabase, params.id)
    if (!want) throw new Response("Not found", { status: 404 })
    return { want }
}

export async function action({ request, params }: Route.ActionArgs) {
    const { supabase } = createClient(request)
    await deleteWant(supabase, params.id)
    return redirect(MY_WANTS.to)
}

export default function DeleteWant({ loaderData }: Route.ComponentProps) {
    const { want } = loaderData

    return (
        <Page>
            <div className="flex flex-col gap-6 max-w-md">
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                    <BookCover size="sm" url={want.books?.cover_url ?? null} title={want.books?.title ?? ""} />
                    <div>
                        <p className="font-medium text-sm">{want.books?.title}</p>
                        {want.books?.author_name && (
                            <p className="text-xs text-muted-foreground">{want.books.author_name}</p>
                        )}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">Are you sure you want to remove this want? This cannot be undone.</p>
                <Form method="post">
                    <Button type="submit" variant="destructive">Delete want</Button>
                </Form>
            </div>
        </Page>
    )
}
