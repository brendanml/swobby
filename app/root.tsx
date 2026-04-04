import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router"
import { AuthProvider } from "./context/auth"
import { UserProvider } from "./context/user"
import { MessagesProvider } from "./context/messages"
import { OfferProvider } from "./context/offer"

import type { Route } from "./+types/root"
import "./app.css"

export const meta: Route.MetaFunction = () => [{ title: "swobby" }]

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    { rel: "icon", href: "/swobby.svg", type: "image/svg+xml" },
]

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <AuthProvider>
                    <UserProvider>
                        <OfferProvider>
                            <MessagesProvider>{children}</MessagesProvider>
                        </OfferProvider>
                    </UserProvider>
                </AuthProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    )
}

export default function App() {
    return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!"
    let details = "An unexpected error occurred."
    let stack: string | undefined

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error"
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message
        stack = error.stack
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    )
}
