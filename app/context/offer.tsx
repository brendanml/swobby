import { createContext, useContext, useState } from "react"

type OfferContextType = {
    open: boolean
    theirId: string | null
    theirName: string | null
    preselectedMyWorkIds: string[]
    preselectedTheirWorkIds: string[]
    openOffer: (theirId: string, theirName: string | null, preselect?: { myWorkIds?: string[]; theirWorkIds?: string[] }) => void
    closeOffer: () => void
}

const OfferContext = createContext<OfferContextType>(null!)

export function OfferProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [theirId, setTheirId] = useState<string | null>(null)
    const [theirName, setTheirName] = useState<string | null>(null)
    const [preselectedMyWorkIds, setPreselectedMyWorkIds] = useState<string[]>([])
    const [preselectedTheirWorkIds, setPreselectedTheirWorkIds] = useState<string[]>([])

    function openOffer(id: string, name: string | null, preselect?: { myWorkIds?: string[]; theirWorkIds?: string[] }) {
        setTheirId(id)
        setTheirName(name)
        setPreselectedMyWorkIds(preselect?.myWorkIds ?? [])
        setPreselectedTheirWorkIds(preselect?.theirWorkIds ?? [])
        setOpen(true)
    }

    function closeOffer() {
        setOpen(false)
        setTheirId(null)
        setTheirName(null)
        setPreselectedMyWorkIds([])
        setPreselectedTheirWorkIds([])
    }

    return (
        <OfferContext.Provider value={{ open, theirId, theirName, preselectedMyWorkIds, preselectedTheirWorkIds, openOffer, closeOffer }}>
            {children}
        </OfferContext.Provider>
    )
}

export function useOffer() {
    return useContext(OfferContext)
}
