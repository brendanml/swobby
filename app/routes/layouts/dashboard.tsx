import { Link, Outlet, useNavigate, useLocation, matchPath } from "react-router"
import { useRef, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { NAV_LINKS } from "~/utils/nav-links"
import { SwobbyWordmark } from "~/components/swobby-wordmark"
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
import { useUser } from "~/context/user"
import { UserAvatar } from "~/components/user/avatar"
import { OfferPanel } from "~/components/offer/panel"
import { RealtimeChat } from "~/components/chat/realtime"
import { useMessagePopover } from "~/hooks/use-message-popover"
import { SignInModalProvider, useSignInModal } from "~/context/sign-in-modal"
function NavBadgeNotification() {
    return <Badge variant="outline">beta</Badge>
}

function AppSidebar() {
    const { setOpenMobile } = useSidebar()
    const { session } = useAuth()
    const { requireAuth } = useSignInModal()
    const location = useLocation()

    return (
        <Sidebar>
            <SidebarContent className="p-4 md:pt-16 pt-8">
                <SidebarMenu className="">
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
    const showPopover = useMessagePopover()
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
                        <SwobbyWordmark className="text-2xl" />
                    </Link>
                    <NavBadgeNotification />
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
                {showPopover && (
                    <div className="fixed bottom-0 right-0 p-4 z-50">
                        <RealtimeChat variant="floating" />
                    </div>
                )}
            </SidebarProvider>
        </SignInModalProvider>
    )
}
