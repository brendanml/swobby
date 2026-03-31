import type React from "react"
import { Compass, MessageCircle, BookOpen, User, ArrowLeftRight, BookPlus } from "lucide-react"

export type NavLink = {
    to: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    auth: boolean
    mobile: boolean
    desktop: boolean
    /** Extra path patterns that should also activate this nav item */
    activeFor?: string[]
}

export const EXPLORE: NavLink = {
    to: "/explore", label: "Explore", icon: Compass, auth: false, mobile: true, desktop: true,
    activeFor: ["/explore", "/listings/:id"],
}
export const MESSAGES: NavLink = {
    to: "/messages", label: "Messages", icon: MessageCircle, auth: true, mobile: false, desktop: true,
}
export const MY_LIBRARY: NavLink = {
    to: "/library", label: "My Library", icon: BookOpen, auth: true, mobile: true, desktop: true,
    activeFor: ["/library", "/listings/books/edit/:id", "/listings/books/delete/:id"],
}
export const MY_WANTS: NavLink = {
    to: "/wants", label: "My Wants", icon: BookPlus, auth: true, mobile: true, desktop: true,
    activeFor: ["/wants", "/wants/delete/:id"],
}
export const OFFERS: NavLink = {
    to: "/offers", label: "Offers", icon: ArrowLeftRight, auth: true, mobile: true, desktop: true,
    activeFor: ["/offers", "/offers/:id"],
}
export const PROFILE: NavLink = {
    to: "/profile", label: "Profile", icon: User, auth: true, mobile: true, desktop: true,
}

export const NAV_LINKS: NavLink[] = [EXPLORE, MESSAGES, MY_LIBRARY, MY_WANTS, OFFERS, PROFILE]
