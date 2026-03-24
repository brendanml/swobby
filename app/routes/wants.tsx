import { useState } from "react"
import { Form } from "react-router"
import { createClient } from "~/lib/supabase/server"
import { Page } from "~/components/page"
import { BookSearch } from "~/components/book-search"
import { Button } from "~/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import { BookCover } from "~/components/book-cover"
import { upsertBook, createWant } from "~/adapters/listings"
import type { Book } from "~/adapters/open-library"
import type { Route } from "./+types/wants"

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
        condition: formData.get("condition") as string,
    })

    if (error) console.error("wants insert error:", error)

    return { success: !error }
}

const CONDITIONS = ["new", "good", "poor"] as const

export default function Wants() {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null)
    const [condition, setCondition] = useState<string>(CONDITIONS[0])

    return (
        <Page>
            <BookSearch onSelect={setSelectedBook} />

            {selectedBook && (
                <Form method="post" className="flex flex-col gap-4 max-w-md">
                    <input
                        type="hidden"
                        name="work_id"
                        value={selectedBook.work_id}
                    />
                    <input
                        type="hidden"
                        name="title"
                        value={selectedBook.title}
                    />
                    <input
                        type="hidden"
                        name="cover_url"
                        value={selectedBook.cover_url ?? ""}
                    />
                    <input
                        type="hidden"
                        name="author_name"
                        value={selectedBook.author_name ?? ""}
                    />
                    <input
                        type="hidden"
                        name="first_publish_year"
                        value={selectedBook.first_publish_year ?? ""}
                    />
                    <input type="hidden" name="condition" value={condition} />

                    <div className="flex items-center gap-3 border rounded-xl p-3">
                        <BookCover
                            size="sm"
                            url={selectedBook.cover_url ?? null}
                            title={selectedBook.title}
                        />
                        <div>
                            <p className="font-medium text-sm">
                                {selectedBook.title}
                            </p>
                            {selectedBook.author_name && (
                                <p className="text-xs text-muted-foreground">
                                    {selectedBook.author_name}
                                </p>
                            )}
                        </div>
                    </div>

                    <Select value={condition} onValueChange={setCondition}>
                        <SelectTrigger>
                            <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent>
                            {CONDITIONS.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c.charAt(0).toUpperCase() + c.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button type="submit">Add to Wants</Button>
                </Form>
            )}
        </Page>
    )
}
