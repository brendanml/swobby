import { Search } from "lucide-react"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

interface FilterSearchProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function FilterSearch({ value, onChange, placeholder = "Filter...", className }: FilterSearchProps) {
    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-8 h-8 text-sm"
            />
        </div>
    )
}
