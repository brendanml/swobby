import { useState } from "react"
import { Form, redirect } from "react-router"
import { createClient } from "~/lib/supabase/server"
import { Page } from "~/components/page"
import { MY_WANTS } from "~/utils/nav-links"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { BookCover } from "~/components/book-cover"
import { getWantById, updateWant } from "~/adapters/listings"
import type { Route } from "./+types/edit-want"

export async function loader({ request, params }: Route.LoaderArgs) {
    const { supabase } = createClient(request)
    const want = await getWantById(supabase, params.id)
    if (!want) throw new Response("Not found", { status: 404 })
    return { want }
}

export async function action({ request, params }: Route.ActionArgs) {
    const { supabase } = createClient(request)
    const formData = await request.formData()

    await updateWant(supabase, params.id, {
        condition: formData.get("condition") as string,
    })

    return redirect(MY_WANTS.to)
}

const CONDITIONS = ["new", "good", "poor"] as const

export default function EditWant({ loaderData }: Route.ComponentProps) {
    const { want } = loaderData
    const [condition, setCondition] = useState(want.condition)

    return (
        <Page>
            <Form method="post" className="flex flex-col gap-4 max-w-md">
                <input type="hidden" name="condition" value={condition} />

                <div className="flex items-center gap-3 border rounded-xl p-3">
                    <BookCover size="sm" url={want.books?.cover_url ?? null} title={want.books?.title ?? ""} />
                    <div>
                        <p className="font-medium text-sm">{want.books?.title}</p>
                        {want.books?.author_name && (
                            <p className="text-xs text-muted-foreground">{want.books.author_name}</p>
                        )}
                    </div>
                </div>

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
