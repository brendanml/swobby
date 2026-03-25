import { NavLink, Outlet, Link, useNavigate } from "react-router"
import { useRef, useEffect } from "react"
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
import { useUser } from "~/context/user"
import { UserAvatar } from "~/components/user/avatar"
import { OfferPanel } from "~/components/offer/panel"
import { SignInModalProvider, useSignInModal } from "~/context/sign-in-modal"

function AppSidebar() {
    const { setOpenMobile } = useSidebar()
    const { session } = useAuth()
    const { requireAuth } = useSignInModal()

    return (
        <>
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
                            }) => {
                                const disabled = auth && !session
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
                                        <NavLink
                                            to={to}
                                            end
                                            onClick={(e) => {
                                                if (disabled) {
                                                    e.preventDefault()
                                                    requireAuth(() => {})
                                                    return
                                                }
                                                setOpenMobile(false)
                                            }}
                                        >
                                            {({ isActive }) => (
                                                <SidebarMenuButton
                                                    isActive={
                                                        isActive && !disabled
                                                    }
                                                    className={`hover:cursor-pointer ${
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
                                            )}
                                        </NavLink>
                                    </SidebarMenuItem>
                                )
                            },
                        )}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
        </>
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
                    <SidebarTrigger className="text-muted-foreground" />
                    <Link to="/">
                        <AppName className="text-xl mr-2" />
                    </Link>
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
