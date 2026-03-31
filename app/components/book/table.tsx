import { useState } from "react"
import { Link } from "react-router"
import { Pencil, Trash2, Plus, Check } from "lucide-react"
import { Button } from "~/components/ui/button"
import { FilterSearch } from "~/components/filter-search"
import { BookCover } from "~/components/book/cover"
import { OwnedBookCard } from "~/components/book/owned-card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"

export interface BookTableItem {
    id: string
    books: {
        title: string
        author_name: string | null
        cover_url: string | null
    } | null
    condition?: string
    description?: string | null
    status?: string
}

const STATUS_OPTIONS = ["available", "pending", "sold"] as const

interface BookTableProps {
    items: BookTableItem[]
    onAdd: () => void
    addLabel: string
    filterPlaceholder?: string
    editTo?: (id: string) => string
    deleteTo: (id: string) => string
    showDescription?: boolean
    showStatus?: boolean
    onStatusChange?: (ids: string[], status: string) => void
}

function Checkbox({
    checked,
    indeterminate,
    onChange,
}: {
    checked: boolean
    indeterminate?: boolean
    onChange: () => void
}) {
    return (
        <div
            onClick={(e) => {
                e.stopPropagation()
                onChange()
            }}
            className={`size-4 shrink-0 rounded-sm border flex items-center justify-center cursor-pointer transition-colors ${
                checked || indeterminate
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/40 hover:border-muted-foreground"
            }`}
        >
            {checked && (
                <Check
                    className="size-3 text-primary-foreground"
                    strokeWidth={3}
                />
            )}
            {!checked && indeterminate && (
                <div className="w-2 h-0.5 bg-primary-foreground rounded" />
            )}
        </div>
    )
}

export function BookTable({
    items,
    onAdd,
    addLabel,
    filterPlaceholder = "Filter...",
    editTo,
    deleteTo,
    showDescription = false,
    showStatus = false,
    onStatusChange,
}: BookTableProps) {
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(
        showStatus ? "available" : null,
    )
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const filtered = items.filter((i) => {
        const matchesQuery = i.books?.title
            ?.toLowerCase()
            .includes(query.toLowerCase())
        const matchesStatus = statusFilter === null || i.status === statusFilter
        return matchesQuery && matchesStatus
    })

    const allSelected =
        filtered.length > 0 && filtered.every((i) => selected.has(i.id))
    const someSelected = filtered.some((i) => selected.has(i.id))
    const selectedInView = filtered.filter((i) => selected.has(i.id))

    function toggleAll() {
        if (allSelected) {
            setSelected((s) => {
                const n = new Set(s)
                filtered.forEach((i) => n.delete(i.id))
                return n
            })
        } else {
            setSelected((s) => {
                const n = new Set(s)
                filtered.forEach((i) => n.add(i.id))
                return n
            })
        }
    }

    function toggleOne(id: string) {
        setSelected((s) => {
            const n = new Set(s)
            n.has(id) ? n.delete(id) : n.add(id)
            return n
        })
    }

    function handleStatusChange(status: string) {
        const ids = [...selected].filter((id) =>
            filtered.some((i) => i.id === id),
        )
        onStatusChange?.(ids, status)
        setSelected(new Set())
    }

    const colSpan = [
        1,
        1,
        1,
        1,
        1,
        showDescription ? 1 : 0,
        showStatus ? 1 : 0,
        1,
    ].reduce((a, b) => a + b, 0)

    const actionRow = (
        <div className="flex items-center gap-2 flex-wrap">
            <FilterSearch
                value={query}
                onChange={setQuery}
                placeholder={filterPlaceholder}
                className="max-w-xs"
            />
            {showStatus && (
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant={
                            statusFilter === null ? "secondary" : "outline"
                        }
                        onClick={() => setStatusFilter(null)}
                        className="rounded-full"
                    >
                        All
                    </Button>
                    {STATUS_OPTIONS.map((s) => (
                        <Button
                            key={s}
                            size="sm"
                            variant={
                                statusFilter === s ? "secondary" : "outline"
                            }
                            onClick={() => setStatusFilter(s)}
                            className="rounded-full capitalize"
                        >
                            {s}
                        </Button>
                    ))}
                </div>
            )}
            <Button className="ml-auto" onClick={onAdd}>
                <Plus className="size-3.5" /> {addLabel}
            </Button>
        </div>
    )

    const bulkBar = selectedInView.length > 0 && onStatusChange && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/60 rounded-lg text-sm">
            <span className="text-muted-foreground text-xs">
                {selectedInView.length} selected
            </span>
            <div className="flex gap-1.5 ml-auto">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleStatusChange("available")}
                >
                    Mark Available
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleStatusChange("pending")}
                >
                    Mark Pending
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleStatusChange("sold")}
                >
                    Mark Sold
                </Button>
            </div>
        </div>
    )

    return (
        <>
            {/* Mobile */}
            <div className="flex flex-col gap-3 md:hidden">
                {actionRow}
                {bulkBar}
                {filtered.map((item) => (
                    <OwnedBookCard
                        key={item.id}
                        coverUrl={item.books?.cover_url ?? null}
                        title={item.books?.title ?? ""}
                        authorName={item.books?.author_name}
                        condition={item.condition}
                        description={
                            showDescription ? item.description : undefined
                        }
                        status={showStatus ? item.status : undefined}
                        editTo={editTo ? editTo(item.id) : undefined}
                        deleteTo={deleteTo(item.id)}
                        selected={selected.has(item.id)}
                        onToggleSelect={() => toggleOne(item.id)}
                    />
                ))}
                {filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground">No results.</p>
                )}
            </div>

            {/* Desktop */}
            <div className="hidden md:flex flex-col gap-3">
                <div className="px-4 pt-4 flex flex-col gap-2">
                    {actionRow}
                    {bulkBar}
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-8 pl-4">
                                <Checkbox
                                    checked={allSelected}
                                    indeterminate={someSelected && !allSelected}
                                    onChange={toggleAll}
                                />
                            </TableHead>
                            <TableHead className="w-10" />
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            {items.some((i) => i.condition) && (
                                <TableHead>Condition</TableHead>
                            )}
                            {showDescription && <TableHead>Notes</TableHead>}
                            {showStatus && <TableHead>Status</TableHead>}
                            <TableHead className="w-16" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((item) => (
                            <TableRow
                                key={item.id}
                                className={
                                    selected.has(item.id) ? "bg-muted/40" : ""
                                }
                                onClick={() => toggleOne(item.id)}
                            >
                                <TableCell
                                    className="pl-4"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Checkbox
                                        checked={selected.has(item.id)}
                                        onChange={() => toggleOne(item.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <BookCover
                                        size="xs"
                                        url={item.books?.cover_url ?? null}
                                        title={item.books?.title ?? ""}
                                    />
                                </TableCell>
                                <TableCell className="font-medium max-w-48 truncate">
                                    {item.books?.title}
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-36 truncate">
                                    {item.books?.author_name ?? "—"}
                                </TableCell>
                                {items.some((i) => i.condition) && (
                                    <TableCell className="text-muted-foreground capitalize">
                                        {item.condition ?? "—"}
                                    </TableCell>
                                )}
                                {showDescription && (
                                    <TableCell className="text-muted-foreground max-w-48 truncate">
                                        {item.description ?? "—"}
                                    </TableCell>
                                )}
                                {showStatus && (
                                    <TableCell>
                                        {item.status && (
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize bg-muted text-muted-foreground">
                                                {item.status}
                                            </span>
                                        )}
                                    </TableCell>
                                )}
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-1 justify-end">
                                        {editTo && (
                                            <Link
                                                to={editTo(item.id)}
                                                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <Pencil className="size-3.5" />
                                            </Link>
                                        )}
                                        <Link
                                            to={deleteTo(item.id)}
                                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={colSpan}
                                    className="text-center text-sm text-muted-foreground"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}
