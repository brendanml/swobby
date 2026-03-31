import { useState, lazy, Suspense } from "react"
import { useNavigate } from "react-router"
import { supabase } from "~/lib/supabase/client"
import { latLngToH3 } from "~/adapters/matches"
import { updateProfile } from "~/adapters/profiles"
import { upsertUserSettings } from "~/adapters/user-settings"
import { useUser } from "~/context/user"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { APP_NAME } from "~/utils/config"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { FlaskConical } from "lucide-react"

const LocationPicker = lazy(() => import("~/components/location-picker.client"))

const GENRES = [
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Historical Fiction",
    "Literary Fiction",
    "Horror",
    "Non-Fiction",
    "Biography",
    "Self-Help",
    "Science",
    "Philosophy",
    "Humor",
    "Young Adult",
    "Children's",
    "Graphic Novel",
    "Poetry",
    "Travel",
    "Cooking",
]

const STEPS = ["Name", "Location", "Genres"]

export default function SetupPage() {
    const navigate = useNavigate()
    const { refresh } = useUser()
    const [step, setStep] = useState(0)
    const [name, setName] = useState("")
    const [lat, setLat] = useState(45.5)
    const [lng, setLng] = useState(-73.6)
    const [address, setAddress] = useState("")
    const [genres, setGenres] = useState<string[]>([])
    const [submitting, setSubmitting] = useState(false)

    function toggleGenre(genre: string) {
        setGenres((prev) =>
            prev.includes(genre)
                ? prev.filter((g) => g !== genre)
                : [...prev, genre],
        )
    }

    async function handleComplete() {
        setSubmitting(true)
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        await Promise.all([
            updateProfile(supabase, user.id, {
                name: name.trim() || null,
                lat,
                lng,
                h3_index: latLngToH3(lat, lng),
                genres,
                onboarding_complete: true,
            }),
            address
                ? upsertUserSettings(supabase, user.id, {
                      formatted_address: address,
                  })
                : Promise.resolve(),
        ])

        await refresh()
        navigate("/explore", { replace: true })
    }

    const canNext =
        step === 0 ? name.trim().length > 0 : step === 1 ? true : true

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md flex flex-col gap-8">
                {/* Header */}
                <div className="text-center">
                    <p className="font-font-display text-2xl font-semibold tracking-tighter mb-1">
                        {APP_NAME}
                    </p>
                    <p className="text-muted-foreground text-sm">
                        Let's get you set up
                    </p>
                </div>

                <Alert className="bg-warning border-warning-foreground/20 text-warning-foreground [&>svg]:text-warning-foreground">
                    <FlaskConical className="size-4" />
                    <AlertDescription>
                        <strong>swobby is in alpha.</strong> You can sign up
                        from anywhere, but we recommend being in the{" "}
                        <strong>Kitchener–Waterloo</strong> area to see real
                        local users and listings.
                    </AlertDescription>
                </Alert>

                <div className="flex items-center gap-2">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                            <div
                                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-primary-foreground" : "bg-muted"}`}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-6 select-none">
                    {step === 0 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    What's your name?
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    This is how other readers will see you.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="name">Display name</Label>
                                <Input
                                    id="name"
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        canNext &&
                                        setStep(1)
                                    }
                                    placeholder="Your name"
                                />
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Where are you?
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Used to find books near you. Never shared
                                    publicly.
                                </p>
                            </div>
                            <Suspense
                                fallback={
                                    <div className="h-80 bg-muted rounded-lg animate-pulse" />
                                }
                            >
                                <LocationPicker
                                    lat={lat}
                                    lng={lng}
                                    address={address}
                                    onChange={(la, ln, addr) => {
                                        setLat(la)
                                        setLng(ln)
                                        if (addr) setAddress(addr)
                                    }}
                                />
                            </Suspense>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    What do you like to read?
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Pick as many as you like.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {GENRES.map((genre) => {
                                    const selected = genres.includes(genre)
                                    return (
                                        <button
                                            key={genre}
                                            type="button"
                                            onClick={() => toggleGenre(genre)}
                                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                                selected
                                                    ? "bg-primary-foreground text-primary border-primary-foreground font-medium"
                                                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                                            }`}
                                        >
                                            {genre}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {step > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => setStep((s) => s - 1)}
                            className="flex-1"
                        >
                            Back
                        </Button>
                    )}
                    {step < STEPS.length - 1 ? (
                        <Button
                            className="flex-1"
                            disabled={!canNext}
                            onClick={() => setStep((s) => s + 1)}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            className="flex-1"
                            disabled={submitting}
                            onClick={handleComplete}
                        >
                            {submitting ? "Saving..." : "Get Started"}
                        </Button>
                    )}
                </div>

                {step === 1 && (
                    <button
                        type="button"
                        className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors -mt-4"
                        onClick={() => setStep(2)}
                    >
                        Skip for now
                    </button>
                )}
            </div>
        </div>
    )
}
