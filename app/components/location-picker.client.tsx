import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet"
import type { LeafletMouseEvent } from "leaflet"
import "leaflet/dist/leaflet.css"

interface NominatimResult {
    lat: string
    lon: string
    display_name: string
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            onChange(e.latlng.lat, e.latlng.lng)
        }
    })
    return null
}

function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap()
    useEffect(() => {
        map.flyTo([lat, lng], map.getZoom())
    }, [lat, lng])
    return null
}

export default function LocationPicker({ lat, lng, radiusKm, onChange }: {
    lat: number
    lng: number
    radiusKm?: number
    onChange: (lat: number, lng: number) => void
}) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<NominatimResult[]>([])
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setQuery(value)
        if (timer.current) clearTimeout(timer.current)
        if (!value) return setResults([])
        timer.current = setTimeout(async () => {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5`,
                { headers: { "Accept-Language": "en" } }
            )
            setResults(await res.json())
        }, 400)
    }

    function handleSelect(result: NominatimResult) {
        onChange(Number(result.lat), Number(result.lon))
        setQuery(result.display_name)
        setResults([])
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="relative">
                <input
                    value={query}
                    onChange={handleInput}
                    placeholder="Search address..."
                    className="w-full"
                />
                {results.length > 0 && (
                    <ul className="absolute z-[1000] w-full bg-background border rounded shadow mt-1 max-h-48 overflow-y-auto">
                        {results.map((r) => (
                            <li
                                key={r.display_name}
                                onClick={() => handleSelect(r)}
                                className="px-3 py-2 cursor-pointer hover:bg-muted text-sm"
                            >
                                {r.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="h-64 rounded overflow-hidden isolate">
                <MapContainer center={[lat, lng]} zoom={11} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution=""
                    />
                    <ClickHandler onChange={onChange} />
                    <MapFlyTo lat={lat} lng={lng} />
                    <Marker position={[lat, lng]} />
                    {radiusKm && (
                        <Circle
                            center={[lat, lng]}
                            radius={radiusKm * 1000}
                            pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.08, weight: 1.5 }}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    )
}
