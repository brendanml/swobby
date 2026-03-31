import { useEffect } from "react"
import {
    MapContainer,
    TileLayer,
    Marker,
    Circle,
    useMapEvents,
    useMap,
} from "react-leaflet"
import type { LeafletMouseEvent } from "leaflet"
import "leaflet/dist/leaflet.css"
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps"

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API as string

function ClickHandler({
    onChange,
}: {
    onChange: (lat: number, lng: number) => void
}) {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            onChange(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap()
    useEffect(() => {
        map.setView([lat, lng], map.getZoom(), { animate: false })
    }, [lat, lng])
    return null
}

function PlaceAutocomplete({
    onSelect,
    initialValue,
}: {
    onSelect: (lat: number, lng: number, address: string) => void
    initialValue?: string
}) {
    const places = useMapsLibrary("places")

    useEffect(() => {
        if (!places) return
        const input = document.getElementById(
            "place-autocomplete-input",
        ) as HTMLInputElement
        if (!input) return
        const autocomplete = new places.Autocomplete(input, {
            fields: ["geometry", "formatted_address"],
        })
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace()
            const loc = place.geometry?.location
            if (!loc) return
            onSelect(loc.lat(), loc.lng(), place.formatted_address ?? "")
            input.value = place.formatted_address ?? ""
        })
    }, [places])

    return (
        <input
            id="place-autocomplete-input"
            defaultValue={initialValue}
            placeholder="Search for a location..."
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
    )
}

export default function LocationPicker({
    lat,
    lng,
    address,
    radiusKm,
    onChange,
}: {
    lat: number
    lng: number
    address?: string
    radiusKm?: number
    onChange: (lat: number, lng: number, address: string) => void
}) {
    return (
        <div className="flex flex-col gap-2">
            <APIProvider apiKey={GOOGLE_API_KEY} libraries={["places"]}>
                <PlaceAutocomplete onSelect={onChange} initialValue={address} />
            </APIProvider>

            <div className="h-64 rounded-lg overflow-hidden isolate">
                <MapContainer
                    center={[lat, lng]}
                    zoom={11}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution=""
                    />
                    <ClickHandler onChange={(la, ln) => onChange(la, ln, "")} />
                    <MapFlyTo lat={lat} lng={lng} />
                    <Marker position={[lat, lng]} />
                    {radiusKm && (
                        <Circle
                            center={[lat, lng]}
                            radius={radiusKm * 1000}
                            pathOptions={{
                                color: "var(--primary-foreground)",
                                fillColor: "var(--primary)",
                                fillOpacity: 0.15,
                                weight: 1.5,
                            }}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    )
}
