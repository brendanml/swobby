import { Compass, MessageCircle, BookOpen, Bookmark, PlusCircle, User, ArrowLeftRight, BookPlus } from "lucide-react"

export const EXPLORE = { to: "/explore", label: "Explore", icon: Compass, auth: false, popover: true, mobile: true, desktop: true }
export const MESSAGES = { to: "/messages", label: "Messages", icon: MessageCircle, auth: true, popover: false, mobile: false, desktop: true }
export const MY_LIBRARY = { to: "/library", label: "My Library", icon: BookOpen, auth: true, popover: true, mobile: true, desktop: true }
export const MY_WANTS = { to: "/wants", label: "Find Book", icon: BookPlus, auth: true, popover: true, mobile: true, desktop: true }
export const ADD_WANT = { to: "/wants/books/create", label: "Add Want", icon: PlusCircle, auth: true, popover: true, mobile: true, desktop: true }
export const ADD_BOOK = { to: "/listings/books/create", label: "Add Book", icon: PlusCircle, auth: true, popover: true, mobile: true, desktop: true }
export const OFFERS = { to: "/offers", label: "Offers", icon: ArrowLeftRight, auth: true, popover: true, mobile: true, desktop: true }
export const PROFILE = { to: "/profile", label: "Profile", icon: User, auth: true, popover: true, mobile: true, desktop: true }

export const NAV_LINKS = [EXPLORE, MESSAGES, MY_LIBRARY, MY_WANTS, OFFERS, PROFILE]
