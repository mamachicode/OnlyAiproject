// @ts-nocheck
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const url = new URL(req.url);
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Protect dashboard pages
  if (url.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Protect NSFW creator pages
  if (url.pathname.startsWith("/nsfw")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/nsfw/:path*"],
};
