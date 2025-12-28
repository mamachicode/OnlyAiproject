import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
  const { pathname } = req.nextUrl;

  // 🔥 1. ALWAYS ALLOW these routes
  if (
    pathname.startsWith("/auth") ||     // login, signup
    pathname.startsWith("/api/auth") || // NextAuth internal API
    pathname === "/" ||                 // homepage
    pathname.startsWith("/_next") ||    // Next.js internal
    pathname.startsWith("/static") ||   // static assets
    pathname.startsWith("/favicon")     // favicon
  ) {
    return NextResponse.next();
  }

  // 🔥 2. Get token (JWT)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 🔥 3. Protect creator & nsfw-only routes
  if (pathname.startsWith("/creator") || pathname.startsWith("/exclusive")) {
    if (!token?.email) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // TEMP: subscription gating placeholder
    const subscribed = token?.subscribed || false;
    if (!subscribed) {
      return NextResponse.redirect(new URL("/subscribe", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/creator/:path*",
    "/exclusive/:path*",
    "/(.*)",
  ],
};
