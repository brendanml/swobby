import { useLocation } from "react-router"
import { NAV_LINKS } from "~/utils/nav-links"

export function useMessagePopover(): boolean {
    const { pathname } = useLocation()
    const match = NAV_LINKS.find((link) => pathname.startsWith(link.to) && link.to !== "/")
        ?? NAV_LINKS.find((link) => link.to === "/" && pathname === "/")
    return match?.popover ?? true
}
