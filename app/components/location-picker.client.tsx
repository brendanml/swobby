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
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps"

const mapPinIcon = L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="var(--primary-foreground)" stroke="var(--primary-foreground)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="var(--primary)" stroke="var(--primary)"/></svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
})

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
                    <Marker position={[lat, lng]} icon={mapPinIcon} />
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
