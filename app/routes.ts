import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/landing.tsx"),
    route("sign-in", "routes/sign-in.tsx"),
    layout("routes/dashboard.tsx", [
        route("explore", "routes/explore.tsx"),
        route("listings/:id", "routes/listing.tsx"),
        route("listings/books/create", "routes/books-list.tsx"),
        route("listings/books/edit/:id", "routes/edit-listing.tsx"),
        route("listings/books/delete/:id", "routes/delete-listing.tsx"),
        route("wants/books/create", "routes/wants.tsx"),
        route("wants/edit/:id", "routes/edit-want.tsx"),
        route("wants/delete/:id", "routes/delete-want.tsx"),
        route("profile", "routes/profile.tsx"),
        route("users/:id", "routes/user.tsx"),
        route("exchanges", "routes/exchanges.tsx"),
        route("exchanges/:id", "routes/exchange.tsx"),
        route("library", "routes/library.tsx"),
        route("wants", "routes/my-wants.tsx"),
        route("messages", "routes/messages.tsx"),
    ]),
] satisfies RouteConfig;
