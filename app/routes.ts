import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    route("setup", "routes/setup.tsx"),
    route("api/books", "routes/api/books.ts"),
    route("sign-in", "routes/signin.tsx"),
    layout("routes/layouts/root.tsx", [
        layout("routes/layouts/public.tsx", [
            index("routes/landing.tsx"),
            route("about", "routes/about.tsx"),
            route("contact", "routes/contact.tsx"),
        ]),
        layout("routes/layouts/dashboard.tsx", [
            route("explore", "routes/explore.tsx"),
            route("listings/:id", "routes/listings/detail.tsx"),
            route("listings/books/edit/:id", "routes/listings/edit.tsx"),
            route("listings/books/delete/:id", "routes/listings/delete.tsx"),
            route("wants/delete/:id", "routes/wants/delete.tsx"),
            route("profile", "routes/profile.tsx"),
            route("users/:id", "routes/user.tsx"),
            route("offers", "routes/offers/list.tsx"),
            route("offers/:id", "routes/offers/detail.tsx"),
            route("library", "routes/library.tsx"),
            route("wants", "routes/wants/list.tsx"),
            route("messages", "routes/messages.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
