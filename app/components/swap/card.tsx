import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { BookStack } from "~/components/book/stack"
import { UserProfile } from "~/components/user/profile"
import { useOffer } from "~/context/offer"
import type { SwapMatch } from "~/adapters/swaps"

export function SwapCard({ swap }: { swap: SwapMatch }) {
    const { openOffer } = useOffer()
    const total = swap.iHaveTheyWant.length + swap.theyHaveIWant.length

    return (
        <Card className="p-5 flex flex-col gap-4">
            {/* Top row: profile + item count */}
            <div className="flex items-center justify-between gap-2">
                <UserProfile
                    id={swap.user.id}
                    name={swap.user.name}
                    subtitle={`${Math.max(1, Math.round(swap.distanceKm))} km`}
                />
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                    {total} book{total !== 1 ? "s" : ""} in common
                </span>
            </div>

            {/* Middle row: two columns with center divider */}
            <div className="grid grid-cols-2 divide-x divide-border">
                <div className="flex flex-col gap-2 pr-4">
                    <p className="text-xs font-medium text-muted-foreground">
                        They want
                    </p>
                    {swap.iHaveTheyWant.length > 0 ? (
                        <BookStack books={swap.iHaveTheyWant} />
                    ) : (
                        <p className="text-xs text-muted-foreground/50 italic">
                            Nothing listed
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2 pl-4">
                    <p className="text-xs font-medium text-muted-foreground">
                        You want
                    </p>
                    {swap.theyHaveIWant.length > 0 ? (
                        <BookStack books={swap.theyHaveIWant} />
                    ) : (
                        <p className="text-xs text-muted-foreground/50 italic">
                            Nothing listed
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom row: full-width button */}
            <Button
                className="w-full"
                onClick={() =>
                    openOffer(swap.user.id, swap.user.name, {
                        myWorkIds: swap.iHaveTheyWant.map((b) => b.work_id),
                        theirWorkIds: swap.theyHaveIWant.map((b) => b.work_id),
                    })
                }
            >
                Make Offer
            </Button>
        </Card>
    )
}
