import { useState, useEffect } from "react"
import { Form, useNavigation, useActionData, useNavigate } from "react-router"
import { createClient } from "~/lib/supabase/server"
import { Page } from "~/components/page"
import { BookSearch } from "~/components/book/search"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { BookCover } from "~/components/book/cover"
import { upsertBook, createWant } from "~/adapters/listings"
import type { Book } from "~/adapters/open-library"
import type { Route } from "./+types/create"

export async function action({ request }: Route.ActionArgs) {
    const { supabase } = createClient(request)
    const {
        data: { user },
    } = await supabase.auth.getUser()
    const formData = await request.formData()

    const work_id = formData.get("work_id") as string

    await upsertBook(supabase, {
        work_id,
        title: formData.get("title") as string,
        cover_url: formData.get("cover_url") as string,
        author_name: formData.get("author_name") as string,
        first_publish_year: formData.get("first_publish_year") as string,
    })

    const { error } = await createWant(supabase, {
        userId: user!.id,
        workId: work_id,
    })

    if (error) console.error("wants insert error:", error)

    return { success: !error }
}

export default function Wants() {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null)
    const navigation = useNavigation()
    const actionData = useActionData<typeof action>()
    const navigate = useNavigate()
    const submitting = navigation.state === "submitting"

    useEffect(() => {
        if (actionData?.success) navigate("/wants")
    }, [actionData])

    return (
        <Page>
            <BookSearch onSelect={setSelectedBook} />

            {selectedBook && (
                <Form method="post" className="flex flex-col gap-4 max-w-md">
                    <input type="hidden" name="work_id" value={selectedBook.work_id} />
                    <input type="hidden" name="title" value={selectedBook.title} />
                    <input type="hidden" name="cover_url" value={selectedBook.cover_url ?? ""} />
                    <input type="hidden" name="author_name" value={selectedBook.author_name ?? ""} />
                    <input type="hidden" name="first_publish_year" value={selectedBook.first_publish_year ?? ""} />

                    <div className="flex items-center gap-3 border rounded-xl p-3">
                        <BookCover
                            size="sm"
                            url={selectedBook.cover_url ?? null}
                            title={selectedBook.title}
                        />
                        <div>
                            <p className="font-medium text-sm">{selectedBook.title}</p>
                            {selectedBook.author_name && (
                                <p className="text-xs text-muted-foreground">{selectedBook.author_name}</p>
                            )}
                        </div>
                    </div>

                    <Button type="submit" disabled={submitting}>
                        {submitting && <Spinner />}
                        {submitting ? "Adding..." : "Add to Wants"}
                    </Button>
                </Form>
            )}
        </Page>
    )
}
