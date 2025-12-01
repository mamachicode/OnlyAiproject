import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const url = new URL(req.url);
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Paths that require subscription
  const protectedPaths = ["/creator", "/exclusive"];
  const needsProtection = protectedPaths.some(path => url.pathname.startsWith(path));

  // If not a protected route → continue normally
  if (!needsProtection) return NextResponse.next();

  // If not logged in → redirect to login
  if (!token?.email) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    // Query backend to verify subscription
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/user/subscription?email=${token.email}`);
    const data = await res.json();

    if (!data.subscribed) {
      return NextResponse.redirect(new URL("/subscribe", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware subscription check failed:", err);
    return NextResponse.redirect(new URL("/subscribe", req.url));
  }
}

export const config = {
  matcher: ["/creator/:path*", "/exclusive/:path*"],
};
