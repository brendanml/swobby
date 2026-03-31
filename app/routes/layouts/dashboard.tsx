import { Link, Outlet, useNavigate, useLocation, matchPath } from "react-router"
import { useRef, useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { NAV_LINKS } from "~/utils/nav-links"
import { AppName } from "~/components/app-name"
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "~/components/ui/sidebar"
import { useAuth } from "~/context/auth"
import { useIsMobile } from "~/hooks/use-mobile"
import { useUser } from "~/context/user"
import { UserAvatar } from "~/components/user/avatar"
import { OfferPanel } from "~/components/offer/panel"
import { SignInModalProvider, useSignInModal } from "~/context/sign-in-modal"
import { BANNER_MESSAGE } from "~/config/banner"
import { Info, X } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover"

function AlphaBadge() {
    const [expanded, setExpanded] = useState(false)
    const isMobile = useIsMobile()

    const infoButton = (
        <button className="shrink-0 hover:opacity-70 transition-opacity cursor-pointer">
            <Info className="size-3.5" />
        </button>
    )

    return (
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-warning text-warning-foreground overflow-hidden transition-all duration-300">
            <span>alpha</span>
            {isMobile ? (
                <Popover>
                    <PopoverTrigger asChild>{infoButton}</PopoverTrigger>
                    <PopoverContent
                        align="start"
                        className="w-auto text-xs text-muted-foreground"
                    >
                        {BANNER_MESSAGE}
                    </PopoverContent>
                </Popover>
            ) : expanded ? (
                <>
                    <span className="animate-in fade-in slide-in-from-left-2 duration-300 font-normal">
                        — {BANNER_MESSAGE}
                    </span>
                    <button
                        onClick={() => setExpanded(false)}
                        className="shrink-0 hover:opacity-70 transition-opacity cursor-pointer"
                    >
                        <X className="size-3" />
                    </button>
                </>
            ) : (
                <button
                    onClick={() => setExpanded(true)}
                    className="shrink-0 hover:opacity-70 transition-opacity cursor-pointer"
                >
                    <Info className="size-3.5" />
                </button>
            )}
        </div>
    )
}

function AppSidebar() {
    const { setOpenMobile } = useSidebar()
    const { session } = useAuth()
    const { requireAuth } = useSignInModal()
    const location = useLocation()

    return (
        <Sidebar>
            <SidebarContent className="p-4 md:pt-16 pt-8">
                <SidebarMenu className="gap-1">
                    {NAV_LINKS.map(
                        ({
                            to,
                            label,
                            icon: Icon,
                            auth,
                            mobile,
                            desktop,
                            activeFor,
                        }) => {
                            const disabled = auth && !session
                            const patterns = activeFor ?? [to]
                            const isActive = patterns.some(
                                (p) => matchPath(p, location.pathname) !== null,
                            )
                            return (
                                <SidebarMenuItem
                                    key={to}
                                    className={
                                        !mobile
                                            ? "hidden md:block"
                                            : !desktop
                                              ? "md:hidden"
                                              : ""
                                    }
                                >
                                    <Link
                                        to={to}
                                        draggable={false}
                                        onClick={(e) => {
                                            if (disabled) {
                                                e.preventDefault()
                                                requireAuth(() => {})
                                                return
                                            }
                                            setOpenMobile(false)
                                        }}
                                    >
                                        <SidebarMenuButton
                                            isActive={isActive && !disabled}
                                            draggable="false"
                                            className={`hover:cursor-pointer h-10 md:h-8 ${
                                                disabled
                                                    ? "opacity-40"
                                                    : isActive
                                                      ? "text-primary-foreground font-semibold hover:bg-primary-bold bg-primary hover:text-primary-foreground"
                                                      : "text-muted-foreground hover:bg-sidebar-accent-muted hover:text-foreground"
                                            }`}
                                        >
                                            <Icon className="size-4 mr-2" />
                                            {label}
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            )
                        },
                    )}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

export default function DashboardLayout() {
    const { session, signIn } = useAuth()
    const { user, loading } = useUser()
    const navigate = useNavigate()
    const navRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (!loading && user && !user.onboarding_complete) {
            navigate("/setup", { replace: true })
        }
    }, [user, loading])

    useEffect(() => {
        if (!navRef.current) return
        const height = navRef.current.offsetHeight
        document.documentElement.style.setProperty(
            "--nav-height",
            `${height}px`,
        )
    }, [])

    if (loading || (!loading && user && !user.onboarding_complete))
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted-foreground border-t-transparent" />
            </div>
        )

    return (
        <SignInModalProvider>
            <SidebarProvider className="flex-col h-screen w-full overflow-hidden">
                <nav
                    ref={navRef}
                    className="flex items-center gap-2 px-4 py-2 border-b w-full shrink-0 relative z-20 bg-background"
                >
                    <SidebarTrigger className="text-muted-foreground md:hidden" />
                    <Link to="/" className="flex items-center gap-2">
                        <AppName className="text-xl" />
                    </Link>
                    <AlphaBadge />
                    <div className="flex-1" />
                    {session ? (
                        <UserAvatar name={user?.name ?? null} />
                    ) : (
                        <Button size="sm" onClick={signIn}>
                            Sign In
                        </Button>
                    )}
                </nav>

                <div className="flex flex-1 overflow-hidden">
                    <AppSidebar />
                    <main className="flex-1 overflow-hidden">
                        <Outlet />
                    </main>
                </div>
                <OfferPanel />
            </SidebarProvider>
        </SignInModalProvider>
    )
}
