import { Button } from "~/components/ui/button"
import { BookStack } from "~/components/book-stack"
import { UserProfile } from "~/components/user-profile"
import { useOffer } from "~/context/offer"
import type { SwapMatch } from "~/adapters/swaps"

function SwapItems({
    iHaveTheyWant,
    theyHaveIWant,
}: {
    iHaveTheyWant: SwapMatch["iHaveTheyWant"]
    theyHaveIWant: SwapMatch["theyHaveIWant"]
}) {
    return (
        <div className="flex gap-4">
            {iHaveTheyWant.length > 0 && (
                <>
                    <div className="flex flex-col gap-1.5">
                        <p className="text-xs text-muted-foreground">
                            They want
                        </p>
                        <BookStack books={iHaveTheyWant} />
                    </div>
                    {theyHaveIWant.length > 0 && (
                        <div className="w-px bg-border" />
                    )}
                </>
            )}
            {theyHaveIWant.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-muted-foreground">You want</p>
                    <BookStack books={theyHaveIWant} />
                </div>
            )}
        </div>
    )
}

export function SwapCard({ swap }: { swap: SwapMatch }) {
    const { openOffer } = useOffer()

    return (
        <div className="bg-muted/50 rounded-xl p-4 flex flex-col gap-3 shadow-md">
            <UserProfile
                id={swap.user.id}
                name={swap.user.name}
                subtitle={`${Math.max(1, Math.round(swap.distanceKm))} km`}
            />
            <SwapItems
                iHaveTheyWant={swap.iHaveTheyWant}
                theyHaveIWant={swap.theyHaveIWant}
            />
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
        </div>
    )
}
