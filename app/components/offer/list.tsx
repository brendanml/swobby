import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { FilterSearch } from "~/components/filter-search"
import { BookStack } from "~/components/book/stack"
import { NameAvatar } from "~/components/user/name-avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import type { OfferSummary } from "~/adapters/offers"

const STATUS_OPTIONS = ["pending", "accepted", "declined", "cancelled"] as const

const STATUS_BADGE: Record<string, string> = {
    pending: "bg-warning text-warning-foreground",
    accepted: "bg-success text-success-foreground",
    declined: "bg-destructive/15 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[status] ?? "bg-muted text-muted-foreground"}`}
        >
            {status}
        </span>
    )
}

function UserInfo({ name }: { name: string | null }) {
    return (
        <div className="flex items-center gap-2">
            <NameAvatar name={name} size="sm" />
            <p className="text-sm font-medium">{name ?? "Unknown"}</p>
        </div>
    )
}

function toStackBooks(items: OfferSummary["offer_items"]) {
    return items.map((i) => ({
        work_id: i.work_id ?? i.listings?.id ?? "",
        title: i.books?.title ?? "",
        cover_url: i.books?.cover_url ?? null,
    }))
}

interface OfferListProps {
    offers: OfferSummary[]
    userId: string
    loading?: boolean
}

export function OfferList({ offers, userId, loading }: OfferListProps) {
    const navigate = useNavigate()
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(null)

    const filtered = offers.filter((o) => {
        const iAmProposer = o.proposer_id === userId
        const otherName =
            (iAmProposer ? o.recipient?.name : o.proposer?.name) ?? ""
        const matchesQuery = otherName
            .toLowerCase()
            .includes(query.toLowerCase())
        const matchesStatus = statusFilter === null || o.status === statusFilter
        return matchesQuery && matchesStatus
    })

    const controls = (
        <div className="flex items-center gap-2 flex-wrap">
            <FilterSearch
                value={query}
                onChange={setQuery}
                placeholder="Search by user..."
                className="max-w-xs"
            />
            <div className="flex items-center gap-1">
                <Button
                    size="sm"
                    variant={statusFilter === null ? "secondary" : "outline"}
                    onClick={() => setStatusFilter(null)}
                    className="rounded-full"
                >
                    All
                </Button>
                {STATUS_OPTIONS.map((s) => (
                    <Button
                        key={s}
                        size="sm"
                        variant={statusFilter === s ? "secondary" : "outline"}
                        onClick={() => setStatusFilter(s)}
                        className="rounded-full capitalize"
                    >
                        {s}
                    </Button>
                ))}
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner className="size-5 text-muted-foreground" />
            </div>
        )
    }

    if (offers.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No offers yet. Make an offer on a listing to get started.
            </p>
        )
    }

    return (
        <>
            {/* Mobile */}
            <div className="flex flex-col gap-4 md:hidden">
                {controls}
                {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No offers found.
                    </p>
                ) : (
                    filtered.map((offer) => {
                        const iAmProposer = offer.proposer_id === userId
                        const otherUser = iAmProposer
                            ? offer.recipient
                            : offer.proposer
                        const theyWant = toStackBooks(
                            offer.offer_items.filter((i) =>
                                iAmProposer
                                    ? i.side === "proposer"
                                    : i.side === "recipient",
                            ),
                        )
                        const youWant = toStackBooks(
                            offer.offer_items.filter((i) =>
                                iAmProposer
                                    ? i.side === "recipient"
                                    : i.side === "proposer",
                            ),
                        )

                        return (
                            <Link key={offer.id} to={`/offers/${offer.id}`}>
                                <Card className="p-5 flex flex-col gap-4 hover:bg-muted/70 transition-colors cursor-pointer">
                                    <div className="flex items-center justify-between gap-2">
                                        <UserInfo
                                            name={otherUser?.name ?? null}
                                        />
                                        <StatusBadge status={offer.status} />
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-border">
                                        <div className="flex flex-col gap-2 pr-4">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                They want
                                            </p>
                                            <BookStack
                                                books={theyWant}
                                                size="xs"
                                                maxVisible={Infinity}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 pl-4">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                You want
                                            </p>
                                            <BookStack
                                                books={youWant}
                                                size="xs"
                                                maxVisible={Infinity}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(
                                            offer.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </Card>
                            </Link>
                        )
                    })
                )}
            </div>

            {/* Desktop */}
            <div className="hidden md:block rounded-2xl overflow-hidden">
                <div className="px-4 pt-4 pb-2">{controls}</div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>With</TableHead>
                            <TableHead>They Want</TableHead>
                            <TableHead>You Want</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-sm text-muted-foreground"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((offer) => {
                                const iAmProposer = offer.proposer_id === userId
                                const otherUser = iAmProposer
                                    ? offer.recipient
                                    : offer.proposer
                                const theyWant = toStackBooks(
                                    offer.offer_items.filter((i) =>
                                        iAmProposer
                                            ? i.side === "proposer"
                                            : i.side === "recipient",
                                    ),
                                )
                                const youWant = toStackBooks(
                                    offer.offer_items.filter((i) =>
                                        iAmProposer
                                            ? i.side === "recipient"
                                            : i.side === "proposer",
                                    ),
                                )

                                return (
                                    <TableRow
                                        key={offer.id}
                                        className="cursor-pointer"
                                        onClick={() =>
                                            navigate(`/offers/${offer.id}`)
                                        }
                                    >
                                        <TableCell>
                                            <UserInfo
                                                name={otherUser?.name ?? null}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <BookStack
                                                books={theyWant}
                                                size="sm"
                                                maxVisible={Infinity}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <BookStack
                                                books={youWant}
                                                size="sm"
                                                maxVisible={Infinity}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                status={offer.status}
                                            />
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(
                                                offer.created_at,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}
