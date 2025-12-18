import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Custom middleware logic if needed
        // e.g. redirecting based on role
        // const token = req.nextauth.token;
        // const isAuth = !!token;
        // const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

        // if (isAuthPage) {
        //   if (isAuth) {
        //     return NextResponse.redirect(new URL("/dashboard", req.url));
        //   }
        //   return null;
        // }

        // if (!isAuth) {
        //   let from = req.nextUrl.pathname;
        //   if (req.nextUrl.search) {
        //     from += req.nextUrl.search;
        //   }
        //   return NextResponse.redirect(
        //     new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
        //   );
        // }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/settings/:path*",
        "/orders/:path*",
        "/messages/:path*",
        "/create-gig/:path*",
        "/checkout/:path*",
        "/profile/edit/:path*",
    ],
};
