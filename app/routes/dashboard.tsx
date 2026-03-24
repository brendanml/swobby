import { NavLink, Outlet, Link } from "react-router"
import { useRef, useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { NAV_LINKS } from "~/utils/nav-links"
import { APP_NAME } from "~/utils/config"
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
import { UserAvatar } from "~/components/user-avatar"
import { OfferPanel } from "~/components/offer-panel"
import { SignInModal } from "~/components/sign-in-modal"

function AppSidebar() {
    const { setOpenMobile } = useSidebar()
    const { session } = useAuth()
    const [showSignIn, setShowSignIn] = useState(false)

    return (
        <>
            <Sidebar>
                <SidebarContent className="p-4">
                    <SidebarMenu className="gap-1">
                        {NAV_LINKS.map(({ to, label, icon: Icon, auth, mobile, desktop }) => {
                            const disabled = auth && !session
                            return (
                                <SidebarMenuItem key={to} className={!mobile ? "hidden md:block" : !desktop ? "md:hidden" : ""}>
                                    <NavLink
                                        to={to}
                                        end
                                        onClick={(e) => {
                                            if (disabled) {
                                                e.preventDefault()
                                                setShowSignIn(true)
                                                return
                                            }
                                            setOpenMobile(false)
                                        }}
                                    >
                                        {({ isActive }) => (
                                            <SidebarMenuButton
                                                isActive={isActive && !disabled}
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
                        })}
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <SignInModal
                open={showSignIn}
                onClose={() => setShowSignIn(false)}
            />
        </>
    )
}

export default function DashboardLayout() {
    const { session, signIn } = useAuth()
    const { user } = useUser()
    const navRef = useRef<HTMLElement>(null)

    useEffect(() => {
        if (!navRef.current) return
        const height = navRef.current.offsetHeight
        document.documentElement.style.setProperty(
            "--nav-height",
            `${height}px`,
        )
    }, [])

    return (
        <SidebarProvider>
            <div className="flex flex-col h-screen w-full overflow-hidden">
                <nav
                    ref={navRef}
                    className="flex items-center gap-2 px-4 py-2 border-b w-full shrink-0 relative z-20 bg-background"
                >
                    <SidebarTrigger className="text-muted-foreground" />
                    <Link
                        to="/"
                        className="font-[--font-display] text-xl font-semibold tracking-tighter mr-2"
                    >
                        {APP_NAME}
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
            </div>
        </SidebarProvider>
    )
}
