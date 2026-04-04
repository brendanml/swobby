import { Link } from "react-router"
import { Button } from "~/components/ui/button"

export default function AboutPage() {
    return (
        <div className="text-foreground">
            {/* Section 1 — Who are we */}
            <section className="max-w-2xl mx-auto px-6 pt-30 pb-16">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    Who are we?
                </p>
                <h1 className="text-4xl font-semibold tracking-tight mb-6 leading-snug">
                    A not-for-profit platform for exchanging books locally.
                </h1>
                <div className="flex flex-col gap-4 text-muted-foreground leading-relaxed">
                    <p>
                        Swobby is open source and free to use. No fees, no
                        engagement optimizations, just a simple way to exchange
                        books with people in your neighbourhood.
                    </p>
                    <p>
                        Add what you have, what you're looking for, and have
                        swobby suggest ideal local exchanges.
                    </p>
                </div>
            </section>

            {/* Section 2 — Founded */}
            <section className="max-w-3xl mx-auto px-6 py-16 border-t">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-10">
                    Founded
                </p>
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                    <div className="shrink-0">
                        <div className="h-40 w-40 rounded-2xl bg-muted overflow-hidden">
                            <img
                                src="/headshot.png"
                                alt="Founder"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    ;(
                                        e.target as HTMLImageElement
                                    ).style.display = "none"
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 text-muted-foreground leading-relaxed">
                        <p className="text-foreground font-medium">
                            Brendan Lynch
                        </p>
                        <p>
                            Moving across the country, I had to offload my whole
                            collection of books. Everything I listed sold for
                            pennies on the dollar — and even then, the value
                            proposition for a meetup just didn't exist for a
                            single book. Swobby is the platform I wished
                            existed.
                        </p>
                    </div>
                </div>
            </section>

            <section className="max-w-2xl mx-auto px-6 py-16 border-t">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    Under the hood
                </p>
                <h2 className="text-2xl font-semibold tracking-tight mb-8">
                    Built on open technologies.
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-1.5">
                        <p className="font-medium text-sm">H3 Geospatial</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Uber's hexagonal indexing system powers locality
                            matching — users are bucketed into H3 cells so
                            results so matching based on like items isn't
                            exponentially computationally expensive.
                        </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="font-medium text-sm">Open Library</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Book metadata is sourced via Open Library Work IDs,
                            giving every listing a stable canonical identity
                            regardless of edition or publisher.
                        </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="font-medium text-sm">Supabase</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Postgres for storage, realtime subscriptions for
                            chat, and row-level security to keep user data
                            private by default.
                        </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <p className="font-medium text-sm">React Router 7</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Full-stack SSR with file-based routing, deployed to
                            Vercel's edge network for fast cold starts anywhere.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 4 — Looking ahead */}
            <section className="max-w-2xl mx-auto px-6 py-16 border-t mb-16">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    Looking ahead
                </p>
                <h2 className="text-2xl font-semibold tracking-tight mb-4">
                    Beyond books.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                    Books are just the beginning, board games are next. If it
                    sits on a shelf and can be shared, Swobby should support it.
                    We're building the infrastructure for local item exchange,
                    one category at a time.
                </p>
                <div className="flex gap-3">
                    <Button asChild>
                        <Link to="/sign-in">Get Started</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/contact">Get in Touch</Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}
