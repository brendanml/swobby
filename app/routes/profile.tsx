import { useState, useEffect, lazy, Suspense } from "react"
import { supabase } from "~/lib/supabase/client"
import { latLngToH3 } from "~/adapters/matches"
import { getProfile, updateProfile } from "~/adapters/profiles"
import { getUserSettings, upsertUserSettings } from "~/adapters/user-settings"
import { useUser } from "~/context/user"
import { useAuth } from "~/context/auth"
import { useNavigate } from "react-router"
import { Page } from "~/components/page"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Slider } from "~/components/ui/slider"

const LocationPicker = lazy(() => import("~/components/location-picker.client"))

export default function Profile() {
    const { refresh } = useUser()
    const { signOut } = useAuth()
    const navigate = useNavigate()
    const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>>>(null)
    const [loading, setLoading] = useState(true)
    const [distance, setDistance] = useState(10)
    const [lat, setLat] = useState(45.5)
    const [lng, setLng] = useState(-73.6)
    const [address, setAddress] = useState("")
    const [confirmDelete, setConfirmDelete] = useState(false)

    async function handleDeleteAccount() {
        if (!confirmDelete) {
            setConfirmDelete(true)
            return
        }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.rpc("delete_user")
        await signOut()
        navigate("/")
    }

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return setLoading(false)
            const [profileData, settingsData] = await Promise.all([
                getProfile(supabase, user.id),
                getUserSettings(supabase, user.id),
            ])
            setProfile(profileData)
            setDistance(profileData?.distance_preference ?? 10)
            if (profileData?.lat) setLat(Number(profileData.lat))
            if (profileData?.lng) setLng(Number(profileData.lng))
            setAddress(settingsData?.formatted_address ?? "")
            setLoading(false)
        })
    }, [])

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const latVal = Number(formData.get("lat")) || null
        const lngVal = Number(formData.get("lng")) || null

        await Promise.all([
            updateProfile(supabase, user.id, {
                name: formData.get("name") as string | null,
                lat: latVal,
                lng: lngVal,
                h3_index: latVal && lngVal ? latLngToH3(latVal, lngVal) : null,
                distance_preference: Number(formData.get("distance_preference")) || null,
            }),
            upsertUserSettings(supabase, user.id, {
                formatted_address: address || null,
            }),
        ])

        refresh()
    }

    return (
        <Page>
            {loading ? (
                <div className="flex flex-col gap-6 max-w-md animate-pulse">
                    <div className="h-4 bg-muted rounded w-16" />
                    <div className="h-9 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-64 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-4 bg-muted rounded" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-md">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={profile?.name ?? ""} />
                    </div>

                    <input type="hidden" name="lat" value={lat} />
                    <input type="hidden" name="lng" value={lng} />

                    <div className="flex flex-col gap-2">
                        <Label>Location</Label>
                        <Suspense fallback={<div className="h-64 bg-muted rounded animate-pulse" />}>
                            <LocationPicker
                                lat={lat}
                                lng={lng}
                                address={address}
                                radiusKm={distance}
                                onChange={(la, ln, addr) => {
                                    setLat(la)
                                    setLng(ln)
                                    if (addr) setAddress(addr)
                                }}
                            />
                        </Suspense>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label>Distance Preference: {distance} km</Label>
                        <Slider
                            name="distance_preference"
                            min={3}
                            max={50}
                            step={1}
                            value={[distance]}
                            onValueChange={([v]) => setDistance(v)}
                        />
                    </div>

                    <Button type="submit" className="self-start">Save</Button>

                    <div className="border-t pt-6 mt-4">
                        <Button
                            type="button"
                            variant="destructive"
                            className="self-start"
                            onClick={handleDeleteAccount}
                        >
                            {confirmDelete ? "Are you sure? Click again to confirm" : "Delete Account"}
                        </Button>
                        {confirmDelete && (
                            <button
                                type="button"
                                className="ml-3 text-sm text-muted-foreground underline"
                                onClick={() => setConfirmDelete(false)}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}
        </Page>
    )
}
