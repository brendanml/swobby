import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { ArrowRight, Mail } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="text-foreground">
            <section className="max-w-2xl mx-auto px-6 pt-30 pb-16">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    What is swobby?
                </p>
                <h1 className="text-4xl font-semibold tracking-tight mb-6 leading-snug">
                    A not-for-profit platform for exchanging books locally.
                </h1>
                <div className="flex flex-col gap-4 text-muted-foreground leading-relaxed">
                    <p>
                        Swobby is an open source and free to use book exchanging
                        marketplace. No fees, no engagement optimizations, just
                        a simple way to upcycle books through your community.
                    </p>
                    <p>
                        Add books you have, books you're looking for, and have
                        swobby suggest ideal local exchanges.
                    </p>
                </div>
            </section>

            <section className="max-w-2xl mx-auto px-6 py-16 border-t">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-10">
                    Founder
                </p>
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                    <div className="shrink-0 md:block hidden">
                        <div className="h-36 w-36 rounded-full bg-muted overflow-hidden">
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
                            Books are meant to be shared. I built Swobby because
                            a great book sitting unread on a shelf is a small
                            tragedy, and the person who'd love it most probably
                            lives nearby. Upcycle your collection and keep
                            stories moving through your community.
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
                        <img
                            src="/uber-h3.png"
                            alt="Uber H3"
                            className="h-6 w-auto object-contain object-left mb-1"
                        />
                        <p className="font-medium text-sm">H3 Geospatial</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Uber's hexagonal indexing system powers locality
                            matching — users are bucketed into H3 cells so
                            results so matching based on like items isn't
                            exponentially computationally expensive.
                        </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <img
                            src="/open-library.png"
                            alt="Open Library"
                            className="h-6 w-auto object-contain object-left mb-1"
                        />
                        <p className="font-medium text-sm">Open Library</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Book metadata is sourced via Open Library Work IDs,
                            giving every listing a stable canonical identity
                            regardless of edition or publisher.
                        </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <img
                            src="/supabase.png"
                            alt="Supabase"
                            className="h-6 w-auto object-contain object-left mb-1"
                        />
                        <p className="font-medium text-sm">Supabase</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Postgres for storage, realtime subscriptions for
                            chat, and row-level security to keep user data
                            private by default.
                        </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <img
                            src="/rr_logo_light.png"
                            alt="React Router"
                            className="h-6 w-auto object-contain object-left mb-1"
                        />
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
                    <Button asChild className="rounded-full">
                        <Link to="/sign-in">
                            <ArrowRight className="size-4" />
                            Get Started
                        </Link>
                    </Button>
                    <Button variant="outline" className="rounded-full" asChild>
                        <Link to="/contact">
                            <Mail className="size-4" />
                            Get in Touch
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}
